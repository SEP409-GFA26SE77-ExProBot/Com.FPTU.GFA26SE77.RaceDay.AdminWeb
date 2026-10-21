"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  listPhotographerPhotos,
  primaryBib,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { getApiErrorMessage } from "@/lib/error";

/**
 * Không có API "publish" riêng — ảnh matched / manual_corrected đã search được.
 * Màn này = gallery ảnh đã khớp.
 */
export default function PhotographerPublishPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [items, setItems] = useState<PhotoListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setItems([]);
      setTotal(0);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const page = await listPhotographerPhotos(eid, "matched", 1, 60);
      setItems(page.items);
      setTotal(page.total);
    } catch (e) {
      setErr(getApiErrorMessage(e, "Không tải ảnh matched."));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  return (
    <RouteTab tab="publish">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
            FR-PHO-06 · Matched
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Rocket className="h-7 w-7 text-cyan-500" />
            Ảnh đã khớp
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ảnh matched / đã sửa tay — runner tìm theo BIB được ngay (không cần
            bước publish riêng).
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

        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {total} ảnh sẵn sàng tìm kiếm
          {busy ? <Loader2 className="ml-auto h-4 w-4 animate-spin" /> : null}
        </div>

        {err ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {err}
          </p>
        ) : null}

        {!items.length && !busy ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Chưa có ảnh matched. Upload → chạy OCR trước.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((p) => (
              <a
                key={p.id}
                href={mediaOpenUrl(p.url)}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaOpenUrl(p.url)}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-2.5 py-2">
                  <p className="font-mono text-sm font-bold text-cyan-700">
                    {primaryBib(p)}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {p.zone || "—"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </RouteTab>
  );
}
