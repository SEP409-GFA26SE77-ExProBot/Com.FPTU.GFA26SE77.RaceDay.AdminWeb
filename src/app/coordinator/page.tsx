"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";

const C = "#F59E0B";
const CR = "245,158,11";

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

function Btn({ label, primary, danger, small, onClick }: { label: string; primary?: boolean; danger?: boolean; small?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? "5px 10px" : "7px 14px", borderRadius: "8px", fontSize: small ? "11px" : "12px", fontWeight: 600, cursor: "pointer",
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
  { id: "map",         label: "Live Map",          icon: "🗺️", badge: "2 SOS" },
  { id: "medical",     label: "Medical Teams",     icon: "🚑", badge: 2       },
  { id: "cutoff",      label: "Route & Cut-off",   icon: "⏱️"                 },
  { id: "inventory",   label: "Aid Stations",      icon: "🏕️", badge: "⚠️ 1" },
  { id: "contingency", label: "Contingency Plans", icon: "🔴"                  },
  { id: "broom",       label: "Broom Wagon",        icon: "🚐"                 },
];

const stats: StatItem[] = [
  { label: "Active Runners", value: "1,024", change: "38", positive: false, icon: "🏃" },
  { label: "SOS Alerts",     value: "2",                                    icon: "🆘" },
  { label: "On Route",       value: "91.2%",                                icon: "✅" },
  { label: "Aid Stations",   value: "6/6",                                  icon: "🏕️" },
  { label: "DNF so far",     value: "42",    change: "8",  positive: false, icon: "🚩" },
];

/* ── Live Map ─────────────────────────────────────────────────────── */
function LiveMap() {
  const alerts = [
    { id: "SOS-001", bib: "A0301", name: "Pham Van X", loc: "KM 28.4 – Ridge Trail", time: "09:22", type: "SOS",       severity: "rose"   },
    { id: "DEV-007", bib: "B0089", name: "Le Thi Y",   loc: "KM 14.1 – Off route 200m", time: "09:18", type: "DEVIATION", severity: "amber" },
  ];
  return (
    <>
      <SectionHeader id="FR-OPS-01" title="Live Runner Map" desc="Real-time map showing runner locations, SOS triggers, and route deviations. Requires GPS-enabled race devices." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        {/* Map placeholder */}
        <Card style={{ minHeight: "360px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", padding: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(16,24,40,0.9) 0%, rgba(6,5,12,0.95) 100%)" }} />
          {/* Grid lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          {/* Route line */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 500 300">
            <path d="M40,260 C80,200 120,220 160,180 S240,100 280,120 S380,80 440,60" stroke="rgba(245,158,11,0.4)" strokeWidth="3" fill="none" strokeDasharray="8,4" />
            {/* Runner dots */}
            {[[120,210],[180,175],[240,148],[310,115],[380,85]].map(([x,y],i)=>(
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#10B981" opacity="0.9" />
                <circle cx={x} cy={y} r="10" fill="rgba(16,185,129,0.2)" className="animate-ping-slow" />
              </g>
            ))}
            {/* SOS */}
            <g>
              <circle cx={290} cy={118} r="7" fill="#EF4444" />
              <text x={290} y={107} textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="bold">SOS</text>
            </g>
            {/* Deviation */}
            <g>
              <circle cx={175} cy={185} r="6" fill="#F59E0B" />
              <text x={175} y={174} textAnchor="middle" fontSize="10" fill="#F59E0B" fontWeight="bold">DEV</text>
            </g>
          </svg>
          {/* Checkpoints */}
          {["Start","CP1","CP2","CP3","CP4","Finish"].map((cp, i) => (
            <div key={cp} style={{ position: "absolute", fontSize: "9px", fontWeight: 700, color: "rgba(245,158,11,0.7)", background: "rgba(0,0,0,0.6)", padding: "2px 5px", borderRadius: "3px", left: `${8 + i * 17}%`, bottom: `${20 + i * 10}%` }}>
              {cp}
            </div>
          ))}
          {/* Legend */}
          <div style={{ position: "absolute", bottom: "14px", right: "14px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[["#10B981","Runner"],["#EF4444","SOS"],["#F59E0B","Deviation"]].map(([col,lbl])=>(
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#94A3B8" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col }} />{lbl}
              </div>
            ))}
          </div>
        </Card>

        {/* Alert list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((a) => (
            <Card key={a.id} style={{ borderColor: a.severity === "rose" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)", background: a.severity === "rose" ? "rgba(239,68,68,0.04)" : "rgba(245,158,11,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Badge label={a.type} type={a.severity as "rose" | "amber"} />
                <span style={{ fontSize: "11px", color: "#334155" }}>{a.time}</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{a.bib} · {a.name}</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>📍 {a.loc}</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Btn label="Dispatch Team" primary />
                <Btn label="Contact" />
              </div>
            </Card>
          ))}
          <Card style={{ textAlign: "center", padding: "14px" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#10B981" }}>1,024</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Runners on route</div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ── Medical Teams ──────────────────────────────────────────────────── */
function Medical() {
  const teams = [
    { id: "MED-01", name: "Alpha Medical",   status: "responding", location: "KM 28.4", incident: "SOS-001", vehicle: "Ambulance" },
    { id: "MED-02", name: "Bravo First Aid", status: "standby",    location: "CP3 Station", incident: null,    vehicle: "4x4 Truck" },
    { id: "MED-03", name: "Charlie Support", status: "standby",    location: "Start Area",  incident: null,    vehicle: "Motorcycle"},
  ];
  const incidents = [
    { id: "SOS-001", bib: "A0301", status: "responding", resp: "Alpha Medical ETA 4min", time: "09:22" },
  ];
  return (
    <>
      <SectionHeader id="FR-OPS-02" title="Medical Team Coordination" desc="Dispatch medical teams to exact GPS coordinates when SOS is triggered. Update response status in real-time." />
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>🆘 Active Incidents</div>
        {incidents.map((inc) => (
          <div key={inc.id} style={{ padding: "16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "12px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>{inc.id} — BIB {inc.bib}</span>
              <Badge label={inc.status.toUpperCase()} type="amber" />
            </div>
            <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "8px" }}>Response: {inc.resp}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Reached Runner","Transported","Stabilized"].map((s) => (
                <button key={s} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Medical Teams</div>
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
            <Btn label="Dispatch" primary small />
          </div>
        ))}
      </Card>
    </>
  );
}

/* ── Route & Cut-off ────────────────────────────────────────────────── */
function CutOff() {
  const segments = [
    { name: "Start → CP1", cutoff: "08:30", current: "09:24", runners: 1240, cleared: 1200, total: 1300, status: "closed" },
    { name: "CP1 → CP2",  cutoff: "10:00", current: "09:24", runners: 980,  cleared: 0,    total: 1240, status: "open"   },
    { name: "CP2 → CP3",  cutoff: "12:30", current: "09:24", runners: 340,  cleared: 0,    total: 980,  status: "open"   },
    { name: "CP3 → CP4",  cutoff: "15:00", current: "09:24", runners: 42,   cleared: 0,    total: 340,  status: "open"   },
    { name: "CP4 → Finish",cutoff: "18:00",current: "09:24", runners: 8,    cleared: 0,    total: 42,   status: "open"   },
  ];
  return (
    <>
      <SectionHeader id="FR-OPS-03" title="Route Status & Cut-off Tracking" desc="Monitor runners remaining in each segment versus the cut-off time to manage route opening and closure." />
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
    </>
  );
}

/* ── Aid Stations ──────────────────────────────────────────────────── */
function AidStations() {
  const stations = [
    { name: "Start Area", items: [{ name: "💧 Water",  qty: 850, max: 1000 },{ name: "🧂 Salt Tablets",qty: 620,max: 800 },{ name: "🍌 Gel Packs",qty: 340,max: 400 }] },
    { name: "CP1 – KM10", items: [{ name: "💧 Water",  qty: 320, max: 600  },{ name: "🧂 Salt Tablets",qty: 80, max: 400 },{ name: "🍌 Gel Packs",qty: 180,max: 300 }] },
    { name: "CP2 – KM21", items: [{ name: "💧 Water",  qty: 410, max: 600  },{ name: "🧂 Salt Tablets",qty: 290,max: 400 },{ name: "🍌 Gel Packs",qty: 220,max: 300 }] },
    { name: "CP3 – KM32", items: [{ name: "💧 Water",  qty: 30,  max: 500  },{ name: "🧂 Salt Tablets",qty: 120,max: 350 },{ name: "🍌 Gel Packs",qty: 95, max: 250 }] },
  ];
  const pct = (q: number, m: number) => Math.round((q / m) * 100);
  const barColor = (p: number) => p > 50 ? "#10B981" : p > 20 ? "#F59E0B" : "#EF4444";
  return (
    <>
      <SectionHeader id="FR-OPS-04" title="Aid Station Inventory" desc="Monitor supply levels at each aid station. Alerts fire when any item drops below 20%." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "14px" }}>
        {stations.map((st) => {
          const hasAlert = st.items.some((i) => pct(i.qty, i.max) < 25);
          return (
            <Card key={st.name} style={{ borderColor: hasAlert ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{st.name}</div>
                {hasAlert && <Badge label="LOW STOCK" type="rose" />}
              </div>
              {st.items.map((item) => {
                const p = pct(item.qty, item.max);
                return (
                  <div key={item.name} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "#94A3B8" }}>{item.name}</span>
                      <span style={{ color: barColor(p), fontWeight: 700 }}>{item.qty}/{item.max} <span style={{ color: "#334155" }}>({p}%)</span></span>
                    </div>
                    <div style={{ height: "5px", borderRadius: "2.5px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: barColor(p), borderRadius: "2.5px", transition: "width 1s" }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
                <Btn label="Request Resupply" primary small />
                <Btn label="Update" small />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ── Contingency Plans ─────────────────────────────────────────────── */
function Contingency() {
  const plans = [
    { code: "PLAN-A", name: "Shorten Long Route", desc: "Redirect 100km runners to 50km course from CP3. Affects ~340 runners.", risk: "Weather / Trail damage", status: "ready"    },
    { code: "PLAN-B", name: "Cancel Long Distance",desc: "Cancel 100km race entirely. Issue partial refunds. Race director approval required.", risk: "Severe weather", status: "ready" },
    { code: "PLAN-C", name: "Full Race Cancellation",desc: "Cancel all distances. Evacuate all checkpoints. Emergency protocol.", risk: "Extreme safety hazard", status: "standby" },
  ];
  const log = [
    { time: "07:30", action: "Race started — all distances active", by: "Coordinator A" },
    { time: "09:00", action: "Weather advisory issued — Plan A on standby", by: "Coordinator A" },
    { time: "09:22", action: "SOS triggered at KM 28.4 — medical dispatched", by: "System" },
  ];
  return (
    <>
      <SectionHeader id="FR-OPS-05" title="Contingency Plans" desc="Activate contingency plans in response to race conditions. All activations are logged to the event timeline." />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {plans.map((plan) => (
          <Card key={plan.code} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🔴</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{plan.code}: {plan.name}</span>
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
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>📋 Event Log</div>
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
    </>
  );
}

/* ── Broom Wagon ───────────────────────────────────────────────────── */
function BroomWagon() {
  const passages = [
    { cp: "Start Gate", time: "06:01:00", dnf: 0,  note: "Race start" },
    { cp: "CP1 – KM10", time: "08:32:10", dnf: 12, note: "Cut-off enforced" },
    { cp: "CP2 – KM21", time: "10:05:48", dnf: 8,  note: "6 runners refused wagon" },
    { cp: "CP3 – KM32", time: "—",         dnf: 0,  note: "Not yet reached" },
  ];
  return (
    <>
      <SectionHeader id="FR-OPS-06" title="Broom Wagon Timing" desc="Record broom wagon passage times at each checkpoint. Runners still on route after the wagon passes are auto-marked DNF." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        <Card>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Checkpoint Passage Log</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Checkpoint","Passage Time","Auto-DNF","Notes"].map((h)=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", fontSize:"11px", color:"#334155", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passages.map((p) => (
                <tr key={p.cp} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px", fontSize:"13px", color:"#94A3B8" }}>{p.cp}</td>
                  <td style={{ padding:"10px", fontFamily:"monospace", fontSize:"13px", color: p.time === "—" ? "#334155" : C, fontWeight: p.time !== "—" ? 700 : 400 }}>{p.time}</td>
                  <td style={{ padding:"10px" }}>
                    {p.dnf > 0 ? <Badge label={`${p.dnf} DNF`} type="rose" /> : <span style={{ fontSize:"12px", color:"#334155" }}>—</span>}
                  </td>
                  <td style={{ padding:"10px", fontSize:"12px", color:"#475569" }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <Card style={{ textAlign:"center" }}>
            <div style={{ fontSize:"36px", marginBottom:"6px" }}>🚐</div>
            <div style={{ fontSize:"14px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>Broom Wagon</div>
            <Badge label="En Route → CP2" type="amber" />
            <div style={{ fontSize:"12px", color:"#475569", marginTop:"8px" }}>Current position: KM 18.3</div>
          </Card>
          <Card>
            <div style={{ fontSize:"12px", fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"12px" }}>Record Passage</div>
            <select style={{ width:"100%", padding:"9px 12px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"13px", marginBottom:"10px" }}>
              <option style={{ background:"#0B0A14" }}>CP3 – KM32</option>
              <option style={{ background:"#0B0A14" }}>CP4 – KM50</option>
            </select>
            <input type="time" defaultValue="12:00" style={{ width:"100%", padding:"9px 12px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"13px", marginBottom:"10px" }} />
            <button style={{ width:"100%", padding:"10px", borderRadius:"9px", background:`rgba(${CR},0.18)`, border:`1px solid rgba(${CR},0.3)`, color:C, fontWeight:700, fontSize:"13px", cursor:"pointer" }}>
              Record & Auto-DNF
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}

const sectionMap: Record<string, React.ReactNode> = {
  map:         <LiveMap />,
  medical:     <Medical />,
  cutoff:      <CutOff />,
  inventory:   <AidStations />,
  contingency: <Contingency />,
  broom:       <BroomWagon />,
};

export default function CoordinatorPage() {
  return (
    <DashboardShell
      role="Race-Day Coordinator"
      roleAbbr="OPS"
      roleIcon="🗺️"
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
