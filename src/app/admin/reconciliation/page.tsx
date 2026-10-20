"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function AdministratorReconciliationPage() {
  const anomalies = [
    { id: "ANO-001", type: "Missing Checkpoint", bib: "A0042", detail: "No scan at CP2 (KM21) — jumped from CP1→CP3", severity: "rose" as const, status: "open" },
    { id: "ANO-002", type: "Invalid Timestamp", bib: "B0117", detail: "CP3 time 08:12 earlier than CP2 time 08:45", severity: "rose" as const, status: "open" },
    { id: "ANO-003", type: "Duplicate BIB Scan", bib: "C0055", detail: "BIB scanned twice at CP1 within 0.8 seconds", severity: "amber" as const, status: "open" },
    { id: "ANO-004", type: "Missing Checkpoint", bib: "A0289", detail: "No scan at CP1 — manual entry reconciled", severity: "amber" as const, status: "resolved" },
    { id: "ANO-005", type: "Invalid Timestamp", bib: "D0031", detail: "Finish time precedes CP4 time by 3 minutes", severity: "rose" as const, status: "open" },
    { id: "ANO-006", type: "Duplicate BIB Scan", bib: "B0204", detail: "Same BIB scanned at two different CPs simultaneously", severity: "rose" as const, status: "open" },
    { id: "ANO-007", type: "Missing Checkpoint", bib: "C0091", detail: "No scan at Finish — runner reported finished", severity: "amber" as const, status: "review" },
    { id: "ANO-008", type: "Invalid Timestamp", bib: "A0195", detail: "CP2 time predates event start by 4 minutes", severity: "rose" as const, status: "open" },
  ];
  const typeIcon = (t: string) => ({ "Missing Checkpoint": "📍", "Invalid Timestamp": "⏱️", "Duplicate BIB Scan": "🔁" }[t] ?? "⚠️");

  return (
    <RouteTab tab="reconciliation">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-03"
        title="Timing Data Reconciliation"
        desc="System automatically detects anomalies: missing checkpoints, invalid timestamps, and duplicate BIB scans. Review and resolve each case."
        color={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Missing Checkpoint", count: 3, color: "#8B5CF6", icon: "📍" },
          { label: "Invalid Timestamp", count: 3, color: "#EF4444", icon: "⏱️" },
          { label: "Duplicate Scan", count: 2, color: "#F59E0B", icon: "🔁" },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ID", "Type", "BIB", "Detail", "Severity", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{a.id}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span style={{ marginRight: "4px" }}>{typeIcon(a.type)}</span>
                  {a.type}
                </td>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 700, color: C, fontFamily: "monospace" }}>{a.bib}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "var(--text-secondary)", maxWidth: "200px", lineHeight: 1.4 }}>{a.detail}</td>
                <td style={{ padding: "10px" }}><Badge label={a.severity === "rose" ? "HIGH" : "MEDIUM"} type={a.severity} /></td>
                <td style={{ padding: "10px" }}><Badge label={a.status} type={a.status === "resolved" ? "green" : a.status === "review" ? "violet" : "amber"} /></td>
                <td style={{ padding: "10px" }}>
                  {a.status !== "resolved" && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Btn label="Resolve" primary small color={C} colorRgb={CR} />
                      <Btn label="Override" small color={C} colorRgb={CR} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
    </RouteTab>
  );
}
