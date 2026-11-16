"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useStaffCheckpoint } from "@/hooks/useStaffCheckpoint";
import { recordStaffDecision, type StaffAthlete, type StaffCheckpointSnapshot } from "@/api/staff-simulation";
import { submitStaffCheckpointExport, type CheckpointResultExport } from "@/api/checkpoint-exports";
import { formatSimClock } from "@/lib/staff-simulation";
import { checkpointAccessLost, checkpointStats, matchesCheckpointFilter } from "@/lib/staff-checkpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toastSuccess } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/error";
import StaffJournal from "./StaffJournal";

const CheckpointMap = dynamic(() => import("./StaffCheckpointMap"), { ssr: false, loading: () => <p className="p-6 text-sm">Đang tải bản đồ…</p> });
const phaseLabel: Record<string, string> = { Ready: "Sẵn sàng", Running: "Đang chạy", Paused: "Tạm dừng", Finished: "Đã kết thúc" };
const motionLabel: Record<string, string> = { Racing: "Đang chạy", Finished: "Về đích", Dnf: "DNF", Dns: "DNS", Dq: "DQ" };
const PAGE_SIZE = 15;

export default function StaffCheckpoint({ eventId }: { eventId: string }) {
  const [retry, setRetry] = useState(0);
  const { snapshot, error, connected, updatedAt, notice, clearPrivate } = useStaffCheckpoint(eventId, retry);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/checkpoint" className="inline-flex min-h-11 items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" />Phân công của tôi</Link>
      <div className="flex items-center gap-3"><span role="status" className={connected ? "text-sm text-emerald-700" : "text-sm text-amber-800"}>{connected ? "Đang cập nhật trực tiếp" : "Chưa kết nối realtime"}</span>
        <Button variant="outline" className="min-h-11" onClick={() => setRetry(x => x + 1)}><RefreshCw className="h-4 w-4" />Kết nối lại</Button></div>
    </div>
    {notice && <p role="status" className="rounded-lg border bg-muted p-3 text-sm">{notice}</p>}
    {updatedAt && <p className="text-xs text-muted-foreground">Cập nhật gần nhất: {new Date(updatedAt).toLocaleString("vi-VN")}</p>}
    {error && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}
    {!snapshot ? !error && <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Đang xác thực phân công và tải checkpoint…</p>
      : <CheckpointContent key={`${snapshot.runId}-${snapshot.distanceId}-${snapshot.checkpoint.id}`} snapshot={snapshot} connected={connected} onAccessLost={clearPrivate} onReconnect={() => setRetry(n => n + 1)} />}
  </div>;
}

