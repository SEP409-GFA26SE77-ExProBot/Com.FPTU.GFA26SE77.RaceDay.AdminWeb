"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Images,
  Loader2,
  Rocket,
  Search,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { AssignmentBanner } from "@/components/photographer/AssignmentBanner";
import { PhotoPager, PAGE_SIZE } from "@/components/photographer/PhotoPager";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import {
  listPhotographerPhotos,
  primaryBib,
  publishPhotos,
  type PhotoListItemDto,
} from "@/api/photo";
import { mediaOpenUrl } from "@/lib/media-url";
import { toastError, toastSuccess } from "@/lib/toast";

type PanelTab = "ready" | "library";

/**
 * Tab Xuất bản: ready + publish. Tab Thư viện: published browse (không unpublish).
 */
export default function PhotographerPublishPage() {
  const { assignment, eventId, loading, error, reload } = usePhotographerEvent();
  const [panel, setPanel] = useState<PanelTab>("ready");

  const [ready, setReady] = useState<PhotoListItemDto[]>([]);
  const [readyTotal, setReadyTotal] = useState(0);
  const [readyPage, setReadyPage] = useState(1);
  const [busy, setBusy] = useState(false);

  const [published, setPublished] = useState<PhotoListItemDto[]>([]);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [pubPage, setPubPage] = useState(1);
  const [pubBusy, setPubBusy] = useState(false);
  const [bibFilter, setBibFilter] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

  const refreshReady = useCallback(async (eid: string, page: number) => {
    if (!eid) {
      setReady([]);
      setReadyTotal(0);
      setSelected(new Set());
      return;
    }
    setBusy(true);
    try {
      const res = await listPhotographerPhotos(eid, "ready", page, PAGE_SIZE);
      setReady(res.items);
      setReadyTotal(res.total);
      setSelected(new Set(res.items.map((p) => p.id)));
    } catch (e) {
      toastError(e, "Không tải ảnh chờ publish.");
    } finally {
      setBusy(false);
    }
  }, []);

  const refreshPublished = useCallback(async (eid: string, page: number) => {
    if (!eid) {
      setPublished([]);
      setPublishedTotal(0);
      return;
    }
    setPubBusy(true);
    try {
      const res = await listPhotographerPhotos(
        eid,
        "published",
        page,
        PAGE_SIZE
      );
      setPublished(res.items);
      setPublishedTotal(res.total);
    } catch (e) {
      toastError(e, "Không tải thư viện đã publish.");
    } finally {
      setPubBusy(false);
    }
  }, []);

  const refreshCounts = useCallback(async (eid: string) => {
    if (!eid) return;
    try {
      const [r, p] = await Promise.all([
        listPhotographerPhotos(eid, "ready", 1, 1),
        listPhotographerPhotos(eid, "published", 1, 1),
      ]);
      setReadyTotal(r.total);
      setPublishedTotal(p.total);
    } catch {
      /* ignore — list refresh will surface errors */
    }
  }, []);

  useEffect(() => {
    if (!eventId) return;
    void refreshCounts(eventId);
  }, [eventId, refreshCounts]);

  useEffect(() => {
    if (eventId && panel === "ready") void refreshReady(eventId, readyPage);
  }, [eventId, panel, readyPage, refreshReady]);

  useEffect(() => {
    if (eventId && panel === "library")
      void refreshPublished(eventId, pubPage);
  }, [eventId, panel, pubPage, refreshPublished]);

  const allSelected = useMemo(
    () => ready.length > 0 && selected.size === ready.length,
    [ready.length, selected.size]
  );

  const filteredPublished = useMemo(() => {
    const q = bibFilter.trim().toLowerCase();
    if (!q) return published;
    return published.filter((p) => primaryBib(p).toLowerCase().includes(q));
  }, [published, bibFilter]);

  const tabs: { id: PanelTab; label: string; count: number; icon: typeof Rocket }[] =
    [
      { id: "ready", label: "Xuất bản", count: readyTotal, icon: Rocket },
      {
        id: "library",
        label: "Thư viện",
        count: publishedTotal,
        icon: Images,
      },
    ];

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
      let publishedCount = 0;
      if (allReady) {
        for (let i = 0; i < 20; i++) {
          const res = await publishPhotos(eventId, { allReady: true });
          publishedCount += res.publishedCount ?? 0;
          if ((res.publishedCount ?? 0) === 0) break;
        }
      } else {
        const ids = [...selected];
        if (!ids.length) {
          toastError(new Error("Chọn ít nhất 1 ảnh."), "Chọn ít nhất 1 ảnh.");
          return;
        }
        const res = await publishPhotos(eventId, { photoIds: ids });
        publishedCount = res.publishedCount ?? 0;
      }
      toastSuccess(
        publishedCount > 0
          ? `Đã publish ${publishedCount} ảnh — runner tìm được.`
          : "Không có ảnh nào được publish."
      );
      setReadyPage(1);
      setPubPage(1);
      await refreshCounts(eventId);
      await refreshReady(eventId, 1);
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
            Xuất bản & thư viện
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish ảnh đã khớp để runner tìm được. Thư viện chỉ duyệt / mở ảnh
            (chưa có unpublish).
          </p>
        </div>

        <AssignmentBanner
          assignment={assignment}
          loading={loading}
          error={error}
          onRefresh={() => {
            void reload();
            if (!eventId) return;
            void refreshCounts(eventId);
            if (panel === "ready") void refreshReady(eventId, readyPage);
            else void refreshPublished(eventId, pubPage);
          }}
        />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = panel === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPanel(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}{" "}
                  <span className="opacity-80">({t.count})</span>
                </button>
              );
            })}
          </div>

          {panel === "ready" ? (
            <div className="space-y-4">
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
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : null}
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
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm text-slate-500">
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
                          checked
                            ? "border-cyan-400 ring-2 ring-cyan-200"
                            : "border-slate-200"
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
                            <p className="text-[11px] text-amber-700">
                              Chưa public
                            </p>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              <PhotoPager
                page={readyPage}
                total={readyTotal}
                onChange={setReadyPage}
                disabled={busy || publishing}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold tabular-nums">{publishedTotal}</span>{" "}
                  đã public
                </span>
                {pubBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : null}
                <div className="relative ml-auto w-full max-w-xs sm:w-56">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={bibFilter}
                    onChange={(e) => setBibFilter(e.target.value)}
                    placeholder="Lọc BIB (trang này)"
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-sm outline-none ring-cyan-200 focus:ring-2"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Chỉ duyệt / mở ảnh. BE chưa có unpublish.
              </p>

              {!filteredPublished.length && !pubBusy ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm text-slate-500">
                  {publishedTotal === 0
                    ? "Chưa có ảnh public."
                    : bibFilter.trim()
                      ? "Không khớp BIB trên trang này."
                      : "Trang trống."}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredPublished.map((p) => (
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
                        <p className="font-mono text-sm font-bold text-teal-700">
                          {primaryBib(p)}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {p.zone || "—"}
                          {p.publishedAtUtc
                            ? ` · ${new Date(p.publishedAtUtc).toLocaleString()}`
                            : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <PhotoPager
                page={pubPage}
                total={publishedTotal}
                onChange={setPubPage}
                disabled={pubBusy}
              />
            </div>
          )}
        </div>
      </div>
    </RouteTab>
  );
}
