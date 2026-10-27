"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, ScanSearch } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import {
  PhotoPager,
  PAGE_SIZE,
} from "@/components/photographer/PhotoPager";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import { usePhotographerJob } from "@/context/PhotographerJobContext";
import {
  discardReasonLabel,
  formatConfidence,
  listPhotographerPhotos,
  ocrBatchRates,
  primaryBib,
  processPendingPhotos,
  statusLabel,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastInfo } from "@/lib/toast";

type PagedSlice = { items: PhotoListItemDto[]; total: number; page: number };
type ListTab = "matched" | "pending" | "discarded";

export default function PhotographerOcrPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const { ocrRunning, startOcrScan } = usePhotographerJob();
  const [pending, setPending] = useState<PagedSlice>({
    items: [],
    total: 0,
    page: 1,
  });
  const [matched, setMatched] = useState<PagedSlice>({
    items: [],
    total: 0,
    page: 1,
  });
  const [discarded, setDiscarded] = useState<PagedSlice>({
    items: [],
    total: 0,
    page: 1,
  });
  const [reviewTotal, setReviewTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [listTab, setListTab] = useState<ListTab>("pending");

  const refresh = useCallback(
    async (
      eid: string,
      pendingPage = pending.page,
      matchedPage = matched.page,
      discardedPage = discarded.page
    ) => {
      if (!eid) {
        setPending({ items: [], total: 0, page: 1 });
        setMatched({ items: [], total: 0, page: 1 });
        setDiscarded({ items: [], total: 0, page: 1 });
        setReviewTotal(0);
        return;
      }
      setLoadingLists(true);
      try {
        const [p, m, d, r] = await Promise.all([
          listPhotographerPhotos(eid, "pending", pendingPage, PAGE_SIZE),
          listPhotographerPhotos(eid, "matched", matchedPage, PAGE_SIZE),
          listPhotographerPhotos(eid, "discarded", discardedPage, PAGE_SIZE),
          listPhotographerPhotos(eid, "review", 1, 1),
        ]);
        setPending({ items: p.items, total: p.total, page: p.page });
        setMatched({ items: m.items, total: m.total, page: m.page });
        setDiscarded({ items: d.items, total: d.total, page: d.page });
        setReviewTotal(r.total);
      } catch (e) {
        toastError(e, "Không tải dữ liệu OCR.");
      } finally {
        setLoadingLists(false);
      }
    },
    [pending.page, matched.page, discarded.page]
  );

  useEffect(() => {
    if (eventId)
      void refresh(eventId, pending.page, matched.page, discarded.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, pending.page, matched.page, discarded.page]);

  // Soft refresh lists while OCR job runs in layout context
  useEffect(() => {
    if (!eventId || !ocrRunning) return;
    const id = setInterval(() => {
      void refresh(eventId, pending.page, matched.page, discarded.page);
    }, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, ocrRunning]);

  const rates = ocrBatchRates(matched.total, reviewTotal, discarded.total);

  const onProcess = async () => {
    if (!eventId) return;
    setBusy(true);
    try {
      const res = await processPendingPhotos(eventId);
      toastInfo(`Đã enqueue ${res.queuedCount} ảnh vào OCR.`);
      await refresh(eventId, 1, matched.page, discarded.page);
      startOcrScan(eventId, res.queuedCount);
      setListTab("matched");
    } catch (e) {
      toastError(e, "Process thất bại.");
    } finally {
      setBusy(false);
    }
  };

  const activeSlice =
    listTab === "matched"
      ? matched
      : listTab === "pending"
        ? pending
        : discarded;

  const tabs: { id: ListTab; label: string; count: number }[] = [
    { id: "pending", label: "Chờ xử lý", count: pending.total },
    { id: "matched", label: "Đã khớp", count: matched.total },
    { id: "discarded", label: "Đã loại", count: discarded.total },
  ];

  return (
    <RouteTab tab="ocr">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <ScanSearch className="h-7 w-7 text-cyan-500" />
              Nhận diện BIB
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enqueue ảnh pending → OCR service → callback khớp roster. Thanh
              tiến trình giữ khi chuyển mục khác.
            </p>
          </div>
          <button
            type="button"
            disabled={!eventId || busy || ocrRunning || pending.total === 0}
            onClick={() => void onProcess()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy || ocrRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Chạy OCR ({pending.total})
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Chờ / queue", value: pending.total, tone: "text-amber-600" },
            { label: "Đã khớp", value: matched.total, tone: "text-emerald-600" },
            { label: "Cần review", value: reviewTotal, tone: "text-amber-700" },
            {
              label: "Đã loại",
              value: discarded.total,
              tone: "text-rose-600",
            },
            {
              label: "Đang tải",
              value: loadingLists ? "…" : "OK",
              tone: "text-cyan-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <p className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {rates.processed > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
            <p className="font-extrabold text-slate-900">
              Tỉ lệ batch (đã xử lý {rates.processed})
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Khớp {rates.matchPct}% · Review {rates.reviewPct}% · Loại{" "}
              {rates.rejectPct}%
              {rates.estPrecision > 0 ? (
                <>
                  {" "}
                  · Ước lượng precision auto (khớp / khớp+review):{" "}
                  <span className="font-bold text-cyan-700">
                    {rates.estPrecision}%
                  </span>
                </>
              ) : null}
              . Conf từng ảnh = điểm Paddle (+ prior nhẹ),{" "}
              <span className="font-semibold">không bao giờ 100%</span>.
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setListTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  listTab === t.id
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}{" "}
                <span className="opacity-80">({t.count})</span>
              </button>
            ))}
          </div>

          <PhotoTable
            title=""
            items={activeSlice.items}
            empty={
              listTab === "matched"
                ? "Chưa có ảnh matched."
                : listTab === "pending"
                  ? "Không còn ảnh pending."
                  : "Chưa có ảnh discarded."
            }
            page={activeSlice.page}
            total={activeSlice.total}
            loading={loadingLists}
            showReason={listTab === "discarded"}
            onPage={(p) => {
              if (listTab === "matched")
                setMatched((m) => ({ ...m, page: p }));
              else if (listTab === "pending")
                setPending((x) => ({ ...x, page: p }));
              else setDiscarded((x) => ({ ...x, page: p }));
            }}
          />
        </div>
      </div>
    </RouteTab>
  );
}

