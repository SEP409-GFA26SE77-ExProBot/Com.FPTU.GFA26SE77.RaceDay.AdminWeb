"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function AdministratorApprovalsPage() {
  const organizers = [
    { name: "VietTrail Corp.", email: "admin@viettrail.vn", submitted: "Sep 22", docs: "complete", events: 0 },
    { name: "Mountain Run Vietnam", email: "contact@mrv.vn", submitted: "Sep 21", docs: "complete", events: 2 },
  ];
  const events = [
    { name: "Fansipan Sky Race 2026", organizer: "VietTrail Corp.", date: "Dec 14", distance: "80km", runners: 800, status: "pending" as const },
    { name: "Da Nang Beach Sprint", organizer: "Mountain Run VN", date: "Nov 20", distance: "10km", runners: 2000, status: "pending" as const },
    { name: "Mekong Delta Eco Run", organizer: "GreenRun Co.", date: "Jan 08", distance: "50km", runners: 600, status: "pending" as const },
  ];

  return (
    <RouteTab tab="approvals">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-01"
        title="Approve Organizers & Events"
        desc="Review and approve new Organizer accounts and event applications before they go live on the platform."
        color={C}
      />

      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
          🏢 Pending Organizer Accounts ({organizers.length})
        </div>
        {organizers.map((org) => (
          <Card key={org.email} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              🏢
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{org.name}</div>
              <div style={{ fontSize: "12px", color: "#475569" }}>{org.email} · Submitted {org.submitted} · {org.events} prior events</div>
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

      <div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
          🏁 Pending Events ({events.length})
        </div>
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Event", "Organizer", "Date", "Distance", "Runners", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>{ev.name}</td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#64748B" }}>{ev.organizer}</td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#94A3B8" }}>{ev.date}</td>
                  <td style={{ padding: "10px" }}><Badge label={ev.distance} type="cyan" /></td>
                  <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{ev.runners.toLocaleString()}</td>
                  <td style={{ padding: "10px" }}><Badge label={ev.status} type="amber" /></td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Btn label="Approve" primary small color={C} colorRgb={CR} />
                      <Btn label="Reject" danger small color={C} colorRgb={CR} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
    </RouteTab>
  );
}
