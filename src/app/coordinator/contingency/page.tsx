"use client";

import { SectionHeader, Card, Badge } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";

export default function CoordinatorContingencyPage() {
  const plans = [
    { code: "PLAN-A", name: "Shorten Long Route", desc: "Redirect 100km runners to 50km course from CP3. Affects ~340 runners.", risk: "Weather / Trail damage", status: "ready" as const },
    { code: "PLAN-B", name: "Cancel Long Distance", desc: "Cancel 100km race entirely. Issue partial refunds. Race director approval required.", risk: "Severe weather", status: "ready" as const },
    { code: "PLAN-C", name: "Full Race Cancellation", desc: "Cancel all distances. Evacuate all checkpoints. Emergency protocol.", risk: "Extreme safety hazard", status: "standby" as const },
  ];
  const log = [
    { time: "07:30", action: "Race started — all distances active", by: "Coordinator A" },
    { time: "09:00", action: "Weather advisory issued — Plan A on standby", by: "Coordinator A" },
    { time: "09:22", action: "SOS triggered at KM 28.4 — medical dispatched", by: "System" },
  ];

  return (
    <RouteTab tab="contingency">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-OPS-05"
        title="Contingency Plans"
        desc="Activate contingency plans in response to race conditions. All activations are logged to the event timeline."
        color={C}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {plans.map((plan) => (
          <Card key={plan.code} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              🔴
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{plan.code}: {plan.name}</span>
                <Badge label={plan.status} type={plan.status === "ready" ? "amber" : "gray"} />
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 6px", lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ fontSize: "11px", color: "#334155" }}>⚠️ Trigger condition: {plan.risk}</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
              Activate
            </button>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
          📋 Event Log
        </div>
        {log.map((entry, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", padding: "10px 0", borderBottom: i < log.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ fontSize: "12px", fontFamily: "monospace", color: C, flexShrink: 0, paddingTop: "1px" }}>{entry.time}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>{entry.action}</div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "2px" }}>by {entry.by}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
    </RouteTab>
  );
}
