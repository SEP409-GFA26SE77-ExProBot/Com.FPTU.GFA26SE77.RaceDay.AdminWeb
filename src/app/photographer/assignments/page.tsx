"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";
const CR = "6,182,212";

export default function PhotographerAssignmentsPage() {
  const events = [
    { name: "Dalat Ultra Trail 2026", date: "Sep 28, 2026", zone: "KM 0 – 15 (Start)", status: "active" as const, distance: "100km" },
    { name: "HCM City Night Run", date: "Oct 12, 2026", zone: "Finish Line Gate", status: "upcoming" as const, distance: "42km" },
    { name: "Hanoi Spring 5K", date: "Nov 03, 2026", zone: "CP3 – Hoan Kiem", status: "upcoming" as const, distance: "5km" },
  ];

  return (
    <RouteTab tab="assignments">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-PHO-01"
          title="Event Assignments"
          desc="Events assigned to you by the Organizer. View shooting zones, checkpoints, and race details."
          color={C}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((ev) => (
            <Card key={ev.name} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                🏔️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "2px" }}>{ev.name}</div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  {ev.date} &nbsp;·&nbsp; {ev.distance} &nbsp;·&nbsp; Zone: <span style={{ color: C }}>{ev.zone}</span>
                </div>
              </div>
              <Badge label={ev.status} type={ev.status === "active" ? "green" : "cyan"} />
              <Btn label="View Details" primary color={C} colorRgb={CR} />
            </Card>
          ))}
        </div>
      </div>
    </RouteTab>
  );
}
