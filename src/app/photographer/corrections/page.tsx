"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, Pencil, X, Ban } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import {
  PhotoPager,
  PAGE_SIZE,
} from "@/components/photographer/PhotoPager";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  correctPhotoBib,
  discardPhoto,
  formatConfidence,
  listPhotographerPhotos,
  primaryBib,
  statusLabel,
  type PhotoListItemDto,
  type PhotoTagDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastSuccess } from "@/lib/toast";

export default function PhotographerCorrectionsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [items, setItems] = useState<PhotoListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [detail, setDetail] = useState<PhotoListItemDto | null>(null);

  const refresh = useCallback(
    async (eid: string, p = page) => {
      if (!eid) {
        setItems([]);
        setTotal(0);
        return;
      }
      setLoadingList(true);
      try {
        const res = await listPhotographerPhotos(eid, "review", p, PAGE_SIZE);
        setItems(res.items);
        setTotal(res.total);
        setPage(res.page);
        const next: Record<string, string> = {};
        for (const photo of res.items) {
          next[photo.id] = primaryBib(photo) === "—" ? "" : primaryBib(photo);
        }
        setDrafts((prev) => ({ ...prev, ...next }));
        setDetail((cur) => {
          if (!cur) return null;
          const still = res.items.find((x) => x.id === cur.id);
          return still ?? null;
        });
      } catch (e) {
        toastError(e, "Không tải hàng review.");
      } finally {
        setLoadingList(false);
      }
    },
    [page]
  );

  useEffect(() => {
    if (eventId) void refresh(eventId, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when event/page changes
  }, [eventId, page]);

  const onSave = async (photoId: string) => {
    if (!eventId) return;
    const bib = (drafts[photoId] || "").trim();
    if (!bib) {
      toastError("Nhập BIB hợp lệ (vd A0020).");
      return;
    }
    setSavingId(photoId);
    try {
      await correctPhotoBib(eventId, photoId, bib);
      toastSuccess(`Đã sửa BIB → ${bib.toUpperCase()}`);
      setDetail(null);
      await refresh(eventId, page);
    } catch (e) {
      toastError(e, "Sửa BIB thất bại.");
    } finally {
      setSavingId(null);
    }
  };

  const onReject = async (photoId: string) => {
    if (!eventId) return;
    if (!window.confirm("Reject ảnh này? Ảnh sẽ bị loại (discarded), không search được.")) {
      return;
    }
    setSavingId(photoId);
    try {
      await discardPhoto(eventId, photoId, "photographer_reject");
      toastSuccess("Đã reject ảnh.");
      setDetail(null);
      await refresh(eventId, page);
    } catch (e) {
      toastError(e, "Reject thất bại.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RouteTab tab="corrections">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Pencil className="h-7 w-7 text-cyan-500" />
            Sửa BIB
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ảnh needs_review / runner_reported — xem chi tiết, sửa BIB hoặc
            reject.
          </p>
        </div>

        <AssignmentBanner
          assignment={assignment}
          loading={loading}
          error={error}
          onRefresh={() => {
            void reload();
            if (eventId) void refresh(eventId, page);
          }}
        />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              Hàng chờ sửa ({total})
            </h2>
            {loadingList ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            ) : null}
          </div>

          {!items.length ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Không có ảnh cần review.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => setDetail(p)}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white ring-offset-2 hover:ring-2 hover:ring-cyan-300"
                      title="Xem chi tiết"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaOpenUrl(p.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500">
                        {statusLabel(p.status)}
                        {p.zone ? ` · ${p.zone}` : ""}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700">
                        OCR:{" "}
                        <span className="font-mono font-bold text-rose-600">
                          {primaryBib(p)}
                        </span>
                        {p.tags?.[0] ? (
                          <span className="ml-2 text-xs text-slate-400">
                            {formatConfidence(p.tags[0].confidence)}
                          </span>
                        ) : null}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={drafts[p.id] ?? ""}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                          }
                          placeholder="A0020"
                          className="w-32 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        />
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => void onSave(p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
                        >
                          {savingId === p.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Lưu BIB
                        </button>
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => setDetail(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => void onReject(p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
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

      {detail && eventId ? (
        <CorrectionDetailPanel
          photo={detail}
          bibDraft={drafts[detail.id] ?? ""}
          onBibChange={(v) =>
            setDrafts((d) => ({ ...d, [detail.id]: v }))
          }
          busy={savingId === detail.id}
          onClose={() => setDetail(null)}
          onSave={() => void onSave(detail.id)}
          onReject={() => void onReject(detail.id)}
        />
      ) : null}
    </RouteTab>
  );
}

function CorrectionDetailPanel({
  photo,
  bibDraft,
  onBibChange,
  busy,
  onClose,
  onSave,
  onReject,
}: {
  photo: PhotoListItemDto;
  bibDraft: string;
  onBibChange: (v: string) => void;
  busy: boolean;
  onClose: () => void;
  onSave: () => void;
  onReject: () => void;
}) {
  const tags = [...(photo.tags || [])].sort(
    (a, b) => b.confidence - a.confidence
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/50 p-0 sm:p-4 sm:items-center sm:justify-center">
      <div
        role="dialog"
        aria-modal
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(90vh,820px)] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">
              Chi tiết review
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {statusLabel(photo.status)}
              {photo.zone ? ` · ${photo.zone}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex min-h-[220px] items-center justify-center bg-slate-950 p-3 lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaOpenUrl(photo.url)}
              alt="Race photo"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex min-h-0 flex-col overflow-y-auto border-t border-slate-100 p-4 lg:border-l lg:border-t-0">
            <h3 className="text-sm font-extrabold text-slate-900">
              BIB detect (OCR)
            </h3>
            {!tags.length ? (
              <p className="mt-2 text-sm text-slate-500">Không có tag OCR.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {tags.map((t: PhotoTagDto, i) => (
                  <li
                    key={`${t.bib}-${i}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-bold text-cyan-700">
                        {t.bib}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          t.confidence >= 0.85
                            ? "text-emerald-600"
                            : t.confidence >= 0.5
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {formatConfidence(t.confidence)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      source: {t.source}
                      {t.bboxJson ? ` · bbox ${t.bboxJson}` : ""}
                    </p>
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-cyan-600 hover:underline"
                      onClick={() => onBibChange(t.bib)}
                    >
                      Dùng BIB này
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              BIB xác nhận
            </label>
            <input
              value={bibDraft}
              onChange={(e) => onBibChange(e.target.value)}
              placeholder="A0020 / 50001"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <button
                type="button"
                disabled={busy}
                onClick={onSave}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Lưu BIB
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onReject}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
