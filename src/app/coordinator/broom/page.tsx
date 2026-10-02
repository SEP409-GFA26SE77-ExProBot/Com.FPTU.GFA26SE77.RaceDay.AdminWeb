"use client";

import { SectionHeader, Card, Badge } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";
const CR = "245,158,11";

export default function CoordinatorBroomPage() {
  const passages = [
    { cp: "Start Gate", time: "06:01:00", dnf: 0, note: "Race start" },
    { cp: "CP1 – KM10", time: "08:32:10", dnf: 12, note: "Cut-off enforced" },
    { cp: "CP2 – KM21", time: "10:05:48", dnf: 8, note: "6 runners refused wagon" },
    { cp: "CP3 – KM32", time: "—", dnf: 0, note: "Not yet reached" },
  ];

  return (
    <RouteTab tab="broom">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-OPS-06"
          title="Broom Wagon Timing"
          desc="Record broom wagon passage times at each checkpoint. Runners still on route after the wagon passes are auto-marked DNF."
          color={C}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
          <Card>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
              Checkpoint Passage Log
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Checkpoint", "Passage Time", "Auto-DNF", "Notes"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {passages.map((p) => (
                  <tr key={p.cp} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{p.cp}</td>
                    <td style={{ padding: "10px", fontFamily: "monospace", fontSize: "13px", color: p.time === "—" ? "#334155" : C, fontWeight: p.time !== "—" ? 700 : 400 }}>
                      {p.time}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.dnf > 0 ? <Badge label={`${p.dnf} DNF`} type="rose" /> : <span style={{ fontSize: "12px", color: "#334155" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px", fontSize: "12px", color: "#475569" }}>{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>🚐</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Broom Wagon</div>
              <Badge label="En Route → CP2" type="amber" />
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "8px" }}>Current position: KM 18.3</div>
            </Card>
            <Card>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
                Record Passage
              </div>
              <select style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", marginBottom: "10px" }}>
                <option style={{ background: "#0B0A14" }}>CP3 – KM32</option>
                <option style={{ background: "#0B0A14" }}>CP4 – KM50</option>
              </select>
              <input type="time" defaultValue="12:00" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", marginBottom: "10px" }} />
              <button style={{ width: "100%", padding: "10px", borderRadius: "9px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Record & Auto-DNF
              </button>
            </Card>
          </div>
        </div>
      </div>
    </RouteTab>
  );
}
