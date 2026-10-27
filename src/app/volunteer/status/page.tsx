"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#10B981";
const CR = "16,185,129";

export default function VolunteerStatusPage() {
  const statuses = [
    { code: "DNS", label: "Did Not Start", color: "#6366F1", desc: "Runner registered but never started" },
    { code: "DNF", label: "Did Not Finish", color: "#F59E0B", desc: "Runner started but retired during the race" },
    { code: "DQ", label: "Disqualified", color: "#EF4444", desc: "Runner disqualified per race rules" },
  ];
  const recent = [
    { bib: "A0195", name: "Vo Thi F", type: "DNF", cp: "CP2", time: "08:42" },
    { bib: "B0031", name: "Dang Van G", type: "DNS", cp: "Start", time: "06:30" },
    { bib: "C0112", name: "Bui Thi H", type: "DQ", cp: "CP1", time: "07:55" },
  ];
  const typeColor = (t: string) =>
    ({ DNS: "violet", DNF: "amber", DQ: "rose" }[t] ?? "gray") as "violet" | "amber" | "rose";

  return (
    <RouteTab tab="status">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-VOL-04"
        title="Special Status Marking"
        desc="Mark a runner's special status: DNS, DNF, or DQ. This is logged immediately and reflects in results."
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
            Mark Runner Status
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
              Runner BIB
            </label>
            <input
              className="runner-status-field"
              placeholder="Search by BIB or name…"
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
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            {statuses.map((s) => (
              <div
                key={s.code}
                style={{
                  flex: 1,
                  padding: "14px 10px",
                  borderRadius: "10px",
                  background: `${s.color}12`,
                  border: `2px solid ${s.color}35`,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.background = `${s.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${s.color}35`;
                  e.currentTarget.style.background = `${s.color}12`;
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>
                  {s.code}
                </div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>{s.label}</div>
              </div>
            ))}
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
              className="runner-status-field"
              placeholder="Reason / checkpoint location…"
              rows={2}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "var(--input)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "13px",
                resize: "none",
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
            Confirm Status
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
            Recent Status Changes
          </div>
          {recent.map((r) => (
            <div
              key={r.bib}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Badge label={r.type} type={typeColor(r.type)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {r.bib} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>· {r.name}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#334155" }}>
                  {r.cp} · {r.time}
                </div>
              </div>
              <Btn label="Undo" color={C} colorRgb={CR} />
            </div>
          ))}
        </Card>
      </div>
    </div>
    </RouteTab>
  );
}
