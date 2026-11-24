"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Eraser,
  Flag,
  Loader2,
  Pause,
  Radio,
  RefreshCw,
  Search,
  WifiOff,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listMyStaffAssignments, type StaffAssignmentDto } from "@/api/check-in";
import {
  listLatestRaceEventLogs,
  listRaceEventLogs,
  raceTimelineStreamUrl,
  RACE_LOG_EVENTS,
  type RaceEventLog,
} from "@/api/race-timeline";
import { isActiveRaceStaffAssignment } from "@/lib/staff-assignment";
import { cn } from "@/lib/utils";

/** Rows kept in memory; older ones drop off the top. */
const MAX_ROWS = 500;
const HISTORY_SIZE = 100;
const RETRY_AFTER_CLOSE_MS = 15_000;

type ConnectionState = "connecting" | "live" | "offline" | "denied";
type MethodFilter = "All" | "RFID" | "Manual";

const METHOD_FILTERS: { value: MethodFilter; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "RFID", label: "RFID" },
  { value: "Manual", label: "Thủ công" },
];

const byTimeline = (a: RaceEventLog, b: RaceEventLog) =>
  Date.parse(a.occurredAtUtc) - Date.parse(b.occurredAtUtc) || a.sequence - b.sequence;

function mergeLogs(current: RaceEventLog[], incoming: RaceEventLog[]): RaceEventLog[] {
  if (incoming.length === 0) return current;
  const map = new Map(current.map(log => [log.id, log]));
  for (const log of incoming) map.set(log.id, log);
  return [...map.values()].sort(byTimeline).slice(-MAX_ROWS);
}

/** "10:30:15", or "22/11 10:30:15" when not today. Local browser time, 24h. */
export function formatLogTime(utc: string | null | undefined): string {
  if (!utc) return "—";
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const now = new Date();
  const today = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  return today ? time : `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} ${time}`;
}

export const scanMethodLabel = (method: string | null | undefined) =>
  method === "RFID" ? "RFID" : method === "Manual" ? "Thủ công" : method || "Không rõ";

/** "BIB 5110 (Nguyễn Văn A) đã vượt qua Checkpoint 1 (KM 5) - RFID - 10:30:15" */
export function describeLog(log: RaceEventLog): string {
  const bib = log.bibNumber ? `BIB ${log.bibNumber}` : "VĐV chưa rõ BIB";
  const runner = log.runnerName ? ` (${log.runnerName})` : "";
  const time = formatLogTime(log.occurredAtUtc);
  if (log.eventType === "RunnerCheckpointPassed") {
    const checkpoint = log.checkpointName || "checkpoint";
    return `${bib}${runner} đã vượt qua ${checkpoint} - ${scanMethodLabel(log.scanMethod)} - ${time}`;
  }
  return `${bib}${runner} - ${log.eventType} - ${time}`;
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  if (state === "live") {
    return <Badge variant="success" className="gap-1.5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>Trực tiếp</Badge>;
  }
  if (state === "connecting") {
    return <Badge variant="pending" className="gap-1.5"><Loader2 className="h-3 w-3 animate-spin" />Đang kết nối</Badge>;
  }
  if (state === "denied") {
    return <Badge variant="destructive" className="gap-1.5"><WifiOff className="h-3 w-3" />Không có quyền</Badge>;
  }
  return <Badge variant="live" className="gap-1.5"><WifiOff className="h-3 w-3" />Mất kết nối</Badge>;
}

