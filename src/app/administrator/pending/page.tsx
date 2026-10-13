"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionHeader, Card, Badge, Btn, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import PendingEventInfoModal, { EventItemType } from "@/components/PendingEventInfoModal";
import { Info, CheckCircle2, XCircle, Building2, Calendar, Loader2 } from "lucide-react";
import { getPendingEvents, approveEvent, rejectEvent, ApiError } from "@/app/api";
import type { EventListItemDto } from "@/dtos";

const C = "#8B5CF6";
const CR = "139,92,246";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Map API EventListItemDto → PendingEventInfoModal's EventItemType shape.
 * EventItemType is derived from events.json (complex schema); we cast here
 * because the modal only reads the subset of fields we provide. */
function toEventItemType(e: EventListItemDto): EventItemType {
  return {
    id: e.id,
    name: e.name,
    date: e.date,
    location: e.location,
    status: e.status,
    totalRunners: e.totalRunners,
    bannerImage: e.bannerImage ?? "",
    // Cast organizer & distances to satisfy the strict events.json schema type
    organizer: { name: e.organizer.name, email: e.organizer.email, phone: e.organizer.phone ?? "" } as EventItemType["organizer"],
    distances: e.distances.map((d) => ({
      type: d.type,
      name: d.name,
      distanceKm: d.distanceKm,
      color: d.color ?? "#8B5CF6",
    })) as EventItemType["distances"],
  } as unknown as EventItemType;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AdministratorApprovalsPage() {
  const [eventsList, setEventsList] = useState<EventListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // per-row action states
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  // detail modal
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── fetch pending events from API ─────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingEvents();
      setEventsList(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Không thể tải danh sách giải chờ duyệt.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // ── approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (ev: EventListItemDto | EventItemType) => {
    setActionLoading((prev) => ({ ...prev, [ev.id]: "approve" }));
    try {
      await approveEvent(ev.id, false);
      setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
      setIsModalOpen(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Không thể duyệt giải.";
      alert(`Lỗi: ${msg}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [ev.id]: null }));
    }
  };

  // ── reject ────────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (ev: EventListItemDto | EventItemType) => {
    const reason = rejectReason[ev.id]?.trim();
    if (!reason) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [ev.id]: "reject" }));
    try {
      await rejectEvent(ev.id, reason);
      setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
      setShowRejectInput((prev) => ({ ...prev, [ev.id]: false }));
      setIsModalOpen(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Không thể từ chối giải.";
      alert(`Lỗi: ${msg}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [ev.id]: null }));
    }
  };

  const handleOpenInfo = (ev: EventListItemDto) => {
    setSelectedEventForModal(toEventItemType(ev));
    setIsModalOpen(true);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-01"
          title="Approve Organizers & Events"
          desc="Review and approve event applications before they go live on the platform. Data loaded live from API."
          color={C}
        />

        {/* Pending Events Table */}
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
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} strokeWidth={1.75} />
              <span>
                Pending Events{!loading && ` (${eventsList.length})`}
              </span>
            </div>
            <button
              onClick={fetchPending}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: C,
                background: `rgba(${CR},0.08)`,
                border: `1px solid rgba(${CR},0.22)`,
                borderRadius: "7px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : "↻"} Refresh
            </button>
          </div>

          <Card>
            {/* Loading */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "40px",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                <Loader2 size={18} className="animate-spin" style={{ color: C }} />
                Đang tải danh sách giải chờ duyệt…
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#EF4444",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>⚠️ {error}</span>
                <button
                  onClick={fetchPending}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "8px",
                    background: `rgba(${CR},0.12)`,
                    border: `1px solid rgba(${CR},0.3)`,
                    color: C,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && eventsList.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Không có giải nào đang chờ duyệt. 🎉
              </div>
            )}

            {/* Table */}
            {!loading && !error && eventsList.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[
                      "Tên giải",
                      "Ban tổ chức",
                      "Ngày & Địa điểm",
                      "Cự ly",
                      "VĐV dự kiến",
                      "Trạng thái",
                      "Hành động",
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
                    const busy = actionLoading[ev.id];
                    const showReject = showRejectInput[ev.id];
                    return (
                      <tr key={ev.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        {/* Name */}
                        <td style={{ padding: "12px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 700 }}>
                          {ev.name}
                        </td>

                        {/* Organizer */}
                        <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          <div>{ev.organizer.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.organizer.email}</div>
                        </td>

                        {/* Date & Location */}
                        <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                          <div>{ev.date}</div>
                          <div style={{ fontSize: "11px" }}>{ev.location}</div>
                        </td>

                        {/* Distances */}
                        <td style={{ padding: "12px" }}>
                          <div className="flex gap-1.5 flex-wrap">
                            {ev.distances.map((d) => (
                              <Badge key={d.id} type="cyan" className="text-[10px]">
                                {d.type}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        {/* Runners */}
                        <td style={{ padding: "12px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {ev.totalRunners.toLocaleString("vi-VN")}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "12px" }}>
                          <Badge label="Chờ duyệt" type="amber" className="text-[10px]" />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {/* Info */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInfo(ev)}
                                className="h-7 px-2.5 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 gap-1"
                              >
                                <Info className="h-3.5 w-3.5" />
                                Chi tiết
                              </Button>

                              {/* Approve */}
                              <Button
                                type="button"
                                size="sm"
                                disabled={!!busy}
                                onClick={() => handleApprove(ev)}
                                className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                {busy === "approve" ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Duyệt
                              </Button>

                              {/* Toggle Reject input */}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={!!busy}
                                onClick={() =>
                                  setShowRejectInput((prev) => ({
                                    ...prev,
                                    [ev.id]: !prev[ev.id],
                                  }))
                                }
                                className="h-7 px-2.5 text-xs font-semibold gap-1"
                              >
                                {busy === "reject" ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Từ chối
                              </Button>
                            </div>

                            {/* Reject reason inline */}
                            {showReject && (
                              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                                <input
                                  placeholder="Lý do từ chối…"
                                  value={rejectReason[ev.id] ?? ""}
                                  onChange={(e) =>
                                    setRejectReason((prev) => ({
                                      ...prev,
                                      [ev.id]: e.target.value,
                                    }))
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "5px 10px",
                                    borderRadius: "7px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(239,68,68,0.35)",
                                    color: "#fff",
                                    fontSize: "12px",
                                    outline: "none",
                                  }}
                                />
                                <button
                                  onClick={() => handleRejectConfirm(ev)}
                                  disabled={!!busy}
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: "7px",
                                    background: "rgba(239,68,68,0.18)",
                                    border: "1px solid rgba(239,68,68,0.4)",
                                    color: "#EF4444",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Xác nhận
                                </button>
                              </div>
                            )}
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

        {/* Pending Event Information & Route Preview Modal */}
        {selectedEventForModal && (
          <PendingEventInfoModal
            event={selectedEventForModal}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onApprove={handleApprove}
            onReject={(ev) => {
              const reason = rejectReason[ev.id]?.trim();
              if (!reason) {
                // fall back to inline reject in table
                setIsModalOpen(false);
                setShowRejectInput((prev) => ({ ...prev, [ev.id]: true }));
                return;
              }
              handleRejectConfirm(ev);
            }}
          />
        )}
      </div>
    </RouteTab>
  );
}
