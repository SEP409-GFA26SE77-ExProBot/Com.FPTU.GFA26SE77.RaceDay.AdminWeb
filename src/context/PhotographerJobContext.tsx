"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { listPhotographerPhotos } from "@/api/photo";
import { toastSuccess } from "@/lib/toast";
import { TaskProgressBar } from "@/components/photographer/TaskProgressBar";

export type PhotographerJob = {
  kind: "ocr" | "upload";
  label: string;
  percent: number;
  etaSeconds: number | null;
  detail: string | null;
  eventId: string;
};

type PersistedOcrJob = {
  eventId: string;
  target: number;
  startedAt: number;
};

type Ctx = {
  job: PhotographerJob | null;
  ocrRunning: boolean;
  uploadRunning: boolean;
  startOcrScan: (eventId: string, queuedCount: number) => void;
  /** Sau F5: nếu còn pending mà mất bar → gắn lại thanh tiến trình. */
  resumeOcrIfPending: (eventId: string) => Promise<void>;
  updateUploadProgress: (patch: {
    eventId: string;
    fileCount: number;
    percent: number;
    etaSeconds: number | null;
  }) => void;
  clearUploadJob: () => void;
};

const OCR_STORAGE_KEY = "raceday.photographer.ocrJob.v1";
const PhotographerJobContext = createContext<Ctx | null>(null);