function PhotoTable({
  title,
  items,
  empty,
  page,
  total,
  loading,
  onPage,
  showReason,
}: {
  title: string;
  items: PhotoListItemDto[];
  empty: string;
  page: number;
  total: number;
  loading?: boolean;
  onPage: (page: number) => void;
  showReason?: boolean;
}) {
  return (
    <div>
      {title ? (
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">
          {title}
          <span className="ml-2 font-semibold text-slate-400">{total}</span>
        </h2>
      ) : null}
      {!items.length ? (
        <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-2 font-semibold">Ảnh</th>
                  {!showReason ? (
                    <>
                      <th className="px-2 py-2 font-semibold">BIB</th>
                      <th className="px-2 py-2 font-semibold">Conf</th>
                    </>
                  ) : null}
                  <th className="px-2 py-2 font-semibold">Status</th>
                  {showReason ? (
                    <th className="px-2 py-2 font-semibold">Lý do</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const tag = [...(p.tags || [])].sort(
                    (a, b) => b.confidence - a.confidence
                  )[0];
                  return (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="px-2 py-2">
                        <a
                          href={mediaOpenUrl(p.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block h-11 w-11 overflow-hidden rounded-lg border border-slate-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaOpenUrl(p.url)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </a>
                      </td>
                      {!showReason ? (
                        <>
                          <td className="px-2 py-2 font-mono font-bold text-cyan-700">
                            {primaryBib(p)}
                          </td>
                          <td className="px-2 py-2 text-slate-600">
                            {tag ? formatConfidence(tag.confidence) : "—"}
                          </td>
                        </>
                      ) : null}
                      <td className="px-2 py-2 text-xs font-semibold text-slate-600">
                        {statusLabel(p.status)}
                      </td>
                      {showReason ? (
                        <td className="px-2 py-2 text-sm text-rose-600">
                          {discardReasonLabel(p.discardReason)}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PhotoPager
            page={page}
            total={total}
            disabled={loading}
            onChange={onPage}
          />
        </>
      )}
    </div>
  );
}
