"use client";

import { useEffect, useState } from "react";
import { getStaffJournal, getStaffJournalRuns, type StaffJournalPage, type StaffJournalRun } from "@/api/staff-journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatSimClock } from "@/lib/staff-simulation";
import { checkpointAccessLost, journalKindLabels } from "@/lib/staff-checkpoint";
import { getApiErrorMessage } from "@/lib/error";

const statusLabel = (status: string | null) => status == null ? "—" : ({ Racing: "Đang chạy", Finished: "Về đích", Dnf: "DNF", Dns: "DNS", Dq: "DQ" }[status] || status);

export default function StaffJournal({ eventId, runId, version, onAccessLost }: {
  eventId: string; runId: string | null; version: number; onAccessLost: () => void;
}) {
  const [runs, setRuns] = useState<StaffJournalRun[]>([]);
  const [selectedRun, setSelectedRun] = useState("");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    getStaffJournalRuns(eventId).then(next => { if (active) { setRuns(next); setError(""); } })
      .catch(e => { if (active) { if (checkpointAccessLost(e)) onAccessLost(); else setError(getApiErrorMessage(e)); } });
    return () => { active = false; };
  }, [eventId, version, onAccessLost, retry]);
  const activeRun = selectedRun || runId || runs[0]?.runId || "";
  const options = runId && !runs.some(r => r.runId === runId) ? [{ runId, lastOccurredAtUtc: "" }, ...runs] : runs;
  return <section className="space-y-4 rounded-2xl border bg-card p-4">
    <h2 className="text-lg font-bold">Nhật ký thao tác</h2>
    <p className="text-sm text-muted-foreground">Lưu thao tác nghiệp vụ theo lượt. Lượt cũ chỉ xem; diễn biến qua mốc tự động nằm ở tab Diễn biến checkpoint.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1 text-sm">Lượt giả lập<select className="min-h-11 w-full rounded-md border bg-background px-2" value={activeRun} onChange={e => setSelectedRun(e.target.value)}>
        {!options.length && <option value="">Chưa có nhật ký</option>}
        {options.map(r => <option key={r.runId} value={r.runId}>{r.runId === runId ? "Lượt hiện tại" : "Lượt cũ"} · {r.runId.slice(0, 8)}{r.lastOccurredAtUtc ? ` · ${new Date(r.lastOccurredAtUtc).toLocaleString("vi-VN")}` : ""}</option>)}
      </select></label>
      <label className="space-y-1 text-sm">Hành động<select className="min-h-11 w-full rounded-md border bg-background px-2" value={kind} onChange={e => setKind(e.target.value)}><option value="">Tất cả hành động</option>{Object.entries(journalKindLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="space-y-1 text-sm">Tìm BIB hoặc tên<Input className="min-h-11" maxLength={200} value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label className="space-y-1 text-sm">Người thực hiện<select className="min-h-11 w-full rounded-md border bg-background px-2" value={mine ? "mine" : "all"} onChange={e => setMine(e.target.value === "mine")}><option value="all">Tất cả tại checkpoint</option><option value="mine">Tôi thực hiện</option></select></label>
    </div>
    {activeRun && activeRun !== runId && <p role="status" className="text-sm text-amber-700">Đang xem nhật ký lượt cũ · Chỉ đọc</p>}
    {error ? <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => setRetry(n => n + 1)}>Thử lại</Button></div>
      : activeRun && <JournalPage key={`${activeRun}:${kind}:${search}:${mine}:${version}:${retry}`} eventId={eventId} runId={activeRun} kind={kind} search={search} mine={mine} onAccessLost={onAccessLost} />}
  </section>;
}

function JournalPage({ eventId, runId, kind, search, mine, onAccessLost }: {
  eventId: string; runId: string; kind: string; search: string; mine: boolean; onAccessLost: () => void;
}) {
  const [cursors, setCursors] = useState<(number | undefined)[]>([undefined]);
  const cursor = cursors[cursors.length - 1];
  const [result, setResult] = useState<{ cursor: number | undefined; page: StaffJournalPage } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      getStaffJournal(eventId, { runId, kind: kind || undefined, search: search.trim() || undefined, mine, cursor })
        .then(page => { if (active) { setResult({ cursor, page }); setError(""); } })
        .catch(e => { if (active) { if (checkpointAccessLost(e)) onAccessLost(); else setError(getApiErrorMessage(e)); } });
    }, search ? 300 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [eventId, runId, kind, search, mine, cursor, onAccessLost, retry]);
  const page = result && result.cursor === cursor ? result.page : null;
  return <div className="space-y-4">
    {error ? <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => setRetry(n => n + 1)}>Thử lại</Button></div>
      : !page ? <p role="status">Đang tải nhật ký…</p>
      : !page.items.length ? <p className="py-6 text-sm text-muted-foreground">Không có nhật ký phù hợp.</p>
      : <ol className="space-y-3">{page.items.map(entry => <li key={entry.id} className="rounded-lg border p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong>{journalKindLabels[entry.kind] || entry.kind}{entry.bib && ` · BIB ${entry.bib} · ${entry.fullName}`}</strong><span className="text-xs text-muted-foreground">#{entry.sequence}</span></div>
        <p className="mt-1">{entry.actorName} · {entry.actorRole}</p>
        <p className="mt-1 text-xs text-muted-foreground">{entry.simSeconds == null ? "Không có thời gian giả lập" : `Giả lập ${formatSimClock(entry.simSeconds)}`} · {new Date(entry.occurredAtUtc).toLocaleString("vi-VN")}</p>
        {entry.previousStatus && <p className="mt-2">Trạng thái VĐV: {statusLabel(entry.previousStatus)}{entry.previousStatus !== entry.status && ` → ${statusLabel(entry.status)}`}</p>}
        {entry.reason && <p className="mt-2 whitespace-pre-wrap break-words">Lý do: {entry.reason}</p>}
        {entry.evidence && <p className="mt-2 whitespace-pre-wrap break-words">Bằng chứng: {entry.evidence}</p>}
        {entry.decisionId && <p className="mt-2 text-xs text-muted-foreground">Mã ghi nhận: {entry.decisionId}</p>}
      </li>)}</ol>}
    <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={cursors.length === 1} onClick={() => setCursors(p => p.slice(0, -1))}>Trước</Button><span className="text-sm">Trang {cursors.length} · tối đa 25 bản ghi</span><Button variant="outline" disabled={!page?.nextCursor || !!error} onClick={() => setCursors(p => [...p, page!.nextCursor!])}>Sau</Button></div>
  </div>;
}
