"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  approveDispute,
  listOpenEventDisputes,
  rejectDispute,
  type PhotoDisputeDto,
} from "@/api/photo";
import { getApiErrorMessage } from "@/lib/error";

export default function PhotographerRequestsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [items, setItems] = useState<PhotoDisputeDto[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectDraft, setRejectDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setItems([]);
      return;
    }
    setLoadingList(true);
    setErr(null);
    try {
      setItems(await listOpenEventDisputes(eid));
    } catch (e) {
      setErr(getApiErrorMessage(e, "Không tải khiếu nại."));
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
    setMsg(null);
    setErr(null);
    try {
      await approveDispute(eventId, id);
      setMsg("Đã duyệt — ảnh về NeedsReview.");
      await refresh(eventId);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Duyệt thất bại."));
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (id: string) => {
    if (!eventId) return;
    const reason = (rejectDraft[id] || "").trim();
    if (!reason) {
      setErr("Nhập lý do từ chối.");
      return;
    }
    setActingId(id);
    setMsg(null);
    setErr(null);
    try {
      await rejectDispute(eventId, id, reason);
      setMsg("Đã từ chối khiếu nại.");
      await refresh(eventId);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Từ chối thất bại."));
    } finally {
      setActingId(null);
    }
  };

  return (
    <RouteTab tab="requests">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
            FR-PHO-07 · Disputes
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Inbox className="h-7 w-7 text-cyan-500" />
            Khiếu nại ảnh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Runner báo sai BIB / ảnh — duyệt để đưa ảnh vào hàng sửa, hoặc từ
            chối kèm lý do.
          </p>
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

        {msg ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4" /> {msg}
          </div>
        ) : null}
        {err ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            <AlertCircle className="h-4 w-4" /> {err}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              Open ({items.length})
            </h2>
            {loadingList ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            ) : null}
          </div>

          {!items.length ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Không có khiếu nại mở.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-slate-400">
                        {d.id.slice(0, 8)}… · photo {d.photoId.slice(0, 8)}…
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {d.reason}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(d.createdAtUtc).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={actingId === d.id}
                      onClick={() => void onApprove(d.id)}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
                    >
                      Duyệt
                    </button>
                    <input
                      value={rejectDraft[d.id] ?? ""}
                      onChange={(e) =>
                        setRejectDraft((m) => ({
                          ...m,
                          [d.id]: e.target.value,
                        }))
                      }
                      placeholder="Lý do từ chối…"
                      className="min-w-[180px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      disabled={actingId === d.id}
                      onClick={() => void onReject(d.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </RouteTab>
  );
}
