"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  AlertCircle,
  CheckCircle2,
  Keyboard,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  checkInRegistration,
  listEventCheckIns,
  listMyStaffAssignments,
  type CheckInListItem,
  type CheckInResult,
  type StaffAssignmentDto,
} from "@/api/check-in";
import {
  cacheAssignment,
  cacheCheckInList,
  isProbablyOffline,
  mergeListWithPending,
  offlineCheckIn,
  readCachedAssignment,
  readCachedCheckInList,
  readQueue,
  removePending,
} from "@/lib/check-in-offline";
import { getApiErrorMessage } from "@/lib/error";

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

export default function VolunteerScannerPage() {
  const [assignment, setAssignment] = useState<StaffAssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualBib, setManualBib] = useState("");
  const [showBib, setShowBib] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<CheckInResult | null>(null);
  const [list, setList] = useState<CheckInListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listFilter, setListFilter] = useState<"all" | "in" | "out">("all");
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const cooldownRef = useRef(false);

  const eventId = assignment?.eventId ?? "";

  const refreshPending = useCallback((eid: string) => {
    setPendingCount(eid ? readQueue(eid).length : 0);
  }, []);

  const applyList = useCallback(
    (eid: string, rows: CheckInListItem[]) => {
      const merged = mergeListWithPending(rows, eid);
      setList(merged);
      refreshPending(eid);
    },
    [refreshPending]
  );

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listMyStaffAssignments();
      const first = items[0] ?? null;
      setAssignment(first);
      cacheAssignment(first);
      if (!first) {
        setError("Chưa có giải Active. Cần BTC mời → đăng nhập kích hoạt trước.");
      }
    } catch (e) {
      const cached = readCachedAssignment();
      if (cached && isProbablyOffline(e)) {
        setAssignment(cached);
        setError(null);
      } else {
        setAssignment(null);
        setError(getApiErrorMessage(e, "Không tải được phân công."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadList = useCallback(
    async (eid: string) => {
      if (!eid) {
        setList([]);
        return;
      }
      setLoadingList(true);
      try {
        const rows = await listEventCheckIns(eid);
        cacheCheckInList(eid, rows);
        applyList(eid, rows);
      } catch (e) {
        const cached = readCachedCheckInList(eid);
        if (cached.length && isProbablyOffline(e)) {
          applyList(eid, cached);
        } else if (cached.length) {
          applyList(eid, cached);
          setError(getApiErrorMessage(e, "Không tải được danh sách check-in."));
        } else {
          setList([]);
          setError(getApiErrorMessage(e, "Không tải được danh sách check-in."));
        }
      } finally {
        setLoadingList(false);
      }
    },
    [applyList]
  );

  const flushQueue = useCallback(
    async (eid: string) => {
      const q = readQueue(eid);
      if (!q.length || !navigator.onLine) return;
      setSyncing(true);
      try {
        for (const p of [...q].reverse()) {
          try {
            await checkInRegistration({ eventId: eid, bib: p.bib });
            removePending(eid, p.id);
          } catch (e) {
            if (isProbablyOffline(e)) break;
            // đã check-in trên server / lỗi nghiệp vụ → bỏ khỏi queue
            removePending(eid, p.id);
          }
        }
        await loadList(eid);
      } finally {
        setSyncing(false);
        refreshPending(eid);
      }
    },
    [loadList, refreshPending]
  );

  useEffect(() => {
    void loadAssignment();
  }, [loadAssignment]);

  useEffect(() => {
    if (eventId) void loadList(eventId);
  }, [eventId, loadList]);

  useEffect(() => {
    const syncOnline = () => {
      const on = typeof navigator !== "undefined" ? navigator.onLine : true;
      setOnline(on);
      if (on && eventId) void flushQueue(eventId);
    };
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, [eventId, flushQueue]);

  const submit = useCallback(
    async (payload: { bib?: string; qrPayload?: string }) => {
      if (!eventId.trim()) {
        setError("Chưa có giải được phân công.");
        return;
      }
      if (cooldownRef.current || busy) return;
      cooldownRef.current = true;
      setBusy(true);
      setError(null);
      try {
        if (!navigator.onLine) {
          const result = offlineCheckIn({
            eventId: eventId.trim(),
            bib: payload.bib,
            qrPayload: payload.qrPayload,
          });
          setLast(result);
          if (payload.bib) setManualBib("");
          applyList(eventId, readCachedCheckInList(eventId));
          return;
        }

        try {
          const result = await checkInRegistration({
            eventId: eventId.trim(),
            bib: payload.bib,
            qrPayload: payload.qrPayload,
          });
          setLast(result);
          if (payload.bib) setManualBib("");
          await loadList(eventId);
        } catch (e) {
          if (isProbablyOffline(e)) {
            const result = offlineCheckIn({
              eventId: eventId.trim(),
              bib: payload.bib,
              qrPayload: payload.qrPayload,
            });
            setLast(result);
            if (payload.bib) setManualBib("");
            applyList(eventId, readCachedCheckInList(eventId));
            setOnline(false);
            return;
          }
          throw e;
        }
      } catch (e) {
        setLast(null);
        setError(
          e instanceof Error
            ? e.message
            : getApiErrorMessage(e, "Check-in thất bại.")
        );
      } finally {
        setBusy(false);
        window.setTimeout(() => {
          cooldownRef.current = false;
        }, 1600);
      }
    },
    [eventId, busy, loadList, applyList]
  );

  const onScan = useCallback(
    (detected: { rawValue?: string }[]) => {
      const raw = detected?.[0]?.rawValue?.trim();
      if (!raw) return;
      if (raw === "[object Object]") {
        setError(
          "QR vé lỗi. VĐV mở lại vé trong «Đăng ký của tôi», hoặc nhập BIB."
        );
        return;
      }
      void submit({ qrPayload: raw });
    },
    [submit]
  );

  const onManual = () => {
    const bib = manualBib.trim();
    if (!bib) {
      setError("Nhập số BIB.");
      return;
    }
    void submit({ bib });
  };

  const filtered = useMemo(() => {
    if (listFilter === "in") return list.filter((x) => x.checkedIn);
    if (listFilter === "out") return list.filter((x) => !x.checkedIn);
    return list;
  }, [list, listFilter]);

  const checkedCount = list.filter((x) => x.checkedIn).length;

  return (
    <RouteTab tab="scanner">
      <div className="mx-auto max-w-5xl space-y-5 px-1 py-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Volunteer · Check-in
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <QrCode className="h-7 w-7 text-orange-500" />
              Quét QR
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadAssignment();
              if (eventId) void loadList(eventId);
              if (eventId && navigator.onLine) void flushQueue(eventId);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới
          </button>
        </div>

        {!online || pendingCount > 0 ? (
          <div
            className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              !online
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-sky-200 bg-sky-50 text-sky-950"
            }`}
          >
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">
              {!online
                ? "Mất mạng — check-in lưu máy, đồng bộ khi có sóng"
                : syncing
                  ? "Đang đồng bộ check-in offline…"
                  : `${pendingCount} check-in chờ đồng bộ`}
            </span>
            {online && pendingCount > 0 && !syncing ? (
              <button
                type="button"
                onClick={() => void flushQueue(eventId)}
                className="ml-auto font-bold underline"
              >
                Đồng bộ ngay
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            {loading ? (
              <div className="flex h-14 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> Đang
                tải phân công…
              </div>
            ) : assignment ? (
              <div className="rounded-xl border border-orange-200/80 bg-orange-50/80 px-3.5 py-3">
                <p className="flex items-start gap-2 text-sm font-extrabold text-slate-900">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <span>
                    {assignment.stationLabel?.trim() ||
                      "Chưa gán điểm (quầy / tiếp tế)"}
                  </span>
                </p>
                <p className="mt-1 pl-6 text-xs text-slate-500">
                  {assignment.eventName}
                  {assignment.role ? ` · ${assignment.role}` : ""}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Chưa có giải được phân công.
              </p>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-zinc-950">
              {eventId ? (
                <Scanner
                  onScan={onScan}
                  onError={() => {}}
                  constraints={{
                    facingMode: "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                  }}
                  formats={["qr_code"]}
                  sound
                  allowMultiple
                  scanDelay={1800}
                  components={{ torch: true, finder: true }}
                  styles={{ container: { width: "100%" } }}
                  paused={busy || !eventId}
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-sm text-white/60">
                  Chưa có giải để mở camera
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowBib((v) => !v)}
                className="text-xs font-bold text-slate-400 underline-offset-2 hover:text-slate-800 hover:underline"
              >
                {showBib ? "Ẩn nhập BIB" : "QR lỗi? Nhập BIB thủ công"}
              </button>
              {showBib ? (
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Keyboard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={manualBib}
                      onChange={(e) => setManualBib(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onManual();
                      }}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="VD: 1001"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm font-semibold outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                      disabled={busy || !eventId}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onManual}
                    disabled={busy || !eventId}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "OK"
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            ) : null}

            {last ? (
              <div
                className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                  last.alreadyCheckedIn
                    ? "border-amber-200 bg-amber-50"
                    : last.status === "pending_sync"
                      ? "border-sky-200 bg-sky-50"
                      : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    last.alreadyCheckedIn
                      ? "text-amber-600"
                      : last.status === "pending_sync"
                        ? "text-sky-600"
                        : "text-emerald-600"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">
                    {last.alreadyCheckedIn
                      ? "Đã check-in trước đó"
                      : last.status === "pending_sync"
                        ? "Đã ghi máy (chờ sync)"
                        : "Check-in thành công"}{" "}
                    · BIB {last.bibNumber}
                  </p>
                  <p className="truncate text-[11px] text-slate-600">
                    {last.fullName}
                    {last.distanceLabel ? ` · ${last.distanceLabel}` : ""} ·{" "}
                    {formatDt(last.checkedInAtUtc)}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="flex min-h-[28rem] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Danh sách check-in
                </h2>
                <p className="text-[11px] text-slate-500">
                  {checkedCount}/{list.length} đã check-in
                  {pendingCount > 0 ? ` · ${pendingCount} chờ sync` : ""}
                </p>
              </div>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                {(
                  [
                    ["all", "Tất cả"],
                    ["in", "Đã CI"],
                    ["out", "Chưa"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setListFilter(k)}
                    className={`rounded-md px-2.5 py-1 ${
                      listFilter === k
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-auto">
              {loadingList ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />{" "}
                  Đang tải…
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">
                  Chưa có VĐV confirmed trên giải này.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <li
                      key={r.registrationId}
                      className="flex items-center justify-between gap-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          <span className="text-orange-600">
                            BIB {r.bibNumber || "—"}
                          </span>{" "}
                          · {r.fullName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {r.distanceLabel || "—"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            r.status === "pending_sync"
                              ? "bg-sky-100 text-sky-700"
                              : r.checkedIn
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {r.status === "pending_sync"
                            ? "Chờ sync"
                            : r.checkedIn
                              ? "Đã check-in"
                              : "Chưa check-in"}
                        </span>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {r.checkedInAtUtc
                            ? formatDt(r.checkedInAtUtc)
                            : "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </RouteTab>
  );
}
