"use client";

import { SectionHeader, Card, Badge } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#10B981";
const CR = "16,185,129";

export default function VolunteerManualPage() {
  const pending = [
    { bib: "A0043", cp: "CP2", time: "08:52:00", reason: "Device offline", logged: "09:01" },
    { bib: "B0204", cp: "CP1", time: "07:38:00", reason: "RFID chip fail", logged: "08:45" },
    { bib: "C0091", cp: "CP3", time: "09:05:00", reason: "QR damaged", logged: "09:18" },
  ];

  return (
    <RouteTab tab="manual">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-VOL-02"
        title="Manual Data Entry"
        desc="When a device fails or connectivity is lost, enter timing data manually. All manual entries are auto-tagged 'MANUAL' for reconciliation."
        color={C}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "16px",
            }}
          >
            📝 New Manual Entry
          </div>
          {[
            { label: "BIB Number", placeholder: "e.g. A0042", type: "text" },
            { label: "Checkpoint", placeholder: "e.g. CP3", type: "text" },
            { label: "Passage Time", placeholder: "HH:MM:SS", type: "time" },
            { label: "Reason", placeholder: "Device failure / No signal…", type: "text" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  display: "block",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {f.label}
              </label>
              <input
                className="runner-status-field"
                type={f.type}
                placeholder={f.placeholder}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "var(--input)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>
          ))}
          <div
            style={{
              marginTop: "4px",
              padding: "10px 12px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#F59E0B",
              marginBottom: "16px",
            }}
          >
            ⚠️ This entry will be auto-tagged as <strong>MANUAL</strong> and flagged for
            administrator reconciliation.
          </div>
          <button
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "9px",
              background: `rgba(${CR},0.18)`,
              border: `1px solid rgba(${CR},0.3)`,
              color: C,
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Submit Entry
          </button>
        </Card>

        <Card>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "14px",
            }}
          >
            Pending Reconciliation
          </div>
          {pending.map((p) => (
            <div
              key={p.bib + p.cp}
              style={{
                padding: "12px",
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: C,
                    fontFamily: "monospace",
                  }}
                >
                  {p.bib}
                </span>
                <Badge label="MANUAL" type="amber" />
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                Checkpoint: <span style={{ color: "#94A3B8" }}>{p.cp}</span> &nbsp;·&nbsp; Time:{" "}
                <span style={{ color: "#94A3B8" }}>{p.time}</span>
              </div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "3px" }}>
                Reason: {p.reason} &nbsp;·&nbsp; Logged at {p.logged}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
    </RouteTab>
  );
}
