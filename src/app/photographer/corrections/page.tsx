"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  correctPhotoBib,
  listPhotographerPhotos,
  primaryBib,
  statusLabel,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { getApiErrorMessage } from "@/lib/error";

export default function PhotographerCorrectionsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [items, setItems] = useState<PhotoListItemDto[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
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
      const page = await listPhotographerPhotos(eid, "review", 1, 50);
      setItems(page.items);
      const next: Record<string, string> = {};
      for (const p of page.items) {
        next[p.id] = primaryBib(p) === "—" ? "" : primaryBib(p);
      }
      setDrafts(next);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Không tải hàng review."));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const onSave = async (photoId: string) => {
    if (!eventId) return;
    const bib = (drafts[photoId] || "").trim();
    if (!bib) {
      setErr("Nhập BIB hợp lệ (vd A0020).");
      return;
    }
    setSavingId(photoId);
    setMsg(null);
    setErr(null);
    try {
      await correctPhotoBib(eventId, photoId, bib);
      setMsg(`Đã sửa BIB → ${bib.toUpperCase()}`);
      await refresh(eventId);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Sửa BIB thất bại."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RouteTab tab="corrections">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
            FR-PHO-04 · Corrections
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Pencil className="h-7 w-7 text-cyan-500" />
            Sửa BIB
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ảnh needs_review / runner_reported — nhập BIB đúng theo roster
            (prefix + D4).
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
              Hàng chờ sửa ({items.length})
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
            <ul className="space-y-3">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <a
                    href={mediaOpenUrl(p.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaOpenUrl(p.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </a>
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
                    </div>
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