export default function RaceTimeline() {
  const [assignments, setAssignments] = useState<StaffAssignmentDto[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [assignmentsRetry, setAssignmentsRetry] = useState(0);
  const [eventId, setEventId] = useState("");

  const [logs, setLogs] = useState<RaceEventLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [streamKey, setStreamKey] = useState(0);
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  /** Rows at or below this sequence are hidden by "Xóa màn hình". */
  const [clearedThrough, setClearedThrough] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<MethodFilter>("All");
  const [autoScroll, setAutoScroll] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const lastSequenceRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    void listMyStaffAssignments()
      .then(rows => {
        if (!active) return;
        const usable = rows.filter(isActiveRaceStaffAssignment);
        setAssignments(usable);
        // Default to the first active assignment.
        const first = usable[0]?.eventId ?? "";
        setHistoryLoading(Boolean(first));
        setEventId(first);
      })
      .catch(e => { if (active) setAssignmentsError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setAssignmentsLoading(false); });
    return () => { active = false; };
  }, [assignmentsRetry]);

  const receive = useCallback((incoming: RaceEventLog[], fresh: boolean) => {
    if (incoming.length === 0) return;
    for (const log of incoming) {
      if (lastSequenceRef.current === null || log.sequence > lastSequenceRef.current) lastSequenceRef.current = log.sequence;
    }
    setLogs(current => mergeLogs(current, incoming));
    if (fresh) {
      setFreshIds(current => {
        const next = new Set(current);
        for (const log of incoming) next.add(log.id);
        return next;
      });
    }
  }, []);

  /** Switch event: drop the previous event's rows before its history loads. */
  const selectEvent = (next: string) => {
    if (next === eventId) return;
    lastSequenceRef.current = null;
    setLogs([]);
    setFreshIds(new Set());
    setClearedThrough(null);
    setHistoryError("");
    setHistoryLoading(Boolean(next));
    setConnection("connecting");
    setEventId(next);
  };

  // History for the selected event.
  useEffect(() => {
    if (!eventId) return;
    let active = true;
    void listLatestRaceEventLogs(eventId, HISTORY_SIZE)
      .then(rows => { if (active) receive(rows, false); })
      .catch(e => { if (active) setHistoryError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [eventId, receive]);

  // Live stream. The browser resends Last-Event-ID on its own reconnects; after a hard
  // close we open a new EventSource and catch up with afterSequence instead.
  useEffect(() => {
    if (!eventId) return;
    let disposed = false;
    let stream: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    // Manual "Kết nối lại" keeps rows, so catch up from the last sequence on open.
    let reopened = lastSequenceRef.current !== null;

    const catchUp = () => {
      const after = lastSequenceRef.current;
      if (after === null) return;
      void listRaceEventLogs(eventId, { afterSequence: after, pageSize: 100 })
        .then(page => { if (!disposed) receive(page.items, true); })
        .catch(() => { /* next event or reconnect will fill the gap */ });
    };

    const connect = () => {
      if (disposed) return;
      stream = new EventSource(raceTimelineStreamUrl(eventId));
      stream.onopen = () => {
        setConnection("live");
        if (reopened) catchUp();
      };
      stream.addEventListener(RACE_LOG_EVENTS.created, event => {
        try {
          receive([JSON.parse((event as MessageEvent<string>).data) as RaceEventLog], true);
        } catch {
          // Ignore a malformed frame; the next one still arrives.
        }
      });
      stream.addEventListener(RACE_LOG_EVENTS.unavailable, () => setConnection("offline"));
      stream.addEventListener(RACE_LOG_EVENTS.accessRevoked, () => {
        stream?.close();
        setConnection("denied");
      });
      stream.onerror = () => {
        if (disposed) return;
        if (stream?.readyState === EventSource.CLOSED) {
          // HTTP error (e.g. no permission for this event). Try again later.
          stream.close();
          setConnection(current => current === "denied" ? current : "offline");
          reopened = true;
          retry = setTimeout(() => {
            setConnection("connecting");
            connect();
          }, RETRY_AFTER_CLOSE_MS);
        } else {
          setConnection("connecting");
        }
      };
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retry);
      stream?.close();
    };
  }, [eventId, streamKey, receive]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter(log =>
      (clearedThrough === null || log.sequence > clearedThrough)
      && (method === "All" || log.scanMethod === method)
      && (!term
        || log.bibNumber?.toLowerCase().includes(term)
        || log.runnerName?.toLowerCase().includes(term)
        || log.checkpointName?.toLowerCase().includes(term)));
  }, [logs, clearedThrough, method, search]);

  const counts = useMemo(() => {
    let rfid = 0;
    let manual = 0;
    for (const log of visible) {
      if (log.scanMethod === "RFID") rfid++;
      else if (log.scanMethod === "Manual") manual++;
    }
    return { rfid, manual };
  }, [visible]);

  const newest = visible.at(-1);
  useEffect(() => {
    if (!autoScroll || !listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [newest?.id, visible.length, autoScroll]);

  const selected = assignments.find(a => a.eventId === eventId);

  const clearScreen = () => {
    setClearedThrough(lastSequenceRef.current);
    setFreshIds(new Set());
  };

  return (
    <RouteTab tab="timeline">
      <div className="space-y-5" lang="vi">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Vận hành ngày đua</p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold">
              <Radio className="h-6 w-6 text-orange-600" />Timeline trực tiếp
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mỗi lượt VĐV qua checkpoint (RFID hoặc ghi thủ công) hiện ngay tại đây.
            </p>
          </div>
          {eventId && <ConnectionBadge state={connection} />}
        </header>

        {assignmentsLoading ? (
          <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Đang tải phân công…</p>
        ) : assignmentsError ? (
          <div role="alert" className="space-y-3 rounded-xl border bg-card p-5">
            <p>{assignmentsError}</p>
            <Button onClick={() => { setAssignmentsLoading(true); setAssignmentsError(""); setAssignmentsRetry(x => x + 1); }}>Thử lại</Button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border bg-card p-6">
            Chưa có phân công đang hoạt động. Liên hệ organizer để được thêm vào nhân sự của giải.
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm xl:flex-row xl:items-end">
              <div className="flex min-w-0 flex-col gap-1.5 xl:w-72">
                <Label htmlFor="timeline-event">Giải</Label>
                <select
                  id="timeline-event"
                  value={eventId}
                  onChange={e => selectEvent(e.target.value)}
                  className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {assignments.map(a => <option key={a.eventId} value={a.eventId}>{a.eventName}</option>)}
                </select>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="timeline-search">Tìm nhanh</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="timeline-search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="BIB, tên VĐV hoặc checkpoint"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Cách ghi nhận</span>
                <div role="radiogroup" aria-label="Cách ghi nhận" className="inline-flex h-10 rounded-md border bg-background p-1">
                  {METHOD_FILTERS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      role="radio"
                      aria-checked={method === f.value}
                      onClick={() => setMethod(f.value)}
                      className={cn(
                        "rounded px-3 text-sm font-medium transition-colors",
                        method === f.value ? "bg-orange-600 text-white" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={autoScroll ? "default" : "outline"}
                  aria-pressed={autoScroll}
                  onClick={() => setAutoScroll(x => !x)}
                  className={cn("h-10", autoScroll && "bg-orange-600 text-white hover:bg-orange-700")}
                  title={autoScroll ? "Tắt tự động cuộn" : "Bật tự động cuộn"}
                >
                  {autoScroll ? <ArrowDownToLine className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {autoScroll ? "Tự cuộn: bật" : "Tự cuộn: tắt"}
                </Button>
                <Button type="button" variant="outline" className="h-10" onClick={clearScreen} title="Ẩn các dòng hiện có, chỉ xem log mới">
                  <Eraser className="h-4 w-4" />Xóa màn hình
                </Button>
                {clearedThrough !== null && (
                  <Button type="button" variant="ghost" className="h-10" onClick={() => setClearedThrough(null)}>
                    Hiện lại
                  </Button>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-sm">
                <p className="font-semibold">{selected?.eventName ?? "Giải"}</p>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>{visible.length} dòng</span>
                  <Badge variant="cyan">RFID {counts.rfid}</Badge>
                  <Badge variant="pending">Thủ công {counts.manual}</Badge>
                  {connection !== "live" && connection !== "denied" && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => { setConnection("connecting"); setStreamKey(x => x + 1); }} title="Kết nối lại">
                      <RefreshCw className="h-4 w-4" />Kết nối lại
                    </Button>
                  )}
                </div>
              </div>

              {connection === "denied" && (
                <p role="alert" className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  Bạn không còn quyền xem timeline của giải này.
                </p>
              )}
              {historyError && (
                <p role="alert" className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{historyError}</p>
              )}

              <div ref={listRef} className="max-h-[calc(100vh-22rem)] min-h-[320px] overflow-y-auto" aria-live="polite" aria-relevant="additions">
                {historyLoading && logs.length === 0 ? (
                  <ul className="space-y-2 p-4" aria-hidden>
                    {Array.from({ length: 6 }, (_, i) => <li key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
                  </ul>
                ) : visible.length === 0 ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                    <Flag className="h-8 w-8 text-orange-600/60" />
                    {logs.length === 0
                      ? "Chưa có VĐV nào qua checkpoint. Log mới sẽ hiện ở đây ngay khi được ghi nhận."
                      : "Không có dòng nào khớp bộ lọc hoặc màn hình vừa được xóa."}
                  </div>
                ) : (
                  <ol className="divide-y">
                    {visible.map(log => {
                      const fresh = freshIds.has(log.id);
                      return (
                        <li
                          key={log.id}
                          title={describeLog(log)}
                          className={cn(
                            "flex flex-col gap-2 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4",
                            fresh && "bg-orange-500/5",
                          )}
                        >
                          <time
                            dateTime={log.occurredAtUtc}
                            className="w-fit shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold tabular-nums"
                            title={new Date(log.occurredAtUtc).toLocaleString("vi-VN", { hour12: false })}
                          >
                            {formatLogTime(log.occurredAtUtc)}
                          </time>
                          <p className="min-w-0 flex-1 text-sm">
                            <span className="font-bold">BIB {log.bibNumber ?? "—"}</span>
                            {log.runnerName && <span className="text-muted-foreground"> ({log.runnerName})</span>}
                            {log.eventType === "RunnerCheckpointPassed" ? (
                              <> đã vượt qua <span className="font-semibold text-orange-700 dark:text-orange-400">{log.checkpointName || "checkpoint"}</span></>
                            ) : (
                              <> · {log.eventType}</>
                            )}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            {fresh && <Badge variant="live">Mới</Badge>}
                            <Badge variant={log.scanMethod === "RFID" ? "cyan" : "pending"}>{scanMethodLabel(log.scanMethod)}</Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </RouteTab>
  );
}
