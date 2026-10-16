"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import { RaceEventDto } from "@/dto/event.dto";
import {
  listPendingEvents,
  approveEvent,
} from "@/api/admin-events";
import { getApiErrorMessage } from "@/lib/error";
import {
  buildOrganizerSetupChecklist,
  checklistReady,
} from "@/lib/organizer-setup-checklist";
import {
  Info,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Circle,
} from "lucide-react";

const C = "#f97316";

function distanceLabel(ev: RaceEventDto) {
  const ds = ev.distances || [];
  if (!ds.length) return "—";
  return ds
    .map((d) => d.name || `${d.distanceKm}K`)
    .slice(0, 4)
    .join(", ");
}

export default function AdministratorApprovalsPage() {
  const [eventsList, setEventsList] = useState<RaceEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listPendingEvents();
      setEventsList(list);
    } catch (e) {
      setError(
        getApiErrorMessage(e, "Không tải được danh sách chờ duyệt.")
      );
      setEventsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApproveQuick = async (ev: RaceEventDto) => {
    setBusyId(ev.id);
    setError(null);
    try {
      await approveEvent(ev.id, false);
      setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
    } catch (e) {
      setError(getApiErrorMessage(e, "Duyệt giải thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            id="Duyệt giải"
            title="Hồ sơ chờ duyệt"
            desc="Hồ sơ organizer gửi duyệt. Mở chi tiết để xem checklist setup (cự ly, tài liệu, bản đồ…) rồi duyệt hoặc từ chối."
            color={C}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="gap-1 border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Tải lại
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar size={14} strokeWidth={1.75} className="text-orange-500" />
            <span>Giải chờ duyệt ({eventsList.length})</span>
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Đang tải hồ sơ chờ duyệt…
              </div>
            ) : eventsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-xl">
                  ✅
                </div>
                <p className="text-sm font-bold text-foreground">
                  Không có giải đang chờ duyệt
                </p>
                <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
                  Khi organizer bấm <strong>Gửi admin duyệt giải</strong> (User
                  FE), hồ sơ sẽ hiện ở đây. Bấm <strong>Xem xét duyệt</strong>{" "}
                  để mở panel checklist chi tiết (cự ly, tài liệu, bản đồ…).
                </p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[
                      "Tên giải",
                      "Đơn vị",
                      "Ngày · Địa điểm",
                      "Cự ly",
                      "Checklist",
                      "Thao tác",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map((ev) => {
                    const checks = buildOrganizerSetupChecklist(ev);
                    const required = checks.filter((c) => c.required);
                    const okCount = required.filter((c) => c.ok).length;
                    const ready = checklistReady(checks);
                    return (
                      <tr
                        key={ev.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          <div>{ev.name}</div>
                          {ev.tagline ? (
                            <div className="text-[11px] font-normal text-muted-foreground line-clamp-1">
                              {ev.tagline}
                            </div>
                          ) : null}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {ev.organizer?.name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          <div>
                            {ev.date}
                            {ev.startTime ? ` · ${ev.startTime}` : ""}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {ev.location}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div className="flex max-w-[180px] flex-wrap gap-1.5">
                            {(ev.distances || []).slice(0, 3).map((d, i) => (
                              <Badge
                                key={d.id || `${d.name}-${i}`}
                                type="cyan"
                                className="text-[10px]"
                              >
                                {d.name || `${d.distanceKm}K`}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted-foreground">
                            {distanceLabel(ev)}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                            {ready ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span
                              className={
                                ready ? "text-emerald-700" : "text-amber-700"
                              }
                            >
                              {okCount}/{required.length}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 gap-1 border-orange-500/40 bg-orange-500/10 px-2.5 text-xs font-semibold text-orange-600"
                            >
                              <Link href={`/approvals/${ev.id}`}>
                                <Info className="h-3.5 w-3.5" />
                                Xem xét duyệt
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={busyId === ev.id}
                              onClick={() => void handleApproveQuick(ev)}
                              className="h-7 gap-1 bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              title="Duyệt nhanh — giải ở trạng thái Sắp mở"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Duyệt nhanh
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </RouteTab>
  );
}
