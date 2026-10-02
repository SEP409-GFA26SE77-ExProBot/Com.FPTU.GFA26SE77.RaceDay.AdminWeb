"use client";

import { SectionHeader, Card } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function AdministratorStatsPage() {
  const kpis = [
    { label: "Total Events", value: "142", sub: "+12 this month", icon: "🏁", color: "#8B5CF6" },
    { label: "Registered Users", value: "28,410", sub: "+682 this week", icon: "👥", color: "#06B6D4" },
    { label: "Photos Uploaded", value: "1.4M", sub: "+48K this event", icon: "📷", color: "#10B981" },
    { label: "Monthly Revenue", value: "$84.2K", sub: "↑ 11% vs last mo", icon: "💰", color: "#F59E0B" },
    { label: "Race Completions", value: "92.4%", sub: "Avg across events", icon: "✅", color: "#EC4899" },
    { label: "Avg Runners/Event", value: "1,200", sub: "Up from 980", icon: "🏃", color: "#8B5CF6" },
  ];
  const monthlyData = [65, 72, 58, 80, 74, 91, 88, 95, 84, 78, 102, 110];
  const maxVal = Math.max(...monthlyData);
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  const roles = [
    { role: "Runners", count: 26840, pct: 94.5, color: "#06B6D4" },
    { role: "Photographers", count: 840, pct: 3.0, color: "#10B981" },
    { role: "Organizers", count: 380, pct: 1.3, color: "#F59E0B" },
    { role: "Volunteers", count: 280, pct: 1.0, color: "#8B5CF6" },
    { role: "Admins", count: 70, pct: 0.2, color: "#EC4899" },
  ];

  return (
    <RouteTab tab="stats">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-05"
        title="Platform Statistics Dashboard"
        desc="Monitor overall platform health: events, users, photos, revenue, and completion rates."
        color={C}
      />

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
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>
            📈 Monthly Events (last 12 months)
          </div>
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
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>
            👥 Users by Role
          </div>
          {roles.map((r) => (
            <div key={r.role} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#94A3B8" }}>{r.role}</span>
                <span style={{ color: r.color, fontWeight: 700 }}>
                  {r.count.toLocaleString("en-US")} <span style={{ color: "#334155", fontWeight: 400 }}>({r.pct}%)</span>
                </span>
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
    </div>
    </RouteTab>
  );
}
