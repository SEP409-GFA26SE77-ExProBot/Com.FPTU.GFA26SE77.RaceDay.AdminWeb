"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
  ScanSearch,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  listPhotographerPhotos,
  primaryBib,
  processPendingPhotos,
  statusLabel,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { getApiErrorMessage } from "@/lib/error";

export default function PhotographerOcrPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [pending, setPending] = useState<PagedSlice>({ items: [], total: 0 });
  const [matched, setMatched] = useState<PagedSlice>({ items: [], total: 0 });
  const [busy, setBusy] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setPending({ items: [], total: 0 });
      setMatched({ items: [], total: 0 });
      return;
    }
    setLoadingLists(true);
    setErr(null);
    try {
      const [p, m] = await Promise.all([
        listPhotographerPhotos(eid, "pending", 1, 30),
        listPhotographerPhotos(eid, "matched", 1, 30),
      ]);
      setPending({ items: p.items, total: p.total });
      setMatched({ items: m.items, total: m.total });
    } catch (e) {
      setErr(getApiErrorMessage(e, "Không tải dữ liệu OCR."));
    } finally {
      setLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const onProcess = async () => {
    if (!eventId) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await processPendingPhotos(eventId);
      setMsg(`Đã enqueue ${res.queuedCount} ảnh vào OCR.`);
      await refresh(eventId);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Process thất bại."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <RouteTab tab="ocr">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
              FR-PHO-03 · OCR
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <ScanSearch className="h-7 w-7 text-cyan-500" />
              Nhận diện BIB
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enqueue ảnh pending → OCR service → callback khớp roster.
            </p>
          </div>
          <button
            type="button"
            disabled={!eventId || busy || pending.total === 0}
            onClick={() => void onProcess()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
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

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Chờ / queue", value: pending.total, tone: "text-amber-600" },
            { label: "Đã khớp", value: matched.total, tone: "text-emerald-600" },
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

        <PhotoTable title="Gần đây đã khớp" items={matched.items} empty="Chưa có ảnh matched." />
        <PhotoTable
          title="Đang chờ xử lý"
          items={pending.items}
          empty="Không còn ảnh pending."
        />
      </div>
    </RouteTab>
  );
}

type PagedSlice = { items: PhotoListItemDto[]; total: number };

function PhotoTable({
  title,
  items,
  empty,
}: {
  title: string;
  items: PhotoListItemDto[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-extrabold text-slate-900">{title}</h2>
      {!items.length ? (
        <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-2 py-2 font-semibold">Ảnh</th>
                <th className="px-2 py-2 font-semibold">BIB</th>
                <th className="px-2 py-2 font-semibold">Conf</th>
                <th className="px-2 py-2 font-semibold">Zone</th>
                <th className="px-2 py-2 font-semibold">Status</th>
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
                    <td className="px-2 py-2 font-mono font-bold text-cyan-700">
                      {primaryBib(p)}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {tag
                        ? `${Math.round(tag.confidence * 1000) / 10}%`
                        : "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-500">{p.zone || "—"}</td>
                    <td className="px-2 py-2 text-xs font-semibold text-slate-600">
                      {statusLabel(p.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
