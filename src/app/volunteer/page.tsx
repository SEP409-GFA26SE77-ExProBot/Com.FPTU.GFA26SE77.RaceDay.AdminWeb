"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";

const C = "#10B981";
const CR = "16,185,129";

function SectionHeader({ id, title, desc }: { id: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontSize: "10px", color: C, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>{id}</div>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{title}</h2>
      <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", ...style }}>
      {children}
    </div>
  );
}

function Badge({ label, type }: { label: string; type: "green" | "amber" | "rose" | "cyan" | "gray" | "violet" }) {
  const map = { green: "badge-green", amber: "badge-amber", rose: "badge-rose", cyan: "badge-cyan", gray: "badge-gray", violet: "badge-violet" };
  return <span className={map[type]} style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", display: "inline-block" }}>{label}</span>;
}

function Btn({ label, primary, danger, onClick }: { label: string; primary?: boolean; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
        border: danger ? "1px solid rgba(239,68,68,0.35)" : primary ? "none" : `1px solid rgba(${CR},0.3)`,
        background: danger ? "rgba(239,68,68,0.12)" : primary ? `rgba(${CR},0.18)` : "transparent",
        color: danger ? "#EF4444" : primary ? C : "#64748B",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

const navItems: NavItem[] = [
  { id: "scanner",  label: "QR / RFID Scanner",  icon: "📡", badge: "LIVE" },
  { id: "manual",   label: "Manual Entry",        icon: "⌨️", badge: 3     },
  { id: "issues",   label: "On-site Issues",      icon: "⚠️", badge: 2     },
  { id: "status",   label: "Special Status",      icon: "🚩"               },
];

const stats: StatItem[] = [
  { label: "Scans Today",   value: "1,284", change: "22%",  positive: true,  icon: "📡" },
  { label: "Manual Entries",value: "3",     change: "1",    positive: false, icon: "⌨️" },
  { label: "Open Issues",   value: "2",                                       icon: "⚠️" },
  { label: "DNS / DNF / DQ",value: "8",     change: "3",    positive: false, icon: "🚩" },
  { label: "Checkpoint",    value: "CP3",                                     icon: "📍" },
];

/* ── Scanner ──────────────────────────────────────────────────────── */
function Scanner() {
  const checkpoints = ["Start Gate", "CP1 – KM 10", "CP2 – KM 21", "CP3 – KM 32", "CP4 – KM 50", "Finish Line"];
  const recentScans = [
    { bib: "A0042", runner: "Nguyen Van A", time: "09:14:32", cp: "CP3", status: "ok"    },
    { bib: "B0117", runner: "Tran Thi B",   time: "09:14:28", cp: "CP3", status: "ok"    },
    { bib: "C0055", runner: "Le Van C",     time: "09:14:01", cp: "CP3", status: "ok"    },
    { bib: "A0289", runner: "Pham Thi D",   time: "09:13:47", cp: "CP3", status: "dup"   },
    { bib: "A0110", runner: "Hoang Van E",  time: "09:13:30", cp: "CP3", status: "ok"    },
  ];
  return (
    <>
      <SectionHeader id="FR-VOL-01" title="QR / RFID Scanner" desc="Scan runner QR codes or RFID chips at the current checkpoint. Scans are logged in real-time." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Scanner widget */}
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Active Checkpoint</div>
          <select style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", marginBottom: "16px", cursor: "pointer" }}>
            {checkpoints.map((cp) => <option key={cp} style={{ background: "#0B0A14" }}>{cp}</option>)}
          </select>

          {/* Scan indicator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px", background: `rgba(${CR},0.06)`, border: `2px dashed rgba(${CR},0.3)`, borderRadius: "12px", marginBottom: "14px" }}>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `rgba(${CR},0.15)`, border: `2px solid rgba(${CR},0.5)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>📡</div>
              <div className="animate-ping-slow" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C}`, opacity: 0.4 }} />
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C }}>Scanner Active</div>
            <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>Awaiting scan…</div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input placeholder="Manual BIB override…" style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
            <Btn label="Submit" primary />
          </div>
        </Card>

        {/* Recent scans */}
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Recent Scans</div>
          {recentScans.map((s) => (
            <div key={s.bib + s.time} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: s.status === "dup" ? "rgba(239,68,68,0.12)" : `rgba(${CR},0.12)`, border: `1px solid ${s.status === "dup" ? "rgba(239,68,68,0.25)" : `rgba(${CR},0.25)`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: s.status === "dup" ? "#EF4444" : C, flexShrink: 0, fontFamily: "monospace" }}>
                {s.bib.slice(-3)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{s.bib} <span style={{ color: "#475569", fontWeight: 400 }}>· {s.runner}</span></div>
                <div style={{ fontSize: "11px", color: "#334155" }}>{s.time} · {s.cp}</div>
              </div>
              {s.status === "dup" && <Badge label="DUPLICATE" type="rose" />}
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

/* ── Manual Entry ──────────────────────────────────────────────────── */
function ManualEntry() {
  const pending = [
    { bib: "A0043", cp: "CP2", time: "08:52:00", reason: "Device offline", logged: "09:01" },
    { bib: "B0204", cp: "CP1", time: "07:38:00", reason: "RFID chip fail",  logged: "08:45" },
    { bib: "C0091", cp: "CP3", time: "09:05:00", reason: "QR damaged",      logged: "09:18" },
  ];
  return (
    <>
      <SectionHeader id="FR-VOL-02" title="Manual Data Entry" desc="When a device fails or connectivity is lost, enter timing data manually. All manual entries are auto-tagged 'MANUAL' for reconciliation." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>📝 New Manual Entry</div>
          {[
            { label: "BIB Number",     placeholder: "e.g. A0042",  type: "text" },
            { label: "Checkpoint",     placeholder: "e.g. CP3",    type: "text" },
            { label: "Passage Time",   placeholder: "HH:MM:SS",    type: "time" },
            { label: "Reason",         placeholder: "Device failure / No signal…", type: "text" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
            </div>
          ))}
          <div style={{ marginTop: "4px", padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", fontSize: "11px", color: "#F59E0B", marginBottom: "16px" }}>
            ⚠️ This entry will be auto-tagged as <strong>MANUAL</strong> and flagged for administrator reconciliation.
          </div>
          <button style={{ width: "100%", padding: "10px", borderRadius: "9px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            Submit Entry
          </button>
        </Card>

        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Pending Reconciliation</div>
          {pending.map((p) => (
            <div key={p.bib + p.cp} style={{ padding: "12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: C, fontFamily: "monospace" }}>{p.bib}</span>
                <Badge label="MANUAL" type="amber" />
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>Checkpoint: <span style={{ color: "#94A3B8" }}>{p.cp}</span> &nbsp;·&nbsp; Time: <span style={{ color: "#94A3B8" }}>{p.time}</span></div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "3px" }}>Reason: {p.reason} &nbsp;·&nbsp; Logged at {p.logged}</div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

/* ── On-site Issues ─────────────────────────────────────────────────── */
function Issues() {
  const issues = [
    { id: "ISS-001", type: "Lost QR",    bib: "A0042", runner: "Nguyen Van A", status: "open",     opened: "08:32" },
    { id: "ISS-002", type: "BIB Reissue",bib: "C0055", runner: "Le Van C",     status: "resolved", opened: "07:15" },
  ];
  return (
    <>
      <SectionHeader id="FR-VOL-03" title="On-site Issue Handling" desc="Handle on-site issues such as lost QR codes or reissuing a BIB number for a runner." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>🆕 Log New Issue</div>
          {[
            { label: "Runner BIB",   placeholder: "e.g. A0042" },
            { label: "Runner Name",  placeholder: "e.g. Nguyen Van A" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
            </div>
          ))}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Issue Type</label>
            <select style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
              <option style={{ background: "#0B0A14" }}>Lost QR Code</option>
              <option style={{ background: "#0B0A14" }}>BIB Reissue Required</option>
              <option style={{ background: "#0B0A14" }}>Medical Assistance</option>
              <option style={{ background: "#0B0A14" }}>Other</option>
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</label>
            <textarea placeholder="Describe the issue…" rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", resize: "vertical" }} />
          </div>
          <button style={{ width: "100%", padding: "10px", borderRadius: "9px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            Log Issue
          </button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {issues.map((iss) => (
            <Card key={iss.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>{iss.id}</span>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>{iss.type}</div>
                </div>
                <Badge label={iss.status} type={iss.status === "open" ? "amber" : "green"} />
              </div>
              <div style={{ fontSize: "13px", color: "#475569", marginBottom: "12px" }}>
                Runner: <span style={{ color: C, fontWeight: 600 }}>{iss.bib}</span> · {iss.runner}<br />
                <span style={{ fontSize: "11px", color: "#334155" }}>Opened {iss.opened}</span>
              </div>
              {iss.status === "open" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn label="Reissue BIB" primary />
                  <Btn label="Mark Resolved" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Special Status ───────────────────────────────────────────────── */
function SpecialStatus() {
  const statuses = [
    { code: "DNS", label: "Did Not Start",  color: "#6366F1", desc: "Runner registered but never started" },
    { code: "DNF", label: "Did Not Finish", color: "#F59E0B", desc: "Runner started but retired during the race" },
    { code: "DQ",  label: "Disqualified",   color: "#EF4444", desc: "Runner disqualified per race rules" },
  ];
  const recent = [
    { bib: "A0195", name: "Vo Thi F",   type: "DNF", cp: "CP2",  time: "08:42" },
    { bib: "B0031", name: "Dang Van G", type: "DNS", cp: "Start", time: "06:30" },
    { bib: "C0112", name: "Bui Thi H",  type: "DQ",  cp: "CP1",  time: "07:55" },
  ];
  const typeColor = (t: string) => ({ DNS: "violet", DNF: "amber", DQ: "rose" }[t] ?? "gray") as "violet" | "amber" | "rose";
  return (
    <>
      <SectionHeader id="FR-VOL-04" title="Special Status Marking" desc="Mark a runner's special status: DNS, DNF, or DQ. This is logged immediately and reflects in results." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>Mark Runner Status</div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Runner BIB</label>
            <input placeholder="Search by BIB or name…" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            {statuses.map((s) => (
              <div key={s.code} style={{ flex: 1, padding: "14px 10px", borderRadius: "10px", background: `${s.color}12`, border: `2px solid ${s.color}35`, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = `${s.color}20`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.color}35`; e.currentTarget.style.background = `${s.color}12`; }}
              >
                <div style={{ fontSize: "16px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.code}</div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</label>
            <textarea placeholder="Reason / checkpoint location…" rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", resize: "none" }} />
          </div>
          <button style={{ width: "100%", padding: "10px", borderRadius: "9px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            Confirm Status
          </button>
        </Card>

        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Recent Status Changes</div>
          {recent.map((r) => (
            <div key={r.bib} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <Badge label={r.type} type={typeColor(r.type)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{r.bib} <span style={{ color: "#475569", fontWeight: 400 }}>· {r.name}</span></div>
                <div style={{ fontSize: "11px", color: "#334155" }}>{r.cp} · {r.time}</div>
              </div>
              <Btn label="Undo" />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

const sectionMap: Record<string, React.ReactNode> = {
  scanner: <Scanner />,
  manual:  <ManualEntry />,
  issues:  <Issues />,
  status:  <SpecialStatus />,
};

export default function VolunteerPage() {
  return (
    <DashboardShell
      role="Volunteer"
      roleAbbr="VOL"
      roleIcon="🏃"
      roleColor={C}
      roleColorRgb={CR}
      navItems={navItems}
      stats={stats}
    >
      {(active) => (
        <div className="animate-slide-up" key={active}>
          {sectionMap[active]}
        </div>
      )}
    </DashboardShell>
  );
}
