"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#10B981";
const CR = "16,185,129";

export default function VolunteerIssuesPage() {
  const issues = [
    { id: "ISS-001", type: "Lost QR", bib: "A0042", runner: "Nguyen Van A", status: "open", opened: "08:32" },
    { id: "ISS-002", type: "BIB Reissue", bib: "C0055", runner: "Le Van C", status: "resolved", opened: "07:15" },
  ];

  return (
    <RouteTab tab="issues">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-VOL-03"
        title="On-site Issue Handling"
        desc="Handle on-site issues such as lost QR codes or reissuing a BIB number for a runner."
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
              marginBottom: "14px",
            }}
          >
            🆕 Log New Issue
          </div>
          {[
            { label: "Runner BIB", placeholder: "e.g. A0042" },
            { label: "Runner Name", placeholder: "e.g. Nguyen Van A" },
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
                placeholder={f.placeholder}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "#fff",
                  fontSize: "13px",
                }}
              />
            </div>
          ))}
          <div style={{ marginBottom: "12px" }}>
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
              Issue Type
            </label>
            <select
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <option style={{ background: "#0B0A14" }}>Lost QR Code</option>
              <option style={{ background: "#0B0A14" }}>BIB Reissue Required</option>
              <option style={{ background: "#0B0A14" }}>Medical Assistance</option>
              <option style={{ background: "#0B0A14" }}>Other</option>
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
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
              Notes
            </label>
            <textarea
              placeholder="Describe the issue…"
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
                fontSize: "13px",
                resize: "vertical",
              }}
            />
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
            Log Issue
          </button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {issues.map((iss) => (
            <Card key={iss.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#334155",
                      fontFamily: "monospace",
                    }}
                  >
                    {iss.id}
                  </span>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#fff",
                      marginTop: "2px",
                    }}
                  >
                    {iss.type}
                  </div>
                </div>
                <Badge label={iss.status} type={iss.status === "open" ? "amber" : "green"} />
              </div>
              <div style={{ fontSize: "13px", color: "#475569", marginBottom: "12px" }}>
                Runner: <span style={{ color: C, fontWeight: 600 }}>{iss.bib}</span> · {iss.runner}
                <br />
                <span style={{ fontSize: "11px", color: "#334155" }}>Opened {iss.opened}</span>
              </div>
              {iss.status === "open" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn label="Reissue BIB" primary color={C} colorRgb={CR} />
                  <Btn label="Mark Resolved" color={C} colorRgb={CR} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
    </RouteTab>
  );
}
