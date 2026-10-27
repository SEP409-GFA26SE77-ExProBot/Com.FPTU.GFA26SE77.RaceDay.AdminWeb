"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  listPhotographerPhotos,
  primaryBib,
  publishPhotos,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastSuccess } from "@/lib/toast";

/**
 * OCR xong (matched) chưa public — photographer publish tổng mới hiện search runner.
 */
export default function PhotographerPublishPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [ready, setReady] = useState<PhotoListItemDto[]>([]);
  const [readyTotal, setReadyTotal] = useState(0);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(async (eid: string) => {
    if (!eid) {
      setReady([]);
      setReadyTotal(0);
      setPublishedTotal(0);
      setSelected(new Set());
      return;
    }
    setBusy(true);
    try {
      const [readyPage, publishedPage] = await Promise.all([
        listPhotographerPhotos(eid, "ready", 1, 100),
        listPhotographerPhotos(eid, "published", 1, 1),
      ]);
      setReady(readyPage.items);
      setReadyTotal(readyPage.total);
      setPublishedTotal(publishedPage.total);
      setSelected(new Set(readyPage.items.map((p) => p.id)));
    } catch (e) {
      toastError(e, "Không tải ảnh chờ publish.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) void refresh(eventId);
  }, [eventId, refresh]);

  const allSelected = useMemo(
    () => ready.length > 0 && selected.size === ready.length,
    [ready.length, selected.size]
  );

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(ready.map((p) => p.id)));
  };

  const runPublish = async (allReady: boolean) => {
    if (!eventId) return;
    setPublishing(true);
    try {
      let published = 0;
      if (allReady) {
        // Lặp đến hết queue ready (API cap 500/lần).
        for (let i = 0; i < 20; i++) {
          const res = await publishPhotos(eventId, { allReady: true });
          published += res.publishedCount ?? 0;
          if ((res.publishedCount ?? 0) === 0) break;
        }
      } else {
        const ids = [...selected];
        if (!ids.length) {
          toastError(new Error("Chọn ít nhất 1 ảnh."), "Chọn ít nhất 1 ảnh.");
          return;
        }
        const res = await publishPhotos(eventId, { photoIds: ids });
        published = res.publishedCount ?? 0;
      }
      toastSuccess(
        published > 0
          ? `Đã publish ${published} ảnh — runner tìm được.`
          : "Không có ảnh nào được publish."
      );
      await refresh(eventId);
    } catch (e) {
      toastError(e, "Publish thất bại.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <RouteTab tab="publish">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2 animate-slide-up">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Rocket className="h-7 w-7 text-cyan-500" />
            Xuất bản ảnh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            OCR khớp xong vẫn chưa hiện cho runner — chọn ảnh rồi Publish (hoặc
            Publish tất cả).
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

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <span className="inline-flex items-center gap-1.5 text-amber-800">
            <span className="font-bold tabular-nums">{readyTotal}</span> chờ
            publish
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-bold tabular-nums">{publishedTotal}</span> đã
            public
          </span>
          {busy ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={allSelected}
              disabled={!ready.length || publishing}
              onChange={toggleAll}
            />
            Chọn trang này ({selected.size}/{ready.length})
          </label>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!selected.size || publishing || !eventId}
              onClick={() => void runPublish(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              Publish đã chọn
            </button>
            <button
              type="button"
              disabled={!readyTotal || publishing || !eventId}
              onClick={() => void runPublish(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish tất cả ({readyTotal})
            </button>
          </div>
        </div>

        {!ready.length && !busy ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {publishedTotal > 0
              ? "Không còn ảnh chờ publish. Upload + OCR thêm rồi quay lại."
              : "Chưa có ảnh matched. Upload → chạy OCR trước."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {ready.map((p) => {
              const checked = selected.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    checked ? "border-cyan-400 ring-2 ring-cyan-200" : "border-slate-200"
                  }`}
                >
                  <label className="absolute left-2 top-2 z-10 inline-flex cursor-pointer items-center rounded-md bg-white/90 px-1.5 py-1 shadow">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={checked}
                      disabled={publishing}
                      onChange={() => toggleOne(p.id)}
                    />
                  </label>
                  <a
                    href={mediaOpenUrl(p.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
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
                      <p className="text-[11px] text-amber-700">Chưa public</p>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RouteTab>
  );
}
