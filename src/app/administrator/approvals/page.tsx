"use client";

import { useState } from "react";
import { SectionHeader, Card, Badge, Btn, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import PendingEventInfoModal, { EventItemType } from "@/components/PendingEventInfoModal";
import eventsData from "@/events.json";
import { Info, CheckCircle2, XCircle, Building2, Calendar, FileText, Check, X } from "lucide-react";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function AdministratorApprovalsPage() {
  const [eventsList, setEventsList] = useState(() => {
    // Filter pending events from events.json, or augment with pending mock events
    const pendingFromData = eventsData.filter((e) => e.status === "pending");
    return pendingFromData.length > 0
      ? pendingFromData
      : [eventsData[0]];
  });

  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const organizers = [
    { name: "VietTrail Corp.", email: "admin@viettrail.vn", submitted: "Sep 22", docs: "complete", events: 0 },
    { name: "Mountain Run Vietnam", email: "contact@mrv.vn", submitted: "Sep 21", docs: "complete", events: 2 },
  ];

  const handleOpenInfo = (ev: EventItemType) => {
    setSelectedEventForModal(ev);
    setIsModalOpen(true);
  };

  const handleApprove = (ev: EventItemType) => {
    setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
  };

  const handleReject = (ev: EventItemType) => {
    setEventsList((prev) => prev.filter((item) => item.id !== ev.id));
  };

  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-01"
          title="Approve Organizers & Events"
          desc="Review and approve new Organizer accounts and event applications before they go live on the platform."
          color={C}
        />

        {/* Pending Organizers */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Building2 size={14} strokeWidth={1.75} />
            <span>Pending Organizer Accounts ({organizers.length})</span>
          </div>
          {organizers.map((org) => (
            <Card key={org.email} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={20} strokeWidth={1.75} style={{ color: C }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{org.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{org.email} · Submitted {org.submitted} · {org.events} prior events</div>
              </div>
              <Badge label={org.docs === "complete" ? "Docs Complete" : "Missing Docs"} type={org.docs === "complete" ? "green" : "amber"} />
              <div style={{ display: "flex", gap: "8px" }}>
                <Btn label="View Docs" color={C} colorRgb={CR} />
                <Btn label="Approve" primary color={C} colorRgb={CR} />
                <Btn label="Reject" danger color={C} colorRgb={CR} />
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Events Table */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} strokeWidth={1.75} />
              <span>Pending Events ({eventsList.length})</span>
            </div>
            {eventsList.length > 0 && (
              <span className="text-[11px] font-normal text-muted-foreground">
                Click &quot;Information&quot; to review route map &amp; checkpoints before approval
              </span>
            )}
          </div>
          <Card>
            {eventsList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No pending events awaiting review. All applications are reconciled.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Event Name", "Organizer", "Date & Location", "Distances", "Expected Runners", "Status", "Review Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 700 }}>
                        <span>{ev.name}</span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {ev.organizer.name}
                      </td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <div>{ev.date}</div>
                        <div className="text-[11px] text-muted-foreground">{ev.location}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div className="flex gap-1.5 flex-wrap">
                          {ev.distances.map((d) => (
                            <Badge key={d.type} type="cyan" className="text-[10px]">
                              {d.type}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {ev.totalRunners.toLocaleString("en-US")}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge label="Pending Review" type="amber" className="text-[10px]" />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Dedicated Information Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInfo(ev)}
                            className="h-7 px-2.5 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 gap-1"
                          >
                            <Info className="h-3.5 w-3.5" />
                            Information
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApprove(ev)}
                            className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(ev)}
                            className="h-7 px-2.5 text-xs font-semibold gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
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

        {/* Pending Event Information & Route Preview Modal */}
        {selectedEventForModal && (
          <PendingEventInfoModal
            event={selectedEventForModal}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </RouteTab>
  );
}