function readPersistedOcr(): PersistedOcrJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OCR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedOcrJob;
    if (
      !parsed?.eventId ||
      !Number.isFinite(parsed.target) ||
      parsed.target <= 0 ||
      !Number.isFinite(parsed.startedAt)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedOcr(job: PersistedOcrJob) {
  try {
    sessionStorage.setItem(OCR_STORAGE_KEY, JSON.stringify(job));
  } catch {
    // ignore quota / private mode
  }
}

function clearPersistedOcr() {
  try {
    sessionStorage.removeItem(OCR_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function PhotographerJobProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<PhotographerJob | null>(null);
  const [mounted, setMounted] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTarget = useRef(0);
  const scanStartedAt = useRef(0);
  const scanEventId = useRef("");
  const pollGeneration = useRef(0);
  /** Sliding window (done, ts) — tránh ETA phình khi 1 ảnh chậm (elapsed/done cũ). */
  const ocrSamples = useRef<{ at: number; done: number }[]>([]);
  const ocrRate = useRef<number | null>(null);
  const ocrEtaSmooth = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stopOcrPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const finishOcrSuccess = useCallback(
    (eventId: string, target: number) => {
      clearPersistedOcr();
      stopOcrPoll();
      setJob({
        kind: "ocr",
        eventId,
        label: "OCR hoàn tất",
        percent: 100,
        etaSeconds: 0,
        detail: `Đã xử lý ${target} ảnh`,
      });
      toastSuccess("OCR batch hoàn tất.");
      window.setTimeout(() => {
        setJob((cur) =>
          cur?.kind === "ocr" && cur.percent === 100 ? null : cur
        );
      }, 2500);
    },
    [stopOcrPoll]
  );

  const beginOcrPoll = useCallback(
    (eventId: string, target: number, startedAt: number) => {
      if (!eventId || target <= 0) return;

      stopOcrPoll();
      scanEventId.current = eventId;
      scanTarget.current = target;
      scanStartedAt.current = startedAt;
      ocrSamples.current = [];
      ocrRate.current = null;
      ocrEtaSmooth.current = null;
      writePersistedOcr({ eventId, target, startedAt });

      setJob({
        kind: "ocr",
        eventId,
        label: "Đang scan / OCR",
        percent: 2,
        etaSeconds: null,
        detail: `Đã enqueue ${target} ảnh — worker đang xử lý…`,
      });

      const gen = ++pollGeneration.current;

      const tick = async () => {
        if (gen !== pollGeneration.current) return;
        try {
          // "queue" = chưa xong thật; Failed không tính (tránh thanh treo ở 99%).
          const p = await listPhotographerPhotos(eventId, "queue", 1, 1);
          if (gen !== pollGeneration.current) return;

          const left = p.total;
          const done = Math.max(0, scanTarget.current - left);
          const pct =
            scanTarget.current > 0
              ? Math.min(99, Math.round((done / scanTarget.current) * 100))
              : 100;
          const now = Date.now();
          ocrSamples.current.push({ at: now, done });
          ocrSamples.current = ocrSamples.current.filter(
            (s) => now - s.at <= 45_000
          );

          let etaSeconds: number | null = null;
          const samples = ocrSamples.current;
          if (samples.length >= 2 && done >= 3) {
            const first = samples[0];
            const last = samples[samples.length - 1];
            const dDone = last.done - first.done;
            const dSec = (last.at - first.at) / 1000;
            if (dDone >= 2 && dSec >= 8) {
              ocrRate.current = dDone / dSec;
            }
          }
          if (ocrRate.current && ocrRate.current > 0 && left > 0) {
            const raw = left / ocrRate.current;
            const prev = ocrEtaSmooth.current;
            // EMA + chặn nhảy lên đột ngột (ảnh chậm không làm ETA x2–3).
            etaSeconds =
              prev == null
                ? raw
                : Math.min(prev * 1.15, prev * 0.65 + raw * 0.35);
            ocrEtaSmooth.current = etaSeconds;
          }

          setJob({
            kind: "ocr",
            eventId,
            label: "Đang scan / OCR",
            percent: Math.max(pct, 5),
            etaSeconds,
            detail: `Đã xong ~${done}/${scanTarget.current} · còn ${left} pending`,
          });

          if (left === 0) {
            finishOcrSuccess(eventId, scanTarget.current);
          }
        } catch {
          // keep bar; next tick retries
        }
      };

      void tick();
      pollRef.current = setInterval(() => void tick(), 2500);
    },
    [finishOcrSuccess, stopOcrPoll]
  );

  const startOcrScan = useCallback(
    (eventId: string, queuedCount: number) => {
      beginOcrPoll(eventId, queuedCount, Date.now());
    },
    [beginOcrPoll]
  );

  const resumeOcrIfPending = useCallback(
    async (eventId: string) => {
      if (!eventId) return;
      // Đang poll OCR rồi thì thôi
      if (pollRef.current && scanEventId.current === eventId) return;

      const saved = readPersistedOcr();
      if (saved && saved.eventId === eventId) {
        beginOcrPoll(saved.eventId, saved.target, saved.startedAt);
        return;
      }

      try {
        const p = await listPhotographerPhotos(eventId, "queue", 1, 1);
        if (p.total <= 0) {
          clearPersistedOcr();
          return;
        }
        // Không có snapshot — ước lượng theo còn trong hàng chạy
        beginOcrPoll(eventId, p.total, Date.now());
      } catch {
        // ignore
      }
    },
    [beginOcrPoll]
  );

  // F5 / remount: khôi phục từ sessionStorage
  useEffect(() => {
    const saved = readPersistedOcr();
    if (saved) {
      beginOcrPoll(saved.eventId, saved.target, saved.startedAt);
    }
    // chỉ chạy 1 lần khi mount provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUploadProgress = useCallback(
    (patch: {
      eventId: string;
      fileCount: number;
      percent: number;
      etaSeconds: number | null;
    }) => {
      setJob({
        kind: "upload",
        eventId: patch.eventId,
        label: `Đang tải lên ${patch.fileCount} ảnh`,
        percent: patch.percent,
        etaSeconds: patch.etaSeconds,
        detail: "Giữ trang / đợi xong — F5 sẽ hủy request upload.",
      });
    },
    []
  );

  const clearUploadJob = useCallback(() => {
    setJob((cur) => (cur?.kind === "upload" ? null : cur));
  }, []);

  // Không stop poll khi Strict Mode remount nhầm — chỉ clear khi unmount thật sự
  // bằng generation bump + clear interval ở cleanup.
  useEffect(() => {
    return () => {
      pollGeneration.current += 1;
      stopOcrPoll();
    };
  }, [stopOcrPoll]);

  const value = useMemo<Ctx>(
    () => ({
      job,
      ocrRunning: job?.kind === "ocr" && (job.percent ?? 0) < 100,
      uploadRunning: job?.kind === "upload",
      startOcrScan,
      resumeOcrIfPending,
      updateUploadProgress,
      clearUploadJob,
    }),
    [
      job,
      startOcrScan,
      resumeOcrIfPending,
      updateUploadProgress,
      clearUploadJob,
    ]
  );

  return (
    <PhotographerJobContext.Provider value={value}>
      {children}
      {mounted ? <PhotographerJobDockPortal /> : null}
    </PhotographerJobContext.Provider>
  );
}

function PhotographerJobDockPortal() {
  const { job } = usePhotographerJob();
  if (!job || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[10050] w-[min(100vw-2rem,22rem)] sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <div className="pointer-events-auto rounded-2xl shadow-xl shadow-emerald-900/15 ring-1 ring-emerald-200/70">
        <TaskProgressBar
          label={job.label}
          percent={job.percent}
          etaSeconds={job.etaSeconds}
          detail={job.detail}
        />
      </div>
    </div>,
    document.body
  );
}

/** @deprecated dùng portal trong provider — giữ export để layout cũ không gãy. */
export function PhotographerJobBanner() {
  return null;
}

export function usePhotographerJob() {
  const ctx = useContext(PhotographerJobContext);
  if (!ctx) {
    throw new Error(
      "usePhotographerJob must be used within PhotographerJobProvider"
    );
  }
  return ctx;
}
