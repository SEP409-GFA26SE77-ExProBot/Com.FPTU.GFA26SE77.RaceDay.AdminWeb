"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  discardReasonLabel,
  listPhotographerPhotos,
  ocrBatchRates,
  primaryBib,
  type PhotoListItemDto,
} from "@/api/photo";
import { toastError, toastSuccess } from "@/lib/toast";

type Bucket =
  | "pending"
  | "queue"
  | "matched"
  | "ready"
  | "published"
  | "review"
  | "discarded";

type Stats = Record<Bucket, number>;

const EMPTY: Stats = {
  pending: 0,
  queue: 0,
  matched: 0,
  ready: 0,
  published: 0,
  review: 0,
  discarded: 0,
};

function csvEscape(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Fetch up to maxPages of a bucket (pageSize 100) for export. */
async function fetchBucketPages(
  eid: string,
  bucket: Bucket,
  maxPages = 5
): Promise<PhotoListItemDto[]> {
  const out: PhotoListItemDto[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await listPhotographerPhotos(eid, bucket, page, 100);
    out.push(...res.items);
    if (out.length >= res.total || !res.items.length) break;
  }
  return out;
}

export default function PhotographerAnalyticsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setStats(EMPTY);
      return;
    }
    setBusy(true);
    try {
      const buckets: Bucket[] = [
        "pending",
        "queue",
        "matched",
        "ready",
        "published",
        "review",
        "discarded",
      ];
      const pages = await Promise.all(
        buckets.map((b) => listPhotographerPhotos(eid, b, 1, 1))
      );
      const next = { ...EMPTY };
      buckets.forEach((b, i) => {
        next[b] = pages[i].total;
      });
      setStats(next);
    } catch (e) {
      toastError(e, "Không tải thống kê.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const rates = useMemo(
    () => ocrBatchRates(stats.matched, stats.review, stats.discarded),
    [stats.matched, stats.review, stats.discarded]
  );

  const pipelineTotal =
    stats.pending +
    stats.queue +
    stats.matched +
    stats.ready +
    stats.published +
    stats.review +
    stats.discarded;

  const pctOf = (n: number, den: number) =>
    den > 0 ? Math.round((n / den) * 100) : 0;

  const cards: {
    label: string;
    value: number;
    bar: number;
    color: string;
    hint?: string;
  }[] = [
    {
      label: "Chờ OCR",
      value: stats.pending,
      bar: pctOf(stats.pending, pipelineTotal),
      color: "bg-amber-400",
    },
    {
      label: "Đang xử lý",
      value: stats.queue,
      bar: pctOf(stats.queue, pipelineTotal),
      color: "bg-sky-400",
    },
    {
      label: "Đã khớp (matched)",
      value: stats.matched,
      bar: pctOf(stats.matched, pipelineTotal),
      color: "bg-emerald-400",
      hint: "Bucket raw sau OCR",
    },
    {
      label: "Chờ publish",
      value: stats.ready,
      bar: pctOf(stats.ready, pipelineTotal),
      color: "bg-cyan-500",
    },
    {
      label: "Đã public",
      value: stats.published,
      bar: pctOf(stats.published, pipelineTotal),
      color: "bg-teal-500",
    },
    {
      label: "Cần sửa",
      value: stats.review,
      bar: pctOf(stats.review, pipelineTotal),
      color: "bg-rose-400",
    },
    {
      label: "Đã loại",
      value: stats.discarded,
      bar: pctOf(stats.discarded, pipelineTotal),
      color: "bg-slate-400",
    },
  ];

  const exportCsv = async () => {
    if (!eventId) return;
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const eventName = assignment?.eventName || eventId;

      downloadCsv(`raceday-photo-stats-${stamp}.csv`, [
        ["metric", "value"],
        ["eventId", eventId],
        ["eventName", eventName],
        ["exportedAtUtc", new Date().toISOString()],
        ["pending", stats.pending],
        ["queue", stats.queue],
        ["matched", stats.matched],
        ["ready", stats.ready],
        ["published", stats.published],
        ["review", stats.review],
        ["discarded", stats.discarded],
        ["pipelineTotal", pipelineTotal],
        ["ocrProcessed", rates.processed],
        ["ocrMatchPct", rates.matchPct],
        ["ocrReviewPct", rates.reviewPct],
        ["ocrRejectPct", rates.rejectPct],
        ["estPrecisionPct", rates.estPrecision],
      ]);

      const detailBuckets: Bucket[] = [
        "ready",
        "published",
        "review",
        "discarded",
      ];
      const batches = await Promise.all(
        detailBuckets.map((b) => fetchBucketPages(eventId, b, 5))
      );
      const rows: string[][] = [
        [
          "bucket",
          "photoId",
          "status",
          "bib",
          "zone",
          "isPublished",
          "publishedAtUtc",
          "createdAtUtc",
          "discardReason",
          "url",
        ],
      ];
      detailBuckets.forEach((bucket, i) => {
        for (const p of batches[i]) {
          rows.push([
            bucket,
            p.id,
            p.status,
            primaryBib(p),
            p.zone || "",
            p.isPublished ? "true" : "false",
            p.publishedAtUtc || "",
            p.createdAtUtc || "",
            discardReasonLabel(p.discardReason),
            p.url || "",
          ]);
        }
      });
      downloadCsv(`raceday-photo-inventory-${stamp}.csv`, rows);
      toastSuccess(
        `Đã tải 2 CSV (stats + tối đa ~500 ảnh/bucket: ready/published/review/discarded).`
      );
    } catch (e) {
      toastError(e, "Xuất CSV thất bại.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <RouteTab tab="analytics">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <BarChart3 className="h-7 w-7 text-cyan-500" />
              Thống kê ảnh
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pipeline OCR/publish theo giải đang gán — xuất CSV tóm tắt + danh
              sách ảnh (không gọi API view/download riêng).
            </p>
          </div>
          <button
            type="button"
            disabled={!eventId || busy || exporting}
            onClick={() => void exportCsv()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Xuất CSV
          </button>
        </div>

        <AssignmentBanner
          assignment={assignment}
          loading={loading}
          error={error}
          onRefresh={() => {
            void reload();
            if (eventId) void refresh(eventId);
          }}
        />

        <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {busy ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : null}
          {cards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
              {s.hint ? (
                <p className="mt-0.5 text-[11px] text-slate-400">{s.hint}</p>
              ) : null}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${s.color}`}
                  style={{ width: `${s.bar}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-800">Tổng trong pipeline</p>
            <p className="mt-1 text-4xl font-black text-cyan-700">
              {pipelineTotal}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {assignment?.eventName || "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-800">
              Chất lượng OCR (ước lượng)
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Trên {rates.processed} ảnh đã xử lý (matched + review + discarded)
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-slate-400">Match</dt>
                <dd className="font-bold text-emerald-700">{rates.matchPct}%</dd>
              </div>
              <div>
                <dt className="text-slate-400">Review</dt>
                <dd className="font-bold text-rose-600">{rates.reviewPct}%</dd>
              </div>
              <div>
                <dt className="text-slate-400">Reject</dt>
                <dd className="font-bold text-slate-600">{rates.rejectPct}%</dd>
              </div>
              <div>
                <dt className="text-slate-400">Est. precision</dt>
                <dd className="font-bold text-cyan-700">
                  {rates.estPrecision}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </RouteTab>
  );
}
