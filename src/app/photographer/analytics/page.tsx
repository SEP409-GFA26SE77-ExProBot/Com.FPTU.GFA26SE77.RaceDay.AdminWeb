"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import { listPhotographerPhotos } from "@/api/photo";
import { toastError } from "@/lib/toast";

type Stats = {
  pending: number;
  matched: number;
  review: number;
};

export default function PhotographerAnalyticsPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [stats, setStats] = useState<Stats>({ pending: 0, matched: 0, review: 0 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setStats({ pending: 0, matched: 0, review: 0 });
      return;
    }
    setBusy(true);
    try {
      const [p, m, r] = await Promise.all([
        listPhotographerPhotos(eid, "pending", 1, 1),
        listPhotographerPhotos(eid, "matched", 1, 1),
        listPhotographerPhotos(eid, "review", 1, 1),
      ]);
      setStats({ pending: p.total, matched: m.total, review: r.total });
    } catch (e) {
      toastError(e, "Không tải thống kê.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const total = stats.pending + stats.matched + stats.review;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <RouteTab tab="analytics">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <BarChart3 className="h-7 w-7 text-cyan-500" />
            Thống kê ảnh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo pipeline OCR của giải đang gán (chưa có API view/download).
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

        <div className="relative grid gap-4 sm:grid-cols-3">
          {busy ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : null}
          {[
            {
              label: "Chờ OCR",
              value: stats.pending,
              bar: pct(stats.pending),
              color: "bg-amber-400",
            },
            {
              label: "Đã khớp",
              value: stats.matched,
              bar: pct(stats.matched),
              color: "bg-emerald-400",
            },
            {
              label: "Cần sửa",
              value: stats.review,
              bar: pct(stats.review),
              color: "bg-rose-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${s.color}`}
                  style={{ width: `${s.bar}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-800">Tổng trong pipeline</p>
          <p className="mt-1 text-4xl font-black text-cyan-700">{total}</p>
          <p className="mt-2 text-xs text-slate-500">
            {assignment?.eventName || "—"}
          </p>
        </div>
      </div>
    </RouteTab>
  );
}