function CheckpointContent({ snapshot: s, connected, onAccessLost, onReconnect }: {
  snapshot: StaffCheckpointSnapshot; connected: boolean; onAccessLost: () => void; onReconnect: () => void;
}) {
  const [tab, setTab] = useState("athletes");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("segment");
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<{ athlete: StaffAthlete; status: "DNF" | "DNS" | "DQ" } | null>(null);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const operation = useRef<{ key: string; id: string } | null>(null);
  const [exported, setExported] = useState<CheckpointResultExport | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState("");
  const stats = checkpointStats(s.athletes);
  const history = s.athletes.filter(a => a.passedAtSeconds != null).sort((a, b) => b.passedAtSeconds! - a.passedAtSeconds!);
  const submittedAt = exported?.submittedAtUtc || s.submittedAtUtc;
  const rows = s.athletes.filter(a => (a.bib + " " + a.fullName).toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")) && matchesCheckpointFilter(a, filter))
    .sort((a, b) => filter === "passed" ? (a.passedAtSeconds ?? Infinity) - (b.passedAtSeconds ?? Infinity) || a.bib.localeCompare(b.bib)
      : a.remainingKm - b.remainingKm || a.bib.localeCompare(b.bib));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const selected = action ? s.athletes.find(a => a.registrationId === action.athlete.registrationId) : null;
  const allowed = !submittedAt && selected && (action?.status === "DNS" ? selected.canDns : action?.status === "DNF" ? selected.canDnf : selected.canReport);
  const openAction = (athlete: StaffAthlete, status: "DNF" | "DNS" | "DQ") => {
    operation.current = null; setAction({ athlete, status }); setReason(""); setEvidence(""); setError("");
  };
  const submit = async () => {
    if (!action || !s.runId || !allowed || !connected) return;
    if (!reason.trim()) { setError("Nhập lý do trước khi xác nhận."); return; }
    setBusy(true); setError("");
    try {
      const key = JSON.stringify([s.runId, action.athlete.registrationId, action.status, reason.trim(), evidence.trim()]);
      if (operation.current?.key !== key) operation.current = { key, id: crypto.randomUUID() };
      await recordStaffDecision(s.eventId, s.runId, action.athlete.registrationId, { status: action.status, reason, evidence, operationId: operation.current.id });
      toastSuccess(action.status === "DQ" ? "Đã gửi báo cáo vi phạm, chờ organizer duyệt." : `Đã ghi ${action.status} vào lượt giả lập.`);
      setAction(null);
    } catch (e) { if (checkpointAccessLost(e)) onAccessLost(); else setError(getApiErrorMessage(e, "Không ghi nhận được. Vui lòng kiểm tra trạng thái mới nhất.")); }
    finally { setBusy(false); }
  };
  const sendExport = async () => {
    if (!s.runId || !s.canSubmitExport || !connected || exportBusy || submittedAt) return;
    setExportBusy(true); setExportError("");
    try {
      setExported(await submitStaffCheckpointExport(s.eventId, s.runId));
      toastSuccess("Đã gửi kết quả checkpoint cho organizer.");
    } catch (e) { if (checkpointAccessLost(e)) onAccessLost(); else setExportError(getApiErrorMessage(e, "Không gửi được kết quả checkpoint.")); }
    finally { setExportBusy(false); }
  };
  return <>
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Checkpoint được phân công · Giả lập</p>
      <h1 className="mt-2 flex items-start gap-2 text-2xl font-extrabold"><MapPin className="mt-1 h-6 w-6 shrink-0 text-orange-600" />{s.checkpoint.name} · km {s.checkpoint.km}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{s.eventName} · {s.title} · {s.distanceKm} km</p>
      <p className="mt-2 text-xs text-muted-foreground">Chặng phụ trách: km {s.segmentFromKm} đến {s.segmentToKm == null ? "hết đường đua" : `trước km ${s.segmentToKm}`} · Lượt {s.runId?.slice(0, 8) || "chưa tạo"}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-orange-50 px-3 py-2 font-semibold text-orange-800">{s.phase ? phaseLabel[s.phase] : "Chờ organizer tạo lượt"}</span>
        {s.runId && <span className="rounded-full bg-muted px-3 py-2 tabular-nums">Đồng hồ giả lập {formatSimClock(s.simulatedSeconds)} · {s.playbackRate}×</span>}
        {s.commitState === "Committed" && <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">Đã ghi kết quả lên hệ thống</span>}</div>
      <p className="mt-3 text-xs text-muted-foreground">Organizer xử lý báo cáo DQ và ghi kết quả chính thức. DNS chỉ ghi tại Start trước khi xuất phát.</p>
    </section>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Tổng VĐV trong lượt", stats.total], ["Đã qua mốc", stats.passed], ["Đang chạy, chưa qua", stats.approaching], ["Dừng trước mốc", stats.stoppedBefore]].map(([label, count]) =>
      <div key={label} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-extrabold tabular-nums">{count}</p></div>)}</div>
    <p className="text-xs text-muted-foreground">Số liệu tính trên toàn bộ VĐV trong lượt. VĐV dừng sau khi qua mốc vẫn được tính trong nhóm đã qua.</p>
    <div role="tablist" aria-label="Theo dõi checkpoint" className="flex flex-wrap gap-2">{[["athletes", "Vận động viên"], ["events", "Diễn biến checkpoint"], ["journal", "Nhật ký thao tác"]].map(([id, label]) =>
      <Button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)}>{label}</Button>)}</div>
    <div hidden={tab !== "athletes"} role="tabpanel" id="panel-athletes" aria-labelledby="tab-athletes" className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-bold">Vận động viên tại chặng</h2>
        <div className="my-4 grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm">Tìm BIB hoặc tên<Input className="min-h-11" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} /></label>
          <label className="space-y-1 text-sm">Hiển thị<select className="min-h-11 w-full rounded-md border bg-background px-3" value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}>
            <option value="segment">Chặng phụ trách</option><option value="all">Tất cả VĐV</option><option value="approaching">Đang chạy, chưa qua</option><option value="passed">Đã qua — theo thời gian</option><option value="stopped">DNF / DNS / DQ</option><option value="pending">DQ chờ duyệt</option>
          </select></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[590px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-3">VĐV</th><th className="p-3">Trạng thái</th><th className="p-3">Qua mốc / còn lại</th><th className="p-3">Thao tác</th></tr></thead>
          <tbody>{visible.map(a => <tr key={a.registrationId} className="border-t">
            <td className="p-3"><span className="font-bold text-orange-700">{a.bib}</span><div className="max-w-44 break-words">{a.fullName}</div></td>
            <td className="p-3">{s.phase === "Ready" && a.motion === "Racing" ? "Chờ xuất phát" : motionLabel[a.motion]}{a.sos && <div className="text-xs text-red-700">SOS giả lập</div>}
              {a.pendingDq && <details className="mt-2 max-w-60 text-xs"><summary className="cursor-pointer font-semibold text-amber-700">DQ chờ duyệt · Xem báo cáo</summary><p className="mt-1 whitespace-pre-wrap break-words">{a.pendingDq.reason}</p>{a.pendingDq.evidence && <p className="mt-1 break-words">Bằng chứng: {a.pendingDq.evidence}</p>}</details>}
              {a.hasPendingDq && !a.pendingDq && <p className="mt-2 text-xs text-amber-700">DQ chờ duyệt tại checkpoint khác</p>}</td>
            <td className="p-3 tabular-nums">{a.passedAtSeconds != null ? formatSimClock(a.passedAtSeconds) : a.motion === "Racing" ? `${a.remainingKm.toFixed(2)} km` : "Chưa qua"}</td>
            <td className="p-3"><div className="flex flex-wrap gap-2">
              {a.canDns && <Button variant="outline" className="min-h-11" disabled={!connected || busy || !!submittedAt} onClick={() => openAction(a, "DNS")}>DNS</Button>}
              {a.canDnf && <Button variant="outline" className="min-h-11 text-red-700" disabled={!connected || busy || !!submittedAt} onClick={() => openAction(a, "DNF")}>Bỏ cuộc</Button>}
              {a.canReport && <Button variant="outline" className="min-h-11" disabled={!connected || busy || !!submittedAt} onClick={() => openAction(a, "DQ")}>Báo vi phạm</Button>}
              {!a.canDns && !a.canDnf && !a.canReport && <span className="text-xs text-muted-foreground">Chỉ theo dõi</span>}
            </div></td></tr>)}</tbody></table></div>
        {!rows.length && <p className="py-8 text-center text-sm text-muted-foreground">{s.runId ? "Không có VĐV phù hợp bộ lọc." : "Chưa có lượt giả lập. Màn hình sẽ cập nhật khi organizer tạo lượt."}</p>}
        {pages > 1 && <div className="mt-4 flex items-center justify-between gap-2 text-sm"><Button variant="outline" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Trước</Button><span>Trang {currentPage + 1}/{pages} · {rows.length} VĐV</span><Button variant="outline" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Sau</Button></div>}
      </section>
      <aside className="min-w-0 space-y-5">
        <section className="overflow-hidden rounded-2xl border bg-card"><h2 className="p-4 font-bold">Mốc của bạn trên bản đồ</h2><div className="relative z-0 h-72"><CheckpointMap snapshot={s} /></div><p className="p-3 text-xs text-muted-foreground">Tối đa 30 VĐV đang chạy gần mốc: xanh dương chưa qua, xanh lá đã qua.</p></section>
        <section className="rounded-2xl border bg-card p-4"><h2 className="font-bold">Vừa qua checkpoint</h2><ul className="mt-3 space-y-2 text-sm">{history.slice(0, 5).map(a => <li key={a.registrationId}>BIB {a.bib} · {formatSimClock(a.passedAtSeconds)} <span className="text-xs text-muted-foreground">Hệ thống giả lập</span></li>)}</ul>{!history.length && <p className="mt-3 text-sm text-muted-foreground">Chưa có VĐV qua mốc.</p>}</section>
      </aside>
    </div>
    {tab === "events" && <section role="tabpanel" id="panel-events" aria-labelledby="tab-events" className="space-y-3 rounded-2xl border bg-card p-4">
      <h2 className="text-lg font-bold">Diễn biến checkpoint</h2><p className="text-sm text-muted-foreground">{s.phase ? phaseLabel[s.phase] : "Chờ tạo lượt"} · {history.length} VĐV đã qua. Dữ liệu của lượt hiện tại; reset sẽ thay diễn biến.</p>
      {s.athletes.filter(a => a.sos).map(a => <p key={a.registrationId} className="text-sm text-red-700">SOS giả lập · BIB {a.bib} · {a.fullName}</p>)}
      <ol className="max-h-[32rem] space-y-2 overflow-y-auto">{history.map(a => <li key={a.registrationId} className="rounded-lg border p-3 text-sm"><strong>BIB {a.bib} · {a.fullName}</strong><p>Qua {s.checkpoint.name} · Giả lập {formatSimClock(a.passedAtSeconds)}</p><p className="text-xs text-muted-foreground">Nguồn: Hệ thống giả lập</p></li>)}</ol>{!history.length && <p className="text-sm text-muted-foreground">Chưa có VĐV qua checkpoint.</p>}
    </section>}
    {tab === "journal" && <div role="tabpanel" id="panel-journal" aria-labelledby="tab-journal"><StaffJournal eventId={s.eventId} runId={s.runId} version={s.historyVersion} onAccessLost={onAccessLost} /></div>}
    <section className={`${s.phase === "Finished" ? "border-orange-400 " : ""}flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm`}>
      <div><h2 className="font-bold">Gửi kết quả checkpoint</h2><p className="mt-1 text-xs text-muted-foreground">Chốt giờ qua mốc và các ghi nhận tại checkpoint sau khi lượt kết thúc, DQ đã được xử lý.</p>
        {submittedAt ? <p className="mt-1 text-xs font-semibold text-emerald-700">Đã gửi lúc {new Date(submittedAt).toLocaleString("vi-VN")} · {exported?.staffName || s.submittedByName || s.submittedBy || "Staff"} · Đã khóa checkpoint</p>
          : <p className="mt-1 text-xs text-muted-foreground">{!connected ? "Cần kết nối dữ liệu mới trước khi gửi." : s.exportBlockedReason}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Báo cáo là ảnh chụp tại lúc gửi. Kết quả chính thức do organizer ghi nhận.</p>{exportError && <p role="alert" className="mt-1 text-xs text-red-700">{exportError}</p>}</div>
      <Button disabled={!connected || !s.canSubmitExport || exportBusy || !!submittedAt} onClick={() => void sendExport()}>{exportBusy ? "Đang gửi…" : submittedAt ? "Đã gửi kết quả" : "Gửi cho organizer"}</Button>
    </section>
    <Dialog open={!!action} onOpenChange={open => { if (!open && !busy) setAction(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{action?.status === "DQ" ? "Báo cáo vi phạm" : `Xác nhận ${action?.status || ""}`}</DialogTitle><DialogDescription>BIB {action?.athlete.bib} · {action?.athlete.fullName} · {s.checkpoint.name}. {action?.status === "DQ" ? "Organizer sẽ xem xét trước khi quyết định DQ." : "Kiểm tra đúng VĐV trước khi ghi nhận."}</DialogDescription></DialogHeader>
      <div className="space-y-2"><label htmlFor="decision-reason" className="text-sm font-medium">Lý do *</label><textarea id="decision-reason" disabled={busy} required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm" /></div>
      {action?.status === "DQ" && <div className="space-y-2"><label htmlFor="decision-evidence" className="text-sm font-medium">Mô tả / đường dẫn bằng chứng</label><textarea id="decision-evidence" disabled={busy} maxLength={2000} value={evidence} onChange={e => setEvidence(e.target.value)} className="min-h-20 w-full rounded-md border bg-background p-3 text-sm" /></div>}
      {!connected && <div className="space-y-2"><p role="status" className="text-sm text-amber-800">Đang chờ dữ liệu mới; nội dung bạn nhập được giữ lại.</p><Button variant="outline" onClick={onReconnect}>Kết nối lại</Button></div>}{!allowed && <p role="status" className="text-sm text-amber-800">Trạng thái đã thay đổi; thao tác này không còn khả dụng.</p>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setAction(null)}>Hủy</Button><Button disabled={busy || !allowed || !connected} onClick={() => void submit()}>{busy ? "Đang gửi…" : action?.status === "DQ" ? "Gửi báo cáo" : "Xác nhận"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
