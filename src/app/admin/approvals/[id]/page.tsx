"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  Landmark,
  Loader2,
  MapPin,
  Navigation,
  Route,
  Ticket,
  Users,
  XCircle,
} from "lucide-react";
import {
  approveEvent,
  getAdminEventById,
  rejectEvent,
} from "@/api/admin-events";
import { getEventCourse, courseHasRoute } from "@/api/race-map";
import { Badge, Button, Card } from "@/components/ui";
import RaceRouteMap, {
  type Checkpoint,
  type Coordinate,
} from "@/components/sections/RaceRouteMap";
import type { RaceEventDto } from "@/dto/event.dto";
import type { CourseConfigDto } from "@/dto/race-map.dto";
import { getApiErrorMessage } from "@/lib/error";
import { mediaOpenUrl } from "@/lib/media-url";
import { courseToRoute, courseToCheckpoints } from "@/lib/race-map.mapper";
import {
  buildOrganizerSetupChecklist,
  checklistReady,
  type SetupCheckId,
  type SetupCheckItem,
} from "@/lib/organizer-setup-checklist";
import { RouteTab } from "@/context/ActiveTabContext";

function formatMoney(n?: number | null, currency = "VND") {
  if (n == null || Number.isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(n)}${
    currency === "VND" ? "đ" : ` ${currency}`
  }`;
}

function formatDt(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

const SECTION_NAV: { id: SetupCheckId; label: string; icon: typeof FileText }[] =
  [
    { id: "basic", label: "Thông tin cơ bản", icon: Building2 },
    { id: "organizer", label: "Ban tổ chức", icon: Users },
    { id: "bank", label: "TK giải ngân", icon: Landmark },
    { id: "distances", label: "Cự ly", icon: Route },
    { id: "pricing", label: "Giá vé", icon: Ticket },
    { id: "docs", label: "Tài liệu", icon: FileText },
    { id: "map", label: "Bản đồ", icon: Navigation },
  ];

export default function AdminEventReviewPage() {
  const params = useParams();
  const eventId = String(params?.id || "");
  return <AdminEventReview key={eventId} eventId={eventId} />;
}

function AdminEventReview({ eventId }: { eventId: string }) {
  const router = useRouter();

  const [event, setEvent] = useState<RaceEventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    basic: true,
    map: true,
    docs: true,
  });
  const [activeDistanceIdx, setActiveDistanceIdx] = useState(0);
  /** Keep successful empty courses; null means the request failed. */
  const [coursesByDistanceId, setCoursesByDistanceId] = useState<
    Record<string, CourseConfigDto | null>
  >({});
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAdminEventById(eventId);
        if (!active) return;
        setEvent(data);

        const distances = data.distances || [];
        if (distances.length === 0) {
          setCoursesByDistanceId({});
          setCoursesLoaded(true);
        } else {
          // Map lưu ở Map module (không phải field distance) — luôn hỏi API.
          const entries = await Promise.all(
            distances.map(async (d) => {
              if (!d.id) return ["", null, "Cự ly chưa có ID."] as const;
              try {
                const course = await getEventCourse(eventId, d.id);
                return [d.id, course, null] as const;
              } catch (error) {
                return [d.id, null, getApiErrorMessage(error, "Không tải được cung đường.")] as const;
              }
            })
          );
          if (!active) return;
          setCoursesByDistanceId(Object.fromEntries(entries.map(([id, course]) => [id, course])));
          setCourseErrors(Object.fromEntries(entries.flatMap(([id, , error]) => error ? [[id, error]] : [])));
          setCoursesLoaded(true);
        }
      } catch (e) {
        if (!active) return;
        setError(getApiErrorMessage(e, "Không tải được hồ sơ giải."));
        setEvent(null);
        setCoursesLoaded(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [eventId]);

  const mapHint = useMemo(() => {
    if (!event) return undefined;
    const distances = event.distances || [];
    if (!coursesLoaded) {
      return { mapOk: false, mapSummary: "Đang kiểm tra map…" };
    }
    const withMap = distances.filter(
      (d) => d.id && courseHasRoute(coursesByDistanceId[d.id] ?? null)
    ).length;
    const mapOk = withMap > 0;
    return {
      mapOk,
      mapSummary: mapOk
        ? `${withMap}/${distances.length} cự ly có cung đường`
        : Object.keys(courseErrors).length ? "Không tải được cung đường từ Map API" : "Chưa thiết lập cung đường",
    };
  }, [event, coursesByDistanceId, coursesLoaded, courseErrors]);

  const checks = useMemo(
    () => (event ? buildOrganizerSetupChecklist(event, mapHint) : []),
    [event, mapHint]
  );
  const checkById = useMemo(() => {
    const m = new Map<SetupCheckId, SetupCheckItem>();
    for (const c of checks) m.set(c.id, c);
    return m;
  }, [checks]);
  const ready = checklistReady(checks);
  const distances = event?.distances || [];
  const activeDistance = distances[activeDistanceIdx] || distances[0];
  const docs = event?.documents || [];

  const activeCourse = useMemo(() => {
    const id = activeDistance?.id;
    if (id && coursesByDistanceId[id]) return coursesByDistanceId[id];
    return null;
  }, [activeDistance?.id, coursesByDistanceId]);

  const route = useMemo(() => courseToRoute(activeCourse), [activeCourse]);
  const checkpoints = useMemo(() => courseToCheckpoints(activeCourse), [activeCourse]);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleApprove = async () => {
    if (!event || busy) return;
    setBusy(true);
    setError(null);
    try {
      await approveEvent(event.id, false);
      router.push("/approvals");
    } catch (e) {
      setError(getApiErrorMessage(e, "Duyệt giải thất bại."));
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!event || busy) return;
    if (!showReject) {
      setShowReject(true);
      return;
    }
    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rejectEvent(event.id, rejectReason.trim());
      router.push("/approvals");
    } catch (e) {
      setError(getApiErrorMessage(e, "Từ chối giải thất bại."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <RouteTab tab="approvals">
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          Đang tải hồ sơ xét duyệt…
        </div>
      </RouteTab>
    );
  }

  if (!event) {
    return (
      <RouteTab tab="approvals">
        <div className="space-y-4">
          <Link
            href="/approvals"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
          <Card className="p-6 text-sm text-red-600">
            {error || "Không tìm thấy hồ sơ."}
          </Card>
        </div>
      </RouteTab>
    );
  }

  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Duyệt giải
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              {event.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge type="amber" className="text-[10px] font-bold">
                Chờ duyệt
              </Badge>
              {!ready ? (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Checklist organizer chưa đủ mục bắt buộc
                </span>
              ) : (
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Đủ checklist bắt buộc
                </span>
              )}
            </div>
            {event.tagline ? (
              <p className="mt-1 text-sm text-muted-foreground">{event.tagline}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={() => void handleReject()}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              {showReject ? "Xác nhận từ chối" : "Từ chối"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void handleApprove()}
              className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Duyệt
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {showReject ? (
          <Card className="space-y-2 border-red-500/25 bg-red-500/5 p-4">
            <p className="text-xs font-bold uppercase text-red-600">
              Lý do từ chối (bắt buộc)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="VD: Hồ sơ an ninh chưa đủ, cung đường chưa rõ…"
              disabled={busy}
            />
          </Card>
        ) : null}

        {/* Layout: sidebar checklist + detail — giống panel organizer */}
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-border/60 bg-card p-3 shadow-sm lg:sticky lg:top-4">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Checklist hồ sơ
            </p>
            <nav className="space-y-0.5">
              {SECTION_NAV.map((s) => {
                const c = checkById.get(s.id);
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#sec-${s.id}`}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition hover:bg-orange-500/10"
                  >
                    {c?.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle
                        className={`h-3.5 w-3.5 shrink-0 ${
                          c?.required ? "text-amber-500" : "text-slate-300"
                        }`}
                      />
                    )}
                    <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    {c?.required ? (
                      <span className="text-[9px] text-muted-foreground">*</span>
                    ) : null}
                  </a>
                );
              })}
            </nav>
            <p className="mt-3 border-t border-border/60 px-2 pt-3 text-[10px] text-muted-foreground">
              * Mục bắt buộc (organizer phải đủ trước khi gửi duyệt). Admin vẫn
              có thể duyệt / từ chối theo đánh giá.
            </p>
          </aside>

          <div className="space-y-3">
            {/* Overview strip */}
            <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <Fact
                icon={<MapPin className="h-4 w-4 text-orange-500" />}
                label="Địa điểm"
                value={event.location || "—"}
              />
              <Fact
                icon={<Calendar className="h-4 w-4 text-orange-500" />}
                label="Ngày tổ chức"
                value={
                  event.endDate
                    ? `${event.date} → ${event.endDate}`
                    : event.date || "—"
                }
              />
              <Fact
                icon={<Users className="h-4 w-4 text-orange-500" />}
                label="Quy mô"
                value={`${(event.totalRunners ?? 0).toLocaleString("vi-VN")} VĐV`}
              />
              <Fact
                icon={<Building2 className="h-4 w-4 text-orange-500" />}
                label="Ban tổ chức"
                value={event.organizer?.name || "—"}
              />
            </Card>

            {SECTION_NAV.map((s) => {
              const c = checkById.get(s.id);
              const open = expanded[s.id] ?? false;
              return (
                <section
                  key={s.id}
                  id={`sec-${s.id}`}
                  className="scroll-mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
                  >
                    {c?.ok ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 shrink-0 ${
                          c?.required ? "text-amber-500" : "text-slate-300"
                        }`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">
                        {s.label}
                        {c?.required ? (
                          <span className="ml-1 text-[10px] font-semibold text-amber-600">
                            bắt buộc
                          </span>
                        ) : (
                          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                            khuyến nghị
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c?.summary}
                      </p>
                    </div>
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {open ? (
                    <div className="border-t border-border/60 px-4 py-4">
                      {s.id === "basic" ? (
                        <BasicDetail event={event} />
                      ) : null}
                      {s.id === "organizer" ? (
                        <OrganizerDetail event={event} />
                      ) : null}
                      {s.id === "bank" ? (
                        <BankDetail event={event} />
                      ) : null}
                      {s.id === "distances" ? (
                        <DistancesDetail
                          event={event}
                          activeIdx={activeDistanceIdx}
                          onSelect={setActiveDistanceIdx}
                          coursesByDistanceId={coursesByDistanceId}
                        />
                      ) : null}
                      {s.id === "pricing" ? (
                        <PriceTableOnly event={event} />
                      ) : null}
                      {s.id === "docs" ? (
                        <DocsDetail docs={docs} />
                      ) : null}
                      {s.id === "map" ? (
                        <MapDetail
                          event={event}
                          activeIdx={activeDistanceIdx}
                          onSelect={setActiveDistanceIdx}
                          route={route}
                          checkpoints={checkpoints}
                          coursesByDistanceId={coursesByDistanceId}
                          coursesLoaded={coursesLoaded}
                          activeCourse={activeCourse}
                          courseError={courseErrors[activeDistance?.id ?? ""]}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </RouteTab>
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
    <div className="flex min-w-0 items-center gap-2.5">
      {icon}
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-xs font-semibold" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm sm:grid-cols-[180px_1fr]">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground break-words">{value || "—"}</dd>
    </div>
  );
}

function BasicDetail({ event }: { event: RaceEventDto }) {
  return (
    <dl className="space-y-2.5">
      <Row label="Tên giải" value={event.name} />
      <Row label="Tagline" value={event.tagline} />
      <Row label="Địa điểm" value={event.location} />
      <Row label="Ngày tổ chức" value={event.date} />
      <Row label="Ngày kết thúc" value={event.endDate} />
      <Row label="Giờ xuất phát" value={event.startTime} />
      <Row
        label="Quy mô"
        value={`${(event.totalRunners ?? 0).toLocaleString("vi-VN")} VĐV`}
      />
      <Row
        label="Mở đăng ký"
        value={formatDt(event.registrationOpensAtUtc)}
      />
      <Row
        label="Đóng đăng ký"
        value={formatDt(event.registrationClosesAtUtc)}
      />
      {event.description ? (
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
          {event.description}
        </div>
      ) : null}
      {event.bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.bannerImage}
          alt=""
          className="mt-2 h-36 w-full rounded-xl border border-border object-cover"
        />
      ) : null}
    </dl>
  );
}

function OrganizerDetail({ event }: { event: RaceEventDto }) {
  const o = event.organizer;
  return (
    <dl className="space-y-2.5">
      <Row label="Tên BTC" value={o?.name} />
      <Row label="Email" value={o?.email} />
      <Row label="SĐT" value={o?.phone} />
      <Row label="Pháp nhân" value={o?.legalEntity} />
      <Row label="Website" value={o?.website} />
    </dl>
  );
}

function BankDetail({ event }: { event: RaceEventDto }) {
  const b = event.organizer?.beneficiaryAccount;
  if (!b?.accountNumber && !b?.bankName) {
    return (
      <p className="text-sm text-muted-foreground">
        Organizer chưa khai báo tài khoản nhận tiền giải ngân.
      </p>
    );
  }
  return (
    <dl className="space-y-2.5">
      <Row label="Chủ TK" value={b.accountHolder} />
      <Row label="Số TK" value={b.accountNumber} />
      <Row label="Ngân hàng" value={b.bankName} />
      <Row label="Chi nhánh" value={b.branch} />
      <Row label="Ghi chú CK" value={b.transferNote} />
    </dl>
  );
}

function PriceTableOnly({ event }: { event: RaceEventDto }) {
  const distances = event.distances || [];
  if (!distances.length) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có cự ly / giá.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase text-muted-foreground">
            <th className="py-2 pr-3">Cự ly</th>
            <th className="py-2 pr-3">Giá</th>
            <th className="py-2">Sức chứa</th>
          </tr>
        </thead>
        <tbody>
          {distances.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border/50">
              <td className="py-2 pr-3 font-semibold">
                {row.name || `${row.distanceKm}K`}
              </td>
              <td className="py-2 pr-3">
                {formatMoney(row.price, row.currency || "VND")}
              </td>
              <td className="py-2">
                {(row.capacity ?? 0).toLocaleString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistancesDetail({
  event,
  activeIdx,
  onSelect,
  coursesByDistanceId,
}: {
  event: RaceEventDto;
  activeIdx: number;
  onSelect: (i: number) => void;
  coursesByDistanceId: Record<string, CourseConfigDto | null>;
}) {
  const distances = event.distances || [];
  if (!distances.length) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có cự ly nào.</p>
    );
  }
  const d = distances[activeIdx] || distances[0];
  const hasMap = Boolean(
    d.id && courseHasRoute(coursesByDistanceId[d.id] ?? null)
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {distances.map((dist, i) => {
          const mapped = Boolean(
            dist.id && courseHasRoute(coursesByDistanceId[dist.id] ?? null)
          );
          return (
            <button
              key={dist.id || `${dist.name}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                i === activeIdx
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-border hover:border-orange-400"
              }`}
            >
              {dist.name || `${dist.distanceKm}K`}
              {mapped ? (
                <span className="ml-1 opacity-80">· map</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <dl className="space-y-2">
        <Row label="Tên" value={d.name} />
        <Row label="Loại mặt đường" value={d.type} />
        <Row label="Quãng đường" value={`${d.distanceKm} km`} />
        <Row
          label="Sức chứa"
          value={(d.capacity ?? 0).toLocaleString("vi-VN")}
        />
        <Row
          label="Giá"
          value={formatMoney(d.price, d.currency || "VND")}
        />
        <Row
          label="Bản đồ"
          value={hasMap ? "Đã có cung đường" : "Chưa thiết lập map"}
        />
      </dl>
      <p className="text-[11px] text-muted-foreground">
        Xem bản đồ / chú thích marker ở mục <strong>Bản đồ</strong> bên dưới.
      </p>
    </div>
  );
}

function DocsDetail({
  docs,
}: {
  docs: NonNullable<RaceEventDto["documents"]>;
}) {
  if (!docs?.length) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có tài liệu đính kèm.</p>
    );
  }
  return (
    <ul className="space-y-2">
      {docs.map((d) => (
        <li
          key={d.documentKey}
          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs"
        >
          <div>
            <p className="font-semibold text-foreground">{d.title}</p>
            <p className="text-muted-foreground">
              {d.required ? "Bắt buộc" : "Tuỳ chọn"}
              {d.fileName ? ` · ${d.fileName}` : ""}
            </p>
          </div>
          {d.fileUrl ? (
            <a
              href={mediaOpenUrl(d.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-semibold text-orange-600 hover:underline"
            >
              Mở <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-amber-600">Chưa upload</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function MapLegend() {
  const items: { color: string; label: string; hint: string }[] = [
    { color: "#0f766e", label: "Xuất phát (S)", hint: "Điểm start" },
    { color: "#b91c1c", label: "Vạch đích (F)", hint: "Điểm finish" },
    { color: "#c2410c", label: "Chấm cam", hint: "Checkpoint timing (CP)" },
    { color: "#a16207", label: "Chấm nâu", hint: "Điểm tiếp tế (aid)" },
    { color: "#3B82F6", label: "Chấm xanh", hint: "Trạm nước (water)" },
    { color: "#EF4444", label: "Chấm đỏ", hint: "Trạm y tế (medical)" },
    { color: "#c2410c", label: "Cutoff", hint: "Điểm giới hạn thời gian" },
    { color: "#ea580c", label: "Đường cam", hint: "Polyline cung đường" },
  ];
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Chú thích bản đồ
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
              style={{ background: it.color }}
            />
            <span>
              <span className="font-semibold text-foreground">{it.label}</span>
              <span className="text-muted-foreground"> — {it.hint}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MapDetail({
  event,
  activeIdx,
  onSelect,
  route,
  checkpoints,
  coursesByDistanceId,
  coursesLoaded,
  activeCourse,
  courseError,
}: {
  event: RaceEventDto;
  activeIdx: number;
  onSelect: (i: number) => void;
  route: Coordinate[];
  checkpoints: Checkpoint[];
  coursesByDistanceId: Record<string, CourseConfigDto | null>;
  coursesLoaded: boolean;
  activeCourse: CourseConfigDto | null;
  courseError?: string;
}) {
  const distances = event.distances || [];
  if (!distances.length) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có cự ly để gắn map.</p>
    );
  }
  const d = distances[activeIdx] || distances[0];
  const start = activeCourse?.checkpoints?.find((c) => c.type === "start");
  const finish = activeCourse?.checkpoints?.find((c) => c.type === "finish");
  const startPoint = {
    lat:
      start?.lat ??
      route[0]?.lat ??
      activeCourse?.waypoints[0]?.lat ??
      d.startLocation?.lat ??
      event.coordinates?.lat ??
      10.78,
    lng:
      start?.lng ??
      route[0]?.lng ??
      activeCourse?.waypoints[0]?.lng ??
      d.startLocation?.lng ??
      event.coordinates?.lng ??
      106.7,
  };
  const last = route[route.length - 1] ?? activeCourse?.waypoints[activeCourse.waypoints.length - 1];
  const finishPoint = {
    lat:
      finish?.lat ??
      last?.lat ??
      d.finishLocation?.lat ??
      event.coordinates?.lat ??
      10.78,
    lng:
      finish?.lng ??
      last?.lng ??
      d.finishLocation?.lng ??
      event.coordinates?.lng ??
      106.7,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {distances.map((dist, i) => {
          const mapped = Boolean(
            dist.id && courseHasRoute(coursesByDistanceId[dist.id] ?? null)
          );
          return (
            <button
              key={dist.id || `${dist.name}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                i === activeIdx
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-border hover:border-orange-400"
              }`}
            >
              {dist.name || `${dist.distanceKm}K`}
              {mapped ? " · đã có map" : " · chưa map"}
            </button>
          );
        })}
      </div>

      <MapLegend />

      {activeCourse && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{activeCourse.title || d.name || "Cung đường"} · {activeCourse.distanceKm} km · {activeCourse.waypoints.length} điểm điều hướng · {activeCourse.checkpoints.length} điểm trên đường</p>
          <p>Cập nhật: <time dateTime={activeCourse.updatedAt}>{formatDt(activeCourse.updatedAt)}</time></p>
        </div>
      )}

      {!coursesLoaded ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
          Đang tải cung đường từ Map API…
        </div>
      ) : courseError ? (
        <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2.5 text-xs text-red-600">{courseError}</p>
      ) : route.length > 1 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {activeCourse?.title || d.name || "Cung đường"}
            {activeCourse?.distanceKm
              ? ` · ${activeCourse.distanceKm.toFixed(2)} km`
              : ""}
            {checkpoints.length
              ? ` · ${checkpoints.length} điểm kiểm soát / hỗ trợ`
              : ""}
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            <RaceRouteMap
              route={route}
              startPoint={startPoint}
              finishPoint={finishPoint}
              checkpoints={checkpoints}
              height="320px"
              routeColor="#ea580c"
            />
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          Cự ly này chưa có polyline cung đường trên Map module. Organizer cần
          vào «Thiết lập bản đồ» và lưu course cho cự ly.
        </p>
      )}
    </div>
  );
}
