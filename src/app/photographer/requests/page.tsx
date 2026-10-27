"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Eye,
  Inbox,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  approveDispute,
  getPhotographerPhotoDetail,
  listOpenEventDisputes,
  primaryBib,
  rejectDispute,
  statusLabel,
  type PhotoDetailDto,
  type PhotoDisputeDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastSuccess } from "@/lib/toast";

type DisputeRow = PhotoDisputeDto & {
  photo?: PhotoDetailDto | null;
  photoLoading?: boolean;
};

export default function PhotographerRequestsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [items, setItems] = useState<DisputeRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectDraft, setRejectDraft] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<DisputeRow | null>(null);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setItems([]);
      return;
    }
    setLoadingList(true);
    try {
      const disputes = await listOpenEventDisputes(eid);
      const rows: DisputeRow[] = disputes.map((d) => ({
        ...d,
        photo: null,
        photoLoading: true,
      }));
      setItems(rows);

      // Load thumbnails in parallel (best-effort)
      void Promise.all(
        disputes.map(async (d) => {
          try {
            const photo = await getPhotographerPhotoDetail(eid, d.photoId);
            setItems((prev) =>
              prev.map((row) =>
                row.id === d.id
                  ? { ...row, photo, photoLoading: false }
                  : row
              )
            );
          } catch {
            setItems((prev) =>
              prev.map((row) =>
                row.id === d.id
                  ? { ...row, photo: null, photoLoading: false }
                  : row
              )
            );
          }
        })
      );
    } catch (e) {
      toastError(e, "Không tải khiếu nại.");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const onApprove = async (id: string) => {
    if (!eventId) return;
    setActingId(id);
    try {
      await approveDispute(eventId, id);
      toastSuccess("Đã duyệt — ảnh vào hàng Sửa BIB.");
      setPreview((cur) => (cur?.id === id ? null : cur));
      await refresh(eventId);
    } catch (e) {
      toastError(e, "Duyệt thất bại.");
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (id: string) => {
    if (!eventId) return;
    const reason = (rejectDraft[id] || "").trim();
    if (reason.length < 4) {
      toastError("Nhập lý do từ chối (ít nhất 4 ký tự).");
      return;
    }
    setActingId(id);
    try {
      await rejectDispute(eventId, id, reason);
      toastSuccess("Đã từ chối khiếu nại.");
      setPreview((cur) => (cur?.id === id ? null : cur));
      await refresh(eventId);
    } catch (e) {
      toastError(e, "Từ chối thất bại.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <RouteTab tab="requests">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <Inbox className="h-7 w-7 text-cyan-500" />
              Khiếu nại ảnh
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Runner báo sai BIB / ảnh — xem ảnh, duyệt để đưa vào hàng sửa, hoặc
              từ chối kèm lý do.
            </p>
          </div>
          <Link
            href="/photographer/corrections"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            Hàng sửa BIB
          </Link>
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

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              Đang mở ({items.length})
            </h2>
            {loadingList ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            ) : null}
          </div>

          {!items.length && !loadingList ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Không có khiếu nại mở.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((d) => {
                const bib = d.photo ? primaryBib(d.photo) : "—";
                const thumb = d.photo?.url ? mediaOpenUrl(d.photo.url) : "";
                return (
                  <li
                    key={d.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <button
                        type="button"
                        onClick={() => setPreview(d)}
                        className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-24 sm:w-32"
                        title="Xem ảnh"
                      >
                        {d.photoLoading ? (
                          <span className="flex h-full items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                          </span>
                        ) : thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs text-slate-400">
                            Không tải được ảnh
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">
                              BIB gắn:{" "}
                              <span className="font-mono font-bold text-rose-600">
                                {bib}
                              </span>
                              {d.photo?.status
                                ? ` · ${statusLabel(d.photo.status)}`
                                : ""}
                              {d.photo?.zone ? ` · ${d.photo.zone}` : ""}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {d.reason || "—"}
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-slate-400">
                              #{d.id.slice(0, 8)} ·{" "}
                              {d.createdAtUtc
                                ? new Date(d.createdAtUtc).toLocaleString(
                                    "vi-VN"
                                  )
                                : "—"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setPreview(d)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Xem
                            </button>
                            <button
                              type="button"
                              disabled={actingId === d.id}
                              onClick={() => void onApprove(d.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              {actingId === d.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Duyệt
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={rejectDraft[d.id] || ""}
                            onChange={(e) =>
                              setRejectDraft((prev) => ({
                                ...prev,
                                [d.id]: e.target.value,
                              }))
                            }
                            placeholder="Lý do từ chối (bắt buộc)…"
                            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            disabled={actingId === d.id}
                            onClick={() => void onReject(d.id)}
                            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {preview ? (
        <DisputePreviewPanel
          row={preview}
          rejectReason={rejectDraft[preview.id] || ""}
          onRejectReason={(v) =>
            setRejectDraft((prev) => ({ ...prev, [preview.id]: v }))
          }
          busy={actingId === preview.id}
          onClose={() => setPreview(null)}
          onApprove={() => void onApprove(preview.id)}
          onReject={() => void onReject(preview.id)}
        />
      ) : null}
    </RouteTab>
  );
}

function DisputePreviewPanel({
  row,
  rejectReason,
  onRejectReason,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  row: DisputeRow;
  rejectReason: string;
  onRejectReason: (v: string) => void;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const photo = row.photo;
  const thumb = photo?.url ? mediaOpenUrl(photo.url) : "";
  const bib = photo ? primaryBib(photo) : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="dispute-preview-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">
              Khiếu nại ảnh
            </p>
            <h2
              id="dispute-preview-title"
              className="text-base font-extrabold text-slate-900"
            >
              BIB {bib}
              {photo?.status ? ` · ${statusLabel(photo.status)}` : ""}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Duyệt → ảnh vào hàng Sửa BIB. Từ chối → runner nhận lý do.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-2">
          <div className="bg-slate-100">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt="Ảnh khiếu nại"
                className="max-h-[50vh] w-full object-contain lg:max-h-none lg:min-h-[360px]"
              />
            ) : (
              <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400">
                {row.photoLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                ) : (
                  "Không tải được ảnh"
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Lý do runner
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {row.reason || "—"}
              </p>
            </div>

            {photo?.zone ? (
              <p className="text-xs text-slate-500">Zone: {photo.zone}</p>
            ) : null}

            <label className="block space-y-1.5 text-sm">
              <span className="font-bold text-slate-800">
                Lý do từ chối (nếu từ chối)
              </span>
              <textarea
                value={rejectReason}
                onChange={(e) => onRejectReason(e.target.value)}
                disabled={busy}
                rows={3}
                placeholder="vd. Đúng người / đúng BIB trên ảnh…"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={onApprove}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Duyệt → sửa BIB
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onReject}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                Từ chối
              </button>
            </div>

            <Link
              href="/photographer/corrections"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" />
              Mở hàng sửa BIB
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
