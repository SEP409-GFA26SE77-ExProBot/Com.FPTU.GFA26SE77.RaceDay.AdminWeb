"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RaceRouteMap, { Coordinate, Checkpoint } from "@/components/sections/RaceRouteMap";
import {
  RaceEventDto,
  parseEventRules,
} from "@/dto/event.dto";
import { mediaOpenUrl } from "@/lib/media-url";
import {
  MapPin,
  Calendar,
  Users,
  Info,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Globe,
  Navigation,
  FileText,
  ShieldCheck,
  Landmark,
  Clock,
  ExternalLink,
} from "lucide-react";

/** @deprecated alias — dùng RaceEventDto từ API */
export type EventItemType = RaceEventDto;

const CP_TYPE_MAP: Record<string, Checkpoint["type"]> = {
  water: "WATER",
  medical: "MEDICAL",
  aid: "WATER",
  cutoff: "TIMING",
  start: "CHECKPOINT",
  finish: "CHECKPOINT",
};

function formatMoney(n?: number | null, currency = "VND") {
  if (n == null || Number.isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(n)}${currency === "VND" ? "đ" : ` ${currency}`}`;
}

function statusLabel(status: string) {
  const s = (status || "").toLowerCase().replace(/_/g, "-");
  if (s === "pending" || s === "pending-approval") return "Chờ duyệt";
  if (s === "approved") return "Đã duyệt (Sắp mở ĐK)";
  if (s === "registration-open") return "Đang mở ĐK";
  return status.toUpperCase();
}

interface PendingEventInfoModalProps {
  event?: RaceEventDto | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** openRegistration: true = public ĐK ngay; false = chỉ approved (Sắp mở) */
  onApprove?: (event: RaceEventDto, openRegistration: boolean) => void | Promise<void>;
  onReject?: (event: RaceEventDto, reason: string) => void | Promise<void>;
  busy?: boolean;
}

export function PendingEventInfoModal({
  event: propEvent,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onApprove,
  onReject,
  busy = false,
}: PendingEventInfoModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen || setInternalOpen;

  const [openRegistration, setOpenRegistration] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const event = propEvent;
  const distances = event?.distances || [];
  const rules = parseEventRules(event?.rules);
  const docs = event?.documents || [];
  const bank = event?.organizer?.beneficiaryAccount;

  const [selectedDistanceKey, setSelectedDistanceKey] = useState<string>("");

  const distanceKey = (d: (typeof distances)[0], i: number) =>
    d.id || `${d.type}-${d.name}-${i}`;

  const activeKey =
    selectedDistanceKey ||
    (distances[0] ? distanceKey(distances[0], 0) : "");

  const activeDistance = useMemo(() => {
    const idx = distances.findIndex((d, i) => distanceKey(d, i) === activeKey);
    return distances[idx >= 0 ? idx : 0];
  }, [distances, activeKey]);

  const route: Coordinate[] = useMemo(() => {
    const line = activeDistance?.leafletPolyline;
    if (!Array.isArray(line) || !line.length) return [];
    return line
      .filter((p) => Array.isArray(p) && p.length >= 2)
      .map((point) => ({
        lat: Number(point[0]),
        lng: Number(point[1]),
      }));
  }, [activeDistance]);

  const startPoint: Coordinate = useMemo(() => {
    return {
      lat:
        activeDistance?.startLocation?.lat ??
        event?.coordinates?.lat ??
        10.7769,
      lng:
        activeDistance?.startLocation?.lng ??
        event?.coordinates?.lng ??
        106.7009,
    };
  }, [activeDistance, event]);

  const finishPoint: Coordinate = useMemo(() => {
    return {
      lat:
        activeDistance?.finishLocation?.lat ??
        event?.coordinates?.lat ??
        10.7769,
      lng:
        activeDistance?.finishLocation?.lng ??
        event?.coordinates?.lng ??
        106.7009,
    };
  }, [activeDistance, event]);

  const checkpoints: Checkpoint[] = useMemo(() => {
    const list = activeDistance?.checkpoints;
    if (!Array.isArray(list)) return [];
    return list
      .filter((cp) => cp.type !== "start" && cp.type !== "finish")
      .map((cp) => ({
        id: cp.id,
        name: cp.name,
        latitude: cp.lat,
        longitude: cp.lng,
        distanceFromStart: (cp.km || 0) * 1000,
        type: CP_TYPE_MAP[cp.type] ?? "CHECKPOINT",
        description: cp.cutoff
          ? `Cutoff: ${cp.cutoff}`
          : undefined,
      }));
  }, [activeDistance]);

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : null}

      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-background/95 backdrop-blur-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500" />

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="pending" className="text-[11px] font-bold">
                    {statusLabel(event.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                    {event.id}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground mt-1.5">
                  {event.name}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {event.tagline || event.description || "Hồ sơ giải từ User FE (CreateRaceEvent)."}
            </DialogDescription>
          </DialogHeader>

          {/* Thông tin chung — field FE nộp */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <Fact
              icon={<MapPin className="h-4 w-4 text-cyan-500 shrink-0" />}
              label="Địa điểm"
              value={event.location || "—"}
            />
            <Fact
              icon={<Calendar className="h-4 w-4 text-purple-500 shrink-0" />}
              label="Ngày đua"
              value={event.date || "—"}
            />
            <Fact
              icon={<Clock className="h-4 w-4 text-amber-500 shrink-0" />}
              label="Giờ xuất phát"
              value={event.startTime || "—"}
            />
            <Fact
              icon={<Users className="h-4 w-4 text-emerald-500 shrink-0" />}
              label="Quy mô (totalRunners)"
              value={`${(event.totalRunners ?? 0).toLocaleString("vi-VN")} VĐV`}
            />
          </div>

          {event.description ? (
            <div className="p-3.5 rounded-xl border border-border bg-card/40 text-sm text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </div>
          ) : null}

          {event.bannerImage ? (
            <div className="rounded-xl overflow-hidden border border-border max-h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.bannerImage}
                alt=""
                className="w-full h-40 object-cover"
              />
            </div>
          ) : null}

          {/* Đơn vị tổ chức + TK giải ngân */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Đơn vị tổ chức
              </span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {event.organizer?.name || "—"}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {event.organizer?.email || "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {event.organizer?.phone || "—"}
              </span>
              {event.organizer?.website ? (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {event.organizer.website}
                </span>
              ) : null}
            </div>
            {event.organizer?.legalEntity ? (
              <p className="text-xs text-muted-foreground">
                Pháp nhân:{" "}
                <span className="font-semibold text-foreground">
                  {event.organizer.legalEntity}
                </span>
              </p>
            ) : null}

            {bank && (bank.accountNumber || bank.bankName) ? (
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                  <Landmark className="h-3.5 w-3.5" />
                  TK giải ngân BTC
                </div>
                <p className="text-xs text-foreground">
                  {bank.accountHolder || "—"} · {bank.accountNumber || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bank.bankName || "—"}
                  {bank.branch ? ` · ${bank.branch}` : ""}
                </p>
                {bank.transferNote ? (
                  <p className="text-[11px] text-muted-foreground italic">
                    {bank.transferNote}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Cự ly — name / type / km / capacity / price (FE submit) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Cự ly đăng ký ({distances.length})
              </h4>
            </div>

            {distances.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có cự ly.</p>
            ) : (
              <Tabs
                value={activeKey}
                onValueChange={setSelectedDistanceKey}
                className="w-full"
              >
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/60 p-1 rounded-xl h-auto flex-wrap">
                  {distances.map((dist, i) => (
                    <TabsTrigger
                      key={distanceKey(dist, i)}
                      value={distanceKey(dist, i)}
                      className="text-xs font-semibold gap-1.5 data-[state=active]:bg-card"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: dist.color || "#f97316" }}
                      />
                      {dist.name || dist.type} ({dist.distanceKm} km)
                    </TabsTrigger>
                  ))}
                </TabsList>

                {distances.map((dist, i) => (
                  <TabsContent
                    key={distanceKey(dist, i)}
                    value={distanceKey(dist, i)}
                    className="space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <Metric label="Tên hạng mục" value={dist.name || "—"} />
                      <Metric label="Loại (type)" value={dist.type || "—"} />
                      <Metric
                        label="Cự ly"
                        value={`${dist.distanceKm ?? "—"} km`}
                      />
                      <Metric
                        label="Slot / Giá"
                        value={`${(dist.capacity ?? 0).toLocaleString("vi-VN")} · ${formatMoney(dist.price, dist.currency || "VND")}`}
                      />
                    </div>

                    {route.length > 1 ? (
                      <div className="rounded-xl overflow-hidden border border-border shadow-lg relative">
                        <RaceRouteMap
                          route={route}
                          startPoint={startPoint}
                          finishPoint={finishPoint}
                          checkpoints={checkpoints}
                          height="280px"
                          routeColor={dist.color || "#f97316"}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                        FE User hiện nộp cự ly không kèm polyline/checkpoint chi tiết —
                        chỉ có điểm start/finish mặc định theo địa điểm giải.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          {/* Hồ sơ bắt buộc */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Hồ sơ đính kèm ({docs.length})
              </span>
            </div>
            {docs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Chưa có document.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li
                    key={d.documentKey}
                    className="flex items-center justify-between gap-2 text-xs rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{d.title}</p>
                      <p className="text-muted-foreground">
                        {d.documentKey}
                        {d.required ? " · bắt buộc" : ""}
                        {d.fileName ? ` · ${d.fileName}` : ""}
                      </p>
                    </div>
                    {d.fileUrl ? (
                      <a
                        href={mediaOpenUrl(d.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-purple-500 hover:underline shrink-0"
                        title={mediaOpenUrl(d.fileUrl)}
                      >
                        Mở <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Không URL</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Điều kiện an toàn + liên hệ — rules từ FE */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                An toàn & đầu mối
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <Mini label="Liên hệ cơ quan chức năng" value={rules.authorityContact} />
              <Mini label="Đối tác y tế" value={rules.medicalPartner} />
              <Mini label="Chốt an ninh" value={String(rules.securityPosts ?? "")} />
              <Mini label="Trạm hỗ trợ" value={String(rules.aidStations ?? "")} />
              <Mini label="Người liên hệ" value={rules.contactName} />
            </div>
            {Array.isArray(rules.safetyChecklist) && rules.safetyChecklist.length > 0 ? (
              <ul className="space-y-1.5 mt-2">
                {rules.safetyChecklist.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2
                      className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                        item.checked ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <span className={item.checked ? "text-foreground" : ""}>
                      {item.label || `Điều kiện ${i + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {rules.settlementNote ? (
              <p className="text-[11px] text-muted-foreground italic border-t border-border pt-2">
                {rules.settlementNote}
              </p>
            ) : null}
          </div>

          {/* Duyệt: giải thích public vs sắp mở */}
          {onApprove ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Khi duyệt giải
              </p>
              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={openRegistration}
                  onChange={(e) => setOpenRegistration(e.target.checked)}
                  disabled={busy}
                />
                <span>
                  <span className="font-semibold text-foreground">
                    Mở đăng ký ngay (public ĐK)
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Bật → status <code>registration-open</code> (User FE: Đang mở).
                    Tắt (mặc định) → <code>approved</code> (User FE: Sắp mở). API
                    không tự mở ĐK nếu không gửi{" "}
                    <code>openRegistration: true</code>.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {showReject ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 space-y-2">
              <p className="text-xs font-bold text-red-600 uppercase">Lý do từ chối</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Nhập lý do (bắt buộc)…"
                disabled={busy}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="p-4 px-6 border-t border-border bg-muted/20 flex flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {onReject && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={async () => {
                  if (!showReject) {
                    setShowReject(true);
                    return;
                  }
                  if (!rejectReason.trim()) return;
                  await onReject(event, rejectReason.trim());
                  setIsOpen(false);
                  setShowReject(false);
                  setRejectReason("");
                }}
              >
                {showReject ? "Xác nhận từ chối" : "Từ chối"}
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                size="sm"
                disabled={busy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                onClick={async () => {
                  await onApprove(event, openRegistration);
                  setIsOpen(false);
                  setOpenRegistration(false);
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {openRegistration ? "Duyệt & mở ĐK" : "Duyệt (Sắp mở)"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {icon}
      <div className="min-w-0">
        <div className="text-[10px] uppercase font-bold text-muted-foreground">
          {label}
        </div>
        <div
          className="text-xs font-semibold text-foreground truncate"
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border">
      <div className="text-[10px] text-muted-foreground uppercase font-bold">
        {label}
      </div>
      <div className="text-sm font-bold text-foreground mt-0.5 break-words">
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2">
      <p className="text-[10px] uppercase font-bold text-muted-foreground">
        {label}
      </p>
      <p className="font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

export default PendingEventInfoModal;
