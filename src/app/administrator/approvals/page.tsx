"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import PendingEventInfoModal from "@/components/PendingEventInfoModal";
import { RaceEventDto } from "@/dto/event.dto";
import {
  listPendingEvents,
  approveEvent,
  rejectEvent,
} from "@/api/admin-events";
import { getApiErrorMessage } from "@/lib/error";
import { logout } from "@/api/auth";
import {
  Info,
  CheckCircle2,
  XCircle,
  Calendar,
  RefreshCw,
  LogOut,
} from "lucide-react";

const C = "#8B5CF6";

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
  const [selected, setSelected] = useState<RaceEventDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleOpenInfo = (ev: RaceEventDto) => {
    setSelected(ev);
    setModalOpen(true);
  };

  const handleApprove = async (
    ev: RaceEventDto,
    openRegistration: boolean
  ) => {
    setBusyId(ev.id);
    setError(null);
    try {
      await approveEvent(ev.id, openRegistration);
      setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
      setModalOpen(false);
      setSelected(null);
    } catch (e) {
      setError(getApiErrorMessage(e, "Duyệt giải thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (ev: RaceEventDto, reason: string) => {
    setBusyId(ev.id);
    setError(null);
    try {
      await rejectEvent(ev.id, reason);
      setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
      setModalOpen(false);
      setSelected(null);
    } catch (e) {
      setError(getApiErrorMessage(e, "Từ chối giải thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-01"
          title="Duyệt giải chạy"
          desc="Hồ sơ từ User FE (CreateRaceEvent). Duyệt mặc định = Sắp mở (approved); tick mở ĐK = registration-open."
          color={C}
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Request qua <code>@/api/admin-events</code> → axios + cookie{" "}
            <code>access_token</code> (cùng pattern User FE).
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Tải lại
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => void logout()}
              className="gap-1 text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Calendar size={14} strokeWidth={1.75} />
            <span>Giải chờ duyệt ({eventsList.length})</span>
          </div>

          <Card>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Đang tải hồ sơ chờ duyệt…
              </div>
            ) : eventsList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Không có giải PendingApproval.
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
                      "Quy mô",
                      "Trạng thái",
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
                  {eventsList.map((ev) => (
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
                        <div className="flex gap-1.5 flex-wrap max-w-[180px]">
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
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                          {distanceLabel(ev)}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {(ev.totalRunners ?? 0).toLocaleString("vi-VN")}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge
                          label="Chờ duyệt"
                          type="amber"
                          className="text-[10px]"
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInfo(ev)}
                            className="h-7 px-2.5 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-500 gap-1"
                          >
                            <Info className="h-3.5 w-3.5" />
                            Hồ sơ
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === ev.id}
                            onClick={() => void handleApprove(ev, false)}
                            className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            title="Duyệt → approved (Sắp mở)"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Duyệt
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={busyId === ev.id}
                            onClick={() => handleOpenInfo(ev)}
                            className="h-7 px-2.5 text-xs font-semibold gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Từ chối
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {selected && (
          <PendingEventInfoModal
            event={selected}
            open={modalOpen}
            onOpenChange={setModalOpen}
            onApprove={handleApprove}
            onReject={handleReject}
            busy={busyId === selected.id}
          />
        )}
      </div>
    </RouteTab>
  );
}
