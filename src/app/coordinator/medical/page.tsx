"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";
const CR = "245,158,11";

export default function CoordinatorMedicalPage() {
  const teams = [
    { id: "MED-01", name: "Alpha Medical", status: "responding" as const, location: "KM 28.4", incident: "SOS-001", vehicle: "Ambulance" },
    { id: "MED-02", name: "Bravo First Aid", status: "standby" as const, location: "CP3 Station", incident: null, vehicle: "4x4 Truck" },
    { id: "MED-03", name: "Charlie Support", status: "standby" as const, location: "Start Area", incident: null, vehicle: "Motorcycle" },
  ];
  const incidents = [
    { id: "SOS-001", bib: "A0301", status: "responding", resp: "Alpha Medical ETA 4min", time: "09:22" },
  ];

  return (
    <RouteTab tab="medical">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-OPS-02"
        title="Medical Team Coordination"
        desc="Dispatch medical teams to exact GPS coordinates when SOS is triggered. Update response status in real-time."
        color={C}
      />
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
          🆘 Active Incidents
        </div>
        {incidents.map((inc) => (
          <div key={inc.id} style={{ padding: "16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "12px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>{inc.id} — BIB {inc.bib}</span>
              <Badge label={inc.status.toUpperCase()} type="amber" />
            </div>
            <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "8px" }}>Response: {inc.resp}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Reached Runner", "Transported", "Stabilized"].map((s) => (
                <button key={s} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
          Medical Teams
        </div>
        {teams.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: t.status === "responding" ? "rgba(239,68,68,0.12)" : `rgba(${CR},0.12)`, border: `1px solid ${t.status === "responding" ? "rgba(239,68,68,0.25)" : `rgba(${CR},0.25)`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
              🚑
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{t.name} <span style={{ fontSize: "11px", color: "#334155" }}>({t.vehicle})</span></div>
              <div style={{ fontSize: "11px", color: "#475569" }}>📍 {t.location} {t.incident ? `· Responding to ${t.incident}` : ""}</div>
            </div>
            <Badge label={t.status} type={t.status === "responding" ? "rose" : "green"} />
            <Btn label="Dispatch" primary small color={C} colorRgb={CR} />
          </div>
        ))}
      </Card>
    </div>
    </RouteTab>
  );
}
