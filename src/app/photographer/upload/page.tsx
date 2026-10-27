"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import {
  PhotoPager,
  PAGE_SIZE,
} from "@/components/photographer/PhotoPager";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import { usePhotographerJob } from "@/context/PhotographerJobContext";
import {
  bulkUploadPhotos,
  listPhotographerPhotos,
  primaryBib,
  statusLabel,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastInfo, toastSuccess, toastWarn } from "@/lib/toast";
import { setNavBlocker } from "@/lib/nav-guard";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 25 * 1024 * 1024;

function statusTone(status: string) {
  if (status === "matched" || status === "manual_corrected")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "processing" || status === "queued")
    return "bg-amber-50 text-amber-800 border-amber-200";
  if (status === "failed" || status === "discarded")
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function PhotographerUploadPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const { updateUploadProgress, clearUploadJob } = usePhotographerJob();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadStartedAt = useRef<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PhotoListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(false);

  const loadList = useCallback(async (eid: string, p: number) => {
    if (!eid) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoadingList(true);
    try {
      const res = await listPhotographerPhotos(eid, "pending", p, PAGE_SIZE);
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e) {
      toastError(e, "Không tải danh sách pending.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void loadList(eventId, page);
  }, [eventId, page, loadList]);

  // Block SPA nav + warn on tab close — leave mid-upload can abort/fail request
  useEffect(() => {
    setNavBlocker(() =>
      busy
        ? "Đang upload ảnh — đợi xong rồi mới chuyển mục (ra giữa chừng dễ fail)."
        : null
    );
    return () => setNavBlocker(null);
  }, [busy]);

  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [busy]);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!eventId) {
      toastError("Chưa có giải được phân công.");
      return;
    }
    if (busy) {
      toastWarn("Đang upload — vui lòng đợi xong trước khi chuyển mục.");
      return;
    }
    const list = Array.from(files).filter((f) => f.size > 0);
    if (!list.length) return;

    const tooBig = list.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) {
      toastWarn(`${tooBig.length} file vượt 25MB — bỏ qua các file đó.`);
    }
    const ok = list.filter((f) => f.size <= MAX_BYTES);
    if (!ok.length) return;

    setBusy(true);
    uploadStartedAt.current = Date.now();
    updateUploadProgress({
      eventId,
      fileCount: ok.length,
      percent: 0,
      etaSeconds: null,
    });
    toastInfo(`Bắt đầu upload ${ok.length} ảnh…`);

    try {
      const res = await bulkUploadPhotos(eventId, ok, undefined, (pct) => {
        const elapsed = (Date.now() - uploadStartedAt.current) / 1000;
        let eta: number | null = null;
        if (pct > 3 && elapsed > 0.4) {
          eta = ((100 - pct) / pct) * elapsed;
        }
        updateUploadProgress({
          eventId,
          fileCount: ok.length,
          percent: pct,
          etaSeconds: eta,
        });
      });
      updateUploadProgress({
        eventId,
        fileCount: ok.length,
        percent: 100,
        etaSeconds: 0,
      });
      toastSuccess(
        `Đã nhận ${res.accepted} ảnh` +
          (res.skippedDuplicate ? ` · bỏ trùng ${res.skippedDuplicate}` : "")
      );
      setPage(1);
      await loadList(eventId, 1);
    } catch (e) {
      toastError(e, "Upload thất bại. Nếu vừa chuyển trang, request đã bị hủy.");
    } finally {
      setBusy(false);
      clearUploadJob();
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <RouteTab tab="upload">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Upload className="h-7 w-7 text-cyan-500" />
            Tải ảnh lên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bulk upload vào giải được Organizer gán. Ảnh vào hàng pending rồi
            enqueue OCR. Không chuyển mục khi đang upload — request sẽ fail.
          </p>
        </div>

        <AssignmentBanner
          assignment={assignment}
          loading={loading}
          error={error}
          onRefresh={() => {
            void reload();
            if (eventId) void loadList(eventId, page);
          }}
        />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) {
                void uploadFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => eventId && !busy && inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
              dragOver
                ? "border-cyan-400 bg-cyan-50"
                : "border-cyan-200/70 bg-gradient-to-b from-cyan-50/40 to-white hover:border-cyan-300"
            } ${!eventId || busy ? "pointer-events-none opacity-60" : ""}`}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
              {busy ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <ImagePlus className="h-7 w-7" />
              )}
            </div>
            <p className="text-base font-bold text-slate-900">
              {busy ? "Đang tải lên…" : "Kéo thả ảnh hoặc bấm để chọn"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPG / PNG / WEBP · tối đa 25MB/file · ≤500 ảnh/lần (chia lô tự động)
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void uploadFiles(e.target.files);
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-900">
              Hàng chờ OCR
              <span className="ml-2 font-semibold text-slate-400">{total}</span>
            </h2>
            {loadingList ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            ) : null}
          </div>

          {!items.length ? (
            <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              Chưa có ảnh pending. Upload để bắt đầu.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <a
                      href={mediaOpenUrl(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaOpenUrl(p.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </a>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-slate-500">
                        {p.id.slice(0, 8)}…
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        BIB: {primaryBib(p)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusTone(p.status)}`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </li>
                ))}
              </ul>
              <PhotoPager
                page={page}
                total={total}
                disabled={loadingList}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </RouteTab>
  );
}
