"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";

const C = "#8B5CF6";
const CR = "139,92,246";

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

function Btn({ label, primary, danger, small }: { label: string; primary?: boolean; danger?: boolean; small?: boolean }) {
  return (
    <button style={{
      padding: small ? "5px 10px" : "7px 14px", borderRadius: "8px", fontSize: small ? "11px" : "12px", fontWeight: 600, cursor: "pointer",
      border: danger ? "1px solid rgba(239,68,68,0.35)" : primary ? "none" : `1px solid rgba(${CR},0.3)`,
      background: danger ? "rgba(239,68,68,0.12)" : primary ? `rgba(${CR},0.18)` : "transparent",
      color: danger ? "#EF4444" : primary ? C : "#64748B",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

const navItems: NavItem[] = [
  { id: "approvals",       label: "Approvals",            icon: "✅", badge: 5  },
  { id: "users",           label: "User Management",      icon: "👥"             },
  { id: "reconciliation",  label: "Data Reconciliation",  icon: "🔎", badge: 8  },
  { id: "audit",           label: "Audit Trail",          icon: "📋"             },
  { id: "stats",           label: "Platform Statistics",  icon: "📊"             },
];

const stats: StatItem[] = [
  { label: "Total Events",    value: "142",    change: "12",  positive: true,  icon: "🏁" },
  { label: "Total Users",     value: "28,410", change: "2.4%",positive: true,  icon: "👥" },
  { label: "Pending Review",  value: "5",                                       icon: "✅" },
  { label: "Anomalies",       value: "8",      change: "3",   positive: false, icon: "⚠️" },
  { label: "Monthly Revenue", value: "$84.2K", change: "11%", positive: true,  icon: "💰" },
];

/* ── Approvals ────────────────────────────────────────────────────── */
function Approvals() {
  const organizers = [
    { name: "VietTrail Corp.",      email: "admin@viettrail.vn",    submitted: "Sep 22",  docs: "complete", events: 0 },
    { name: "Mountain Run Vietnam", email: "contact@mrv.vn",        submitted: "Sep 21",  docs: "complete", events: 2 },
  ];
  const events = [
    { name: "Fansipan Sky Race 2026",  organizer: "VietTrail Corp.", date: "Dec 14", distance: "80km", runners: 800,  status: "pending" },
    { name: "Da Nang Beach Sprint",    organizer: "Mountain Run VN", date: "Nov 20", distance: "10km", runners: 2000, status: "pending" },
    { name: "Mekong Delta Eco Run",    organizer: "GreenRun Co.",    date: "Jan 08", distance: "50km", runners: 600,  status: "pending" },
  ];
  return (
    <>
      <SectionHeader id="FR-ADM-01" title="Approve Organizers & Events" desc="Review and approve new Organizer accounts and event applications before they go live on the platform." />

      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>🏢 Pending Organizer Accounts ({organizers.length})</div>
        {organizers.map((org) => (
          <Card key={org.email} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{org.name}</div>
              <div style={{ fontSize: "12px", color: "#475569" }}>{org.email} · Submitted {org.submitted} · {org.events} prior events</div>
            </div>
            <Badge label={org.docs === "complete" ? "Docs Complete" : "Missing Docs"} type={org.docs === "complete" ? "green" : "amber"} />
            <div style={{ display: "flex", gap: "8px" }}>
              <Btn label="View Docs" />
              <Btn label="Approve" primary />
              <Btn label="Reject" danger />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>🏁 Pending Events ({events.length})</div>
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Event", "Organizer", "Date", "Distance", "Runners", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>{ev.name}</td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#64748B" }}>{ev.organizer}</td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#94A3B8" }}>{ev.date}</td>
                  <td style={{ padding: "10px" }}><Badge label={ev.distance} type="cyan" /></td>
                  <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{ev.runners.toLocaleString()}</td>
                  <td style={{ padding: "10px" }}><Badge label={ev.status} type="amber" /></td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Btn label="Approve" primary small />
                      <Btn label="Reject" danger small />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

/* ── User Management ──────────────────────────────────────────────── */
function Users() {
  const users = [
    { name: "Nguyen Van A",  email: "vana@email.com",   role: "Photographer", status: "active",    joined: "Jan 2025" },
    { name: "Tran Thi B",    email: "thib@email.com",   role: "Volunteer",    status: "active",    joined: "Mar 2025" },
    { name: "Le Van C",      email: "vanc@email.com",   role: "Organizer",    status: "suspended", joined: "Feb 2024" },
    { name: "Pham Thi D",    email: "thid@email.com",   role: "Runner",       status: "active",    joined: "Jun 2025" },
    { name: "Hoang Van E",   email: "vane@email.com",   role: "Administrator",status: "active",    joined: "Dec 2023" },
  ];
  const moderation = [
    { id: "MOD-001", type: "Comment",    content: "Offensive remark on photo #8821",    reporter: "User A", status: "pending" },
    { id: "MOD-002", type: "Photo",      content: "Reported: identifiable minor visible",reporter: "User B", status: "pending" },
    { id: "MOD-003", type: "Dispute",    content: "Timing dispute for BIB C0055 at CP2",reporter: "Runner", status: "review"  },
  ];
  const roleColor = (r: string) => ({ Photographer:"cyan", Volunteer:"green", Organizer:"violet", Runner:"gray", Administrator:"rose" }[r] ?? "gray") as "cyan"|"green"|"violet"|"gray"|"rose";
  return (
    <>
      <SectionHeader id="FR-ADM-02" title="User Management & Content Moderation" desc="Manage all platform users, update roles and status, and review reported content and disputes." />
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input placeholder="🔍 Search users…" style={{ flex: 1, padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
        <select style={{ padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
          {["All Roles","Photographer","Volunteer","Organizer","Runner","Administrator"].map((r) => <option key={r} style={{ background: "#0B0A14" }}>{r}</option>)}
        </select>
      </div>
      <Card style={{ marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 600, color: "#fff" }}>{u.name}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#475569" }}>{u.email}</td>
                <td style={{ padding: "10px" }}><Badge label={u.role} type={roleColor(u.role)} /></td>
                <td style={{ padding: "10px" }}><Badge label={u.status} type={u.status === "active" ? "green" : "rose"} /></td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#334155" }}>{u.joined}</td>
                <td style={{ padding: "10px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Btn label="Edit" small />
                    {u.status === "active" ? <Btn label="Suspend" danger small /> : <Btn label="Restore" small />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>🛡️ Content Moderation Queue</div>
      {moderation.map((m) => (
        <Card key={m.id} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
            {m.type === "Comment" ? "💬" : m.type === "Photo" ? "🖼️" : "⚖️"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>[{m.type}] {m.content}</div>
            <div style={{ fontSize: "11px", color: "#334155" }}>Reported by {m.reporter} · {m.id}</div>
          </div>
          <Badge label={m.status} type={m.status === "pending" ? "amber" : "violet"} />
          <div style={{ display: "flex", gap: "6px" }}>
            <Btn label="Remove" danger small />
            <Btn label="Dismiss" small />
          </div>
        </Card>
      ))}
    </>
  );
}

/* ── Data Reconciliation ─────────────────────────────────────────── */
function Reconciliation() {
  const anomalies = [
    { id: "ANO-001", type: "Missing Checkpoint", bib: "A0042", detail: "No scan at CP2 (KM21) — jumped from CP1→CP3", severity: "rose",   status: "open"     },
    { id: "ANO-002", type: "Invalid Timestamp",   bib: "B0117", detail: "CP3 time 08:12 earlier than CP2 time 08:45",  severity: "rose",   status: "open"     },
    { id: "ANO-003", type: "Duplicate BIB Scan",  bib: "C0055", detail: "BIB scanned twice at CP1 within 0.8 seconds", severity: "amber",  status: "open"     },
    { id: "ANO-004", type: "Missing Checkpoint",  bib: "A0289", detail: "No scan at CP1 — manual entry reconciled",    severity: "amber",  status: "resolved" },
    { id: "ANO-005", type: "Invalid Timestamp",   bib: "D0031", detail: "Finish time precedes CP4 time by 3 minutes",  severity: "rose",   status: "open"     },
    { id: "ANO-006", type: "Duplicate BIB Scan",  bib: "B0204", detail: "Same BIB scanned at two different CPs simultaneously", severity: "rose", status: "open" },
    { id: "ANO-007", type: "Missing Checkpoint",  bib: "C0091", detail: "No scan at Finish — runner reported finished",severity: "amber",  status: "review"   },
    { id: "ANO-008", type: "Invalid Timestamp",   bib: "A0195", detail: "CP2 time predates event start by 4 minutes",  severity: "rose",   status: "open"     },
  ];
  const typeIcon = (t: string) => ({ "Missing Checkpoint": "📍", "Invalid Timestamp": "⏱️", "Duplicate BIB Scan": "🔁" }[t] ?? "⚠️");
  return (
    <>
      <SectionHeader id="FR-ADM-03" title="Timing Data Reconciliation" desc="System automatically detects anomalies: missing checkpoints, invalid timestamps, and duplicate BIB scans. Review and resolve each case." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Missing Checkpoint", count: 3, color: "#8B5CF6", icon: "📍" },
          { label: "Invalid Timestamp",  count: 3, color: "#EF4444", icon: "⏱️" },
          { label: "Duplicate Scan",     count: 2, color: "#F59E0B", icon: "🔁" },
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
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ID", "Type", "BIB", "Detail", "Severity", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>{a.id}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#94A3B8" }}>
                  <span style={{ marginRight: "4px" }}>{typeIcon(a.type)}</span>{a.type}
                </td>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 700, color: C, fontFamily: "monospace" }}>{a.bib}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "#475569", maxWidth: "200px", lineHeight: 1.4 }}>{a.detail}</td>
                <td style={{ padding: "10px" }}><Badge label={a.severity === "rose" ? "HIGH" : "MEDIUM"} type={a.severity as "rose" | "amber"} /></td>
                <td style={{ padding: "10px" }}><Badge label={a.status} type={a.status === "resolved" ? "green" : a.status === "review" ? "violet" : "amber"} /></td>
                <td style={{ padding: "10px" }}>
                  {a.status !== "resolved" && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Btn label="Resolve" primary small />
                      <Btn label="Override" small />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ── Audit Trail ──────────────────────────────────────────────────── */
function AuditTrail() {
  const entries = [
    { time: "09:24:11", user: "Admin #1",    action: "Result Override", target: "BIB A0042 CP3 time", old: "09:14:32", next: "09:14:18", category: "timing"   },
    { time: "09:18:45", user: "Coordinator", action: "Status Changed",  target: "BIB A0195 → DNF",    old: "Active",   next: "DNF",     category: "status"   },
    { time: "09:15:02", user: "Volunteer #3",action: "Manual Entry",    target: "BIB C0091 CP3",      old: "—",        next: "09:05:00",category: "manual"   },
    { time: "09:12:30", user: "Admin #1",    action: "User Suspended",  target: "Le Van C",           old: "Active",   next: "Suspended",category: "user"    },
    { time: "09:10:00", user: "System",      action: "Event Published", target: "Dalat Ultra 2026",   old: "Draft",    next: "Live",    category: "event"    },
    { time: "08:55:17", user: "Admin #2",    action: "Photo Removed",   target: "IMG_3821.jpg",       old: "Published",next: "Removed", category: "content"  },
    { time: "08:42:00", user: "Volunteer #7",action: "BIB Reissue",    target: "A0301 → A0301-R",    old: "A0301",    next: "A0301-R", category: "bib"     },
  ];
  const catColor = (c: string) => ({ timing:"cyan", status:"amber", manual:"violet", user:"rose", event:"green", content:"gray", bib:"cyan" }[c] ?? "gray") as "cyan"|"amber"|"violet"|"rose"|"green"|"gray";
  const catIcon  = (c: string) => ({ timing:"⏱️", status:"🚩", manual:"⌨️", user:"👤", event:"🏁", content:"🖼️", bib:"🔖" }[c] ?? "📋");
  return (
    <>
      <SectionHeader id="FR-ADM-04" title="Audit Trail" desc="Full change log: who changed what, when, old value → new value. Especially critical for timing and result edits." />
      <Card>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <input placeholder="🔍 Search by user, action, or BIB…" style={{ flex: 1, padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
          <select style={{ padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
            {["All Categories","Timing","Status","Manual","User","Event","Content"].map((c) => <option key={c} style={{ background: "#0B0A14" }}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", padding: "13px 0", borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
              {/* Time */}
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#334155", flexShrink: 0, paddingTop: "2px", width: "70px" }}>{e.time}</span>
              {/* Icon */}
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{catIcon(e.category)}</span>
              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{e.action}</span>
                  <Badge label={e.category} type={catColor(e.category)} />
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  Target: <span style={{ color: C }}>{e.target}</span>
                </div>
              </div>
              {/* Diff */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "2px 6px", borderRadius: "4px", background: "rgba(239,68,68,0.10)", color: "#F87171" }}>{e.old}</span>
                <span style={{ fontSize: "11px", color: "#334155" }}>→</span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "2px 6px", borderRadius: "4px", background: "rgba(16,185,129,0.10)", color: "#10B981" }}>{e.next}</span>
              </div>
              {/* User */}
              <span style={{ fontSize: "11px", color: "#334155", flexShrink: 0, width: "96px", textAlign: "right" }}>{e.user}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ── Platform Statistics ──────────────────────────────────────────── */
function PlatformStats() {
  const kpis = [
    { label: "Total Events",       value: "142",    sub: "+12 this month",  icon: "🏁", color: "#8B5CF6" },
    { label: "Registered Users",   value: "28,410", sub: "+682 this week",  icon: "👥", color: "#06B6D4" },
    { label: "Photos Uploaded",    value: "1.4M",   sub: "+48K this event", icon: "📷", color: "#10B981" },
    { label: "Monthly Revenue",    value: "$84.2K", sub: "↑ 11% vs last mo",icon: "💰", color: "#F59E0B" },
    { label: "Race Completions",   value: "92.4%",  sub: "Avg across events",icon: "✅", color: "#EC4899" },
    { label: "Avg Runners/Event",  value: "1,200",  sub: "Up from 980",     icon: "🏃", color: "#8B5CF6" },
  ];
  const monthlyData = [65,72,58,80,74,91,88,95,84,78,102,110];
  const maxVal = Math.max(...monthlyData);
  const months = ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];

  const roles = [
    { role: "Runners",       count: 26840, pct: 94.5, color: "#06B6D4" },
    { role: "Photographers", count: 840,   pct: 3.0,  color: "#10B981" },
    { role: "Organizers",    count: 380,   pct: 1.3,  color: "#F59E0B" },
    { role: "Volunteers",    count: 280,   pct: 1.0,  color: "#8B5CF6" },
    { role: "Admins",        count: 70,    pct: 0.2,  color: "#EC4899" },
  ];

  return (
    <>
      <SectionHeader id="FR-ADM-05" title="Platform Statistics Dashboard" desc="Monitor overall platform health: events, users, photos, revenue, and completion rates." />

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {kpis.map((k) => (
          <Card key={k.label}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "24px" }}>{k.icon}</span>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: k.color, marginTop: "4px" }} className="animate-glow-pulse" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: k.color, letterSpacing: "-0.03em", marginBottom: "3px" }}>{k.value}</div>
            <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>{k.label}</div>
            <div style={{ fontSize: "11px", color: "#334155" }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
        {/* Monthly bar chart */}
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>📈 Monthly Events (last 12 months)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px" }}>
            {monthlyData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${(v / maxVal) * 100}%`,
                      borderRadius: "4px 4px 0 0",
                      background: i === monthlyData.length - 1
                        ? `linear-gradient(180deg, ${C}, rgba(139,92,246,0.4))`
                        : "rgba(139,92,246,0.25)",
                      transition: "height 1s cubic-bezier(0.4,0,0.2,1)",
                      minHeight: "4px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "9px", color: "#334155", whiteSpace: "nowrap" }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* User breakdown */}
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>👥 Users by Role</div>
          {roles.map((r) => (
            <div key={r.role} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#94A3B8" }}>{r.role}</span>
                <span style={{ color: r.color, fontWeight: 700 }}>{r.count.toLocaleString()} <span style={{ color: "#334155", fontWeight: 400 }}>({r.pct}%)</span></span>
              </div>
              <div style={{ height: "5px", borderRadius: "2.5px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: "2.5px", minWidth: "4px" }} />
              </div>
            </div>
          ))}

          {/* Transaction volume */}
          <div style={{ marginTop: "16px", padding: "12px", background: `rgba(${CR},0.06)`, border: `1px solid rgba(${CR},0.18)`, borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "4px" }}>Cumulative Revenue</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: C }}>$1.24M</div>
            <div style={{ fontSize: "11px", color: "#334155" }}>since platform launch</div>
          </div>
        </Card>
      </div>
    </>
  );
}

const sectionMap: Record<string, React.ReactNode> = {
  approvals:      <Approvals />,
  users:          <Users />,
  reconciliation: <Reconciliation />,
  audit:          <AuditTrail />,
  stats:          <PlatformStats />,
};

export default function AdministratorPage() {
  return (
    <DashboardShell
      role="Administrator"
      roleAbbr="ADM"
      roleIcon="⚡"
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
