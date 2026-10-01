"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";
const CR = "245,158,11";

export default function CoordinatorCutoffPage() {
  const segments = [
    { name: "Start → CP1", cutoff: "08:30", current: "09:24", runners: 1240, cleared: 1200, total: 1300, status: "closed" as const },
    { name: "CP1 → CP2", cutoff: "10:00", current: "09:24", runners: 980, cleared: 0, total: 1240, status: "open" as const },
    { name: "CP2 → CP3", cutoff: "12:30", current: "09:24", runners: 340, cleared: 0, total: 980, status: "open" as const },
    { name: "CP3 → CP4", cutoff: "15:00", current: "09:24", runners: 42, cleared: 0, total: 340, status: "open" as const },
    { name: "CP4 → Finish", cutoff: "18:00", current: "09:24", runners: 8, cleared: 0, total: 42, status: "open" as const },
  ];

  return (
    <RouteTab tab="cutoff">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-OPS-03"
        title="Route Status & Cut-off Tracking"
        desc="Monitor runners remaining in each segment versus the cut-off time to manage route opening and closure."
        color={C}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {segments.map((seg) => (
          <Card key={seg.name} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: seg.status === "closed" ? "rgba(148,163,184,0.08)" : `rgba(${CR},0.12)`, border: `1px solid ${seg.status === "closed" ? "rgba(148,163,184,0.15)" : `rgba(${CR},0.25)`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
              ⏱️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{seg.name}</span>
                <span style={{ fontSize: "12px", color: "#475569" }}>Cut-off: <span style={{ color: C, fontWeight: 700 }}>{seg.cutoff}</span></span>
              </div>
              <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "5px" }}>
                <div style={{ height: "100%", width: `${Math.min((seg.runners / seg.total) * 100, 100)}%`, background: seg.status === "closed" ? "rgba(148,163,184,0.4)" : `rgba(${CR},0.8)`, borderRadius: "3px", transition: "width 1s" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#334155" }}>
                {seg.runners.toLocaleString()} runners in segment · {seg.total.toLocaleString()} total entered
              </div>
            </div>
            <Badge label={seg.status} type={seg.status === "closed" ? "gray" : "green"} />
            {seg.status === "open" && <Btn label="Close Segment" danger small />}
          </Card>
        ))}
      </div>
    </div>
    </RouteTab>
  );
}
