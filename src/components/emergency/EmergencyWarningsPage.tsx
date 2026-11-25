"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  History,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { RouteTab } from "@/context/ActiveTabContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  dismissCutoffWarning,
  getCutoffWarningPassages,
  listCutoffWarnings,
  type CutoffWarning,
  type CutoffWarningList,
  type CutoffWarningPassages,
  type CutoffWarningStatusFilter,
} from "@/api/cutoff-warnings";
import { useCutoffWarningFeed } from "@/stores/cutoff-warning-store";
import { getApiErrorMessage } from "@/lib/error";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { formatAgo, formatClock } from "./format";

const STATUS_FILTERS: { value: CutoffWarningStatusFilter; label: string }[] = [
  { value: "Active", label: "Đang cảnh báo" },
  { value: "Resolved", label: "Đã tự đóng" },
  { value: "Dismissed", label: "Đã gỡ" },
  { value: "All", label: "Tất cả" },
];

const PAGE_SIZE = 50;
const COLUMN_COUNT = 9;

export default function EmergencyWarningsPage() {
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState<CutoffWarningStatusFilter>("Active");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CutoffWarningList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [passagesFor, setPassagesFor] = useState<CutoffWarning | null>(null);
  const [dismissing, setDismissing] = useState<CutoffWarning | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const connected = useCutoffWarningFeed((s) => s.connected);
  const version = useCutoffWarningFeed((s) => s.version);
  const freshIds = useCutoffWarningFeed((s) => s.freshIds);

  // Debounce typing so every key press is not a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    // Live updates refresh in place; only filter changes show the loading state.
    const timer = setTimeout(() => {
      listCutoffWarnings({ eventId: eventId || undefined, status, search: search || undefined, page, pageSize: PAGE_SIZE })
        .then((result) => {
          if (!active) return;
          setData(result);
          setError(null);
        })
        .catch((err) => {
          if (active) setError(getApiErrorMessage(err, "Không tải được danh sách cảnh báo."));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, version > 0 ? 250 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [eventId, status, search, page, reload, version]);

  const changeFilter = useCallback((apply: () => void) => {
    setLoading(true);
    setExpandedId(null);
    apply();
  }, []);

  const totalActive = useMemo(
    () => (data?.events ?? []).filter((e) => !eventId || e.eventId === eventId).reduce((sum, e) => sum + e.activeCount, 0),
    [data, eventId],
  );
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const onDismissed = (updated: CutoffWarning) => {
    setDismissing(null);
    setExpandedId(null);
    setData((current) =>
      current && {
        ...current,
        items: status === "Active" || status === "Resolved"
          ? current.items.filter((item) => item.id !== updated.id)
          : current.items.map((item) => (item.id === updated.id ? updated : item)),
      });
    setReload((x) => x + 1);
  };

  return (
    <RouteTab tab="emergency">
      <div className="space-y-5" lang="vi">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">An toàn ngày đua</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Khẩn cấp</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Vận động viên chưa qua checkpoint trước giờ cut-off. Hệ thống kiểm tra mỗi 30 giây và tự đóng cảnh báo
              khi ghi nhận được lượt qua đến muộn.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LiveIndicator connected={connected} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeFilter(() => setReload((x) => x + 1))}
              disabled={loading}
              aria-label="Làm mới danh sách cảnh báo"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
              Làm mới
            </Button>
          </div>
        </header>

        <section aria-label="Tổng quan" className="grid gap-3 sm:grid-cols-3">
          <SummaryTile
            icon={AlertTriangle}
            tone="rose"
            label="VĐV đang bị cảnh báo"
            value={data ? String(totalActive) : "—"}
          />
          <SummaryTile
            icon={MapPin}
            tone="amber"
            label="Giải đang theo dõi"
            value={data ? String(data.events.length) : "—"}
          />
          <SummaryTile
            icon={History}
            tone="slate"
            label={`Kết quả lọc: ${STATUS_FILTERS.find((s) => s.value === status)?.label.toLowerCase() ?? ""}`}
            value={data ? String(data.total) : "—"}
          />
        </section>

        <section aria-label="Bộ lọc" className="flex flex-col gap-3 rounded-xl border bg-card p-3 xl:flex-row xl:items-center">
          <div role="radiogroup" aria-label="Trạng thái cảnh báo" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 xl:shrink-0 xl:flex-nowrap">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={status === option.value}
                onClick={() => changeFilter(() => { setStatus(option.value); setPage(1); })}
                className={cn(
                  "min-h-9 rounded-md px-3 text-sm font-medium transition-colors",
                  status === option.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="emergency-event">Giải</label>
          <select
            id="emergency-event"
            value={eventId}
            onChange={(e) => changeFilter(() => { setEventId(e.target.value); setPage(1); })}
            className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm xl:w-56"
          >
            <option value="">Tất cả giải của tôi</option>
            {(data?.events ?? []).map((e) => (
              <option key={e.eventId} value={e.eventId}>
                {e.eventName}{e.activeCount ? ` (${e.activeCount} đang cảnh báo)` : ""}
              </option>
            ))}
          </select>
          <div className="relative min-w-0 xl:ml-auto xl:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm BIB, tên, checkpoint"
              aria-label="Tìm cảnh báo"
              className="pl-9"
            />
          </div>
        </section>

        <section aria-label="Vận động viên cần chú ý" className="overflow-hidden rounded-xl border bg-card">
          {error && data && (
            <div role="alert" className="flex items-center justify-between gap-3 border-b bg-destructive/10 px-4 py-2 text-sm">
              <span>{error} Đang hiển thị danh sách tải gần nhất.</span>
              <Button size="sm" variant="outline" onClick={() => changeFilter(() => setReload((x) => x + 1))}>Thử lại</Button>
            </div>
          )}
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {/* The longer Vietnamese labels wrap instead of widening the table. */}
                <TableHead className="w-8"><span className="sr-only">Mở rộng</span></TableHead>
                <TableHead>BIB</TableHead>
                <TableHead className="min-w-40">Vận động viên</TableHead>
                <TableHead className="whitespace-normal leading-tight">Checkpoint bị lỡ</TableHead>
                <TableHead>Giờ cut-off</TableHead>
                <TableHead className="whitespace-normal leading-tight">Checkpoint cuối đã qua</TableHead>
                <TableHead className="whitespace-normal leading-tight">Giờ qua cuối</TableHead>
                <TableHead className="whitespace-normal leading-tight">Giờ cảnh báo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !data ? (
                <SkeletonRows />
              ) : error && !data ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-10 text-center">
                    <div role="alert" className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
                      <p className="text-sm">{error}</p>
                      <Button size="sm" onClick={() => changeFilter(() => setReload((x) => x + 1))}>Thử lại</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data && data.items.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="size-8 text-emerald-500" aria-hidden="true" />
                      <p className="font-medium text-foreground">
                        {status === "Active" ? "Không có VĐV nào cần chú ý" : "Không có dữ liệu"}
                      </p>
                      <p className="text-sm">
                        {status === "Active"
                          ? "Mọi VĐV đã xuất phát đều đã qua các checkpoint đã hết giờ cut-off."
                          : "Không có cảnh báo nào khớp với bộ lọc."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((warning) => (
                  <WarningRow
                    key={warning.id}
                    warning={warning}
                    now={now}
                    fresh={freshIds.includes(warning.id)}
                    expanded={expandedId === warning.id}
                    dimmed={loading}
                    onToggle={() => setExpandedId((id) => (id === warning.id ? null : warning.id))}
                    onViewPassages={() => setPassagesFor(warning)}
                    onDismiss={() => setDismissing(warning)}
                  />
                ))
              )}
            </TableBody>
          </Table>
          {data && data.total > data.pageSize && (
            <nav aria-label="Phân trang" className="flex items-center justify-between border-t px-4 py-2 text-sm">
              <span className="text-muted-foreground">Trang {page}/{pageCount} · {data.total} cảnh báo</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => changeFilter(() => setPage((p) => p - 1))}>Trước</Button>
                <Button size="sm" variant="outline" disabled={page >= pageCount || loading} onClick={() => changeFilter(() => setPage((p) => p + 1))}>Sau</Button>
              </div>
            </nav>
          )}
        </section>
      </div>

      <PassagesDialog warning={passagesFor} onClose={() => setPassagesFor(null)} />
      <DismissDialog warning={dismissing} onClose={() => setDismissing(null)} onDismissed={onDismissed} />
    </RouteTab>
  );
}

function WarningRow({
  warning,
  now,
  fresh,
  expanded,
  dimmed,
  onToggle,
  onViewPassages,
  onDismiss,
}: {
  warning: CutoffWarning;
  now: number;
  fresh: boolean;
  expanded: boolean;
  dimmed: boolean;
  onToggle: () => void;
  onViewPassages: () => void;
  onDismiss: () => void;
}) {
  const detailId = `warning-detail-${warning.id}`;
  return (
    <Fragment>
      <TableRow
        onClick={onToggle}
        className={cn(
          "cursor-pointer",
          warning.status === "Active" && "border-l-4 border-l-rose-500",
          fresh && warning.status === "Active" && "bg-rose-500/5",
          dimmed && "opacity-60",
        )}
      >
        <TableCell className="w-8 pr-0">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={`${expanded ? "Ẩn" : "Xem"} chi tiết BIB ${warning.bibNumber}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </TableCell>
        <TableCell className="font-mono font-semibold">{warning.bibNumber}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{warning.runnerName}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge warning={warning} />
              {fresh && warning.status === "Active" && <Badge variant="live" className="px-1.5 py-0 text-[10px]">Mới</Badge>}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{warning.checkpointName}</div>
          <div className="text-xs text-muted-foreground">KM {warning.checkpointKm} · {warning.distanceName}</div>
        </TableCell>
        <TableCell className="whitespace-nowrap font-medium">{formatClock(warning.cutoffAtUtc)}</TableCell>
        <TableCell>{warning.lastCheckpointName ?? <span className="text-muted-foreground">Chưa có lượt qua</span>}</TableCell>
        <TableCell className="whitespace-nowrap">{formatClock(warning.lastPassedAtUtc)}</TableCell>
        <TableCell className="whitespace-nowrap">
          <div>{formatClock(warning.detectedAtUtc)}</div>
          {warning.status === "Active" && <div className="text-xs text-muted-foreground">{formatAgo(warning.detectedAtUtc, now)}</div>}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <RowActions warning={warning} onViewPassages={onViewPassages} onDismiss={onDismiss} />
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={COLUMN_COUNT} id={detailId} className="p-0">
            <WarningDetail warning={warning} onViewPassages={onViewPassages} onDismiss={onDismiss} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

function RowActions({
  warning,
  onViewPassages,
  onDismiss,
}: {
  warning: CutoffWarning;
  onViewPassages: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        variant="outline"
        onClick={onViewPassages}
        title="Xem checkpoint cuối"
        aria-label={`Xem checkpoint cuối của BIB ${warning.bibNumber}`}
      >
        <MapPin className="size-4" aria-hidden="true" />
        <span className="hidden 2xl:inline">Checkpoint cuối</span>
      </Button>
      {warning.status === "Active" && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDismiss}
          title="Gỡ khỏi danh sách cảnh báo"
          aria-label={`Gỡ BIB ${warning.bibNumber} khỏi danh sách cảnh báo`}
        >
          <UserX className="size-4" aria-hidden="true" />
          <span className="hidden 2xl:inline">Gỡ</span>
        </Button>
      )}
    </div>
  );
}

function WarningDetail({
  warning,
  onViewPassages,
  onDismiss,
}: {
  warning: CutoffWarning;
  onViewPassages: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="grid gap-4 px-6 py-4 md:grid-cols-[1fr_1fr_auto]">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Vận động viên</dt>
        <dd className="font-medium">{warning.runnerName}</dd>
        <dt className="text-muted-foreground">BIB</dt>
        <dd className="font-mono">{warning.bibNumber}</dd>
        <dt className="text-muted-foreground">Giải</dt>
        <dd>{warning.eventName}</dd>
        <dt className="text-muted-foreground">Cự ly</dt>
        <dd>{warning.distanceName}</dd>
        <dt className="text-muted-foreground">Trạng thái</dt>
        <dd><StatusBadge warning={warning} /></dd>
      </dl>
      <div className="space-y-2 text-sm">
        <p className="font-semibold">Lý do cảnh báo</p>
        <p className="text-muted-foreground">
          Không ghi nhận lượt qua tại <span className="font-medium text-foreground">{warning.checkpointName}</span> (KM {warning.checkpointKm}) trước
          giờ cut-off <span className="font-medium text-foreground">{formatClock(warning.cutoffAtUtc)}</span>.
        </p>
        <p className="text-muted-foreground">
          {warning.lastCheckpointName
            ? <>Lần cuối ghi nhận tại <span className="font-medium text-foreground">{warning.lastCheckpointName}</span> lúc {formatClock(warning.lastPassedAtUtc)}.</>
            : "Chưa ghi nhận lượt qua checkpoint nào của VĐV này."}
        </p>
        <Outcome warning={warning} />
      </div>
      <div className="flex flex-row gap-2 md:flex-col">
        <Button size="sm" variant="outline" onClick={onViewPassages}>
          <MapPin className="size-4" aria-hidden="true" /> Xem checkpoint cuối
        </Button>
        {warning.status === "Active" && (
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <UserX className="size-4" aria-hidden="true" /> Gỡ khỏi danh sách cảnh báo
          </Button>
        )}
      </div>
    </div>
  );
}

function Outcome({ warning }: { warning: CutoffWarning }) {
  if (warning.status === "Resolved") {
    const reason = {
      PassedCheckpoint: `Đã ghi nhận lượt qua tại ${warning.checkpointName}`,
      PassedLaterCheckpoint: "VĐV đã được ghi nhận tại checkpoint phía sau",
      RunnerStatusChanged: "Trạng thái thi đấu của VĐV đã thay đổi (về đích, DNS, DNF hoặc DQ)",
    }[warning.resolution ?? "PassedCheckpoint"];
    return <p className="text-emerald-600 dark:text-emerald-400">{reason} · tự đóng lúc {formatClock(warning.resolvedAtUtc)}.</p>;
  }
  if (warning.status === "Dismissed") {
    return (
      <p className="text-muted-foreground">
        Nhân sự đã gỡ lúc {formatClock(warning.dismissedAtUtc)}{warning.dismissalNote ? `: “${warning.dismissalNote}”` : "."}
      </p>
    );
  }
  return null;
}

function StatusBadge({ warning }: { warning: CutoffWarning }) {
  if (warning.status === "Active") return <Badge variant="live">Cảnh báo</Badge>;
  if (warning.status === "Resolved") return <Badge variant="success">Đã xác định</Badge>;
  return <Badge variant="secondary">Đã gỡ</Badge>;
}

function PassagesDialog({ warning, onClose }: { warning: CutoffWarning | null; onClose: () => void }) {
  return (
    <Dialog open={warning !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" lang="vi">
        <DialogHeader>
          <DialogTitle>Checkpoint cuối · BIB {warning?.bibNumber}</DialogTitle>
          <DialogDescription>{warning?.runnerName} · {warning?.distanceName}</DialogDescription>
        </DialogHeader>
        {warning && <PassagesBody key={warning.id} warningId={warning.id} />}
      </DialogContent>
    </Dialog>
  );
}

/** Keyed by warning, so each opening starts from a clean loading state. */
function PassagesBody({ warningId }: { warningId: string }) {
  const [result, setResult] = useState<CutoffWarningPassages | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCutoffWarningPassages(warningId)
      .then((data) => { if (active) setResult(data); })
      .catch((err) => { if (active) setError(getApiErrorMessage(err, "Không tải được lượt qua checkpoint.")); });
    return () => { active = false; };
  }, [warningId]);

  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;
  if (!result) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Đang tải lượt qua…
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {result.last ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Lượt qua gần nhất</p>
          <p className="mt-1 text-lg font-bold">{result.last.checkpointName}</p>
          <p className="text-sm text-muted-foreground">
            {formatClock(result.last.scannedAtUtc)} · {scanMethodLabel(result.last.scanMethod)}
          </p>
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm">Chưa ghi nhận lượt qua checkpoint nào của VĐV này.</p>
      )}
      {result.passages.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Tất cả lượt qua (mới nhất trước)</p>
          <ol className="divide-y rounded-lg border text-sm">
            {result.passages.map((p) => (
              <li key={p.scanId} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="font-medium">{p.checkpointName}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {formatClock(p.scannedAtUtc)}
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{p.scanMethod === "RFID" ? "RFID" : "Nhập tay"}</Badge>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const scanMethodLabel = (method: string) => (method === "RFID" ? "Đọc RFID" : "Nhập tay");

function DismissDialog({
  warning,
  onClose,
  onDismissed,
}: {
  warning: CutoffWarning | null;
  onClose: () => void;
  onDismissed: (updated: CutoffWarning) => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={warning !== null} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent lang="vi">
        {warning && (
          <DismissForm
            key={warning.id}
            warning={warning}
            saving={saving}
            setSaving={setSaving}
            onClose={onClose}
            onDismissed={onDismissed}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Keyed by warning, so the note starts empty for each runner. */
function DismissForm({
  warning,
  saving,
  setSaving,
  onClose,
  onDismissed,
}: {
  warning: CutoffWarning;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  onClose: () => void;
  onDismissed: (updated: CutoffWarning) => void;
}) {
  const [note, setNote] = useState("");

  const submit = async () => {
    setSaving(true);
    try {
      const updated = await dismissCutoffWarning(warning.id, note);
      toastSuccess(`Đã gỡ BIB ${warning.bibNumber} khỏi danh sách cảnh báo.`);
      onDismissed(updated);
    } catch (err) {
      toastError(err, "Không gỡ được cảnh báo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
        <DialogHeader>
          <DialogTitle>Gỡ BIB {warning.bibNumber} khỏi danh sách cảnh báo?</DialogTitle>
          <DialogDescription>
            Chỉ thực hiện sau khi đã xác nhận {warning.runnerName} an toàn. Đăng ký, lượt qua checkpoint và lịch sử
            thi đấu của VĐV vẫn được giữ nguyên; cảnh báo được lưu lại trong mục Đã gỡ.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="dismiss-note">Đã xác minh bằng cách nào? (không bắt buộc)</Label>
          <textarea
            id="dismiss-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="VD: VĐV đã gọi về ban tổ chức, đang nghỉ tại trạm tiếp nước số 3"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Gỡ khỏi danh sách
          </Button>
        </DialogFooter>
    </>
  );
}

function LiveIndicator({ connected }: { connected: boolean }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        connected ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-amber-500/30 text-amber-600 dark:text-amber-400",
      )}
    >
      <Radio className={cn("size-3.5", connected && "animate-pulse")} aria-hidden="true" />
      {connected ? "Trực tiếp" : "Đang kết nối lại…"}
    </span>
  );
}

function SummaryTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof AlertTriangle;
  tone: "rose" | "amber" | "slate";
  label: string;
  value: string;
}) {
  const tones = {
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    slate: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell colSpan={COLUMN_COUNT}>
            <div className="h-6 animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
