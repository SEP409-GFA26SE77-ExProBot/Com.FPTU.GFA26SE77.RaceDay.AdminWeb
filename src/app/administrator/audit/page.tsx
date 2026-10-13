"use client";

import { SectionHeader, Card, Badge } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";

export default function AdministratorAuditPage() {
  const entries = [
    { time: "09:24:11", user: "Admin #1", action: "Result Override", target: "BIB A0042 CP3 time", old: "09:14:32", next: "09:14:18", category: "timing" },
    { time: "09:18:45", user: "Coordinator", action: "Status Changed", target: "BIB A0195 → DNF", old: "Active", next: "DNF", category: "status" },
    { time: "09:15:02", user: "Volunteer #3", action: "Manual Entry", target: "BIB C0091 CP3", old: "—", next: "09:05:00", category: "manual" },
    { time: "09:12:30", user: "Admin #1", action: "User Suspended", target: "Le Van C", old: "Active", next: "Suspended", category: "user" },
    { time: "09:10:00", user: "System", action: "Event Published", target: "Dalat Ultra 2026", old: "Draft", next: "Live", category: "event" },
    { time: "08:55:17", user: "Admin #2", action: "Photo Removed", target: "IMG_3821.jpg", old: "Published", next: "Removed", category: "content" },
    { time: "08:42:00", user: "Volunteer #7", action: "BIB Reissue", target: "A0301 → A0301-R", old: "A0301", next: "A0301-R", category: "bib" },
  ];
  const catColor = (c: string) =>
    ({ timing: "cyan", status: "amber", manual: "violet", user: "rose", event: "green", content: "gray", bib: "cyan" }[c] ?? "gray") as "cyan" | "amber" | "violet" | "rose" | "green" | "gray";
  const catIcon = (c: string) => ({ timing: "⏱️", status: "🚩", manual: "⌨️", user: "👤", event: "🏁", content: "🖼️", bib: "🔖" }[c] ?? "📋");

  return (
    <RouteTab tab="audit">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-04"
        title="Audit Trail"
        desc="Full change log: who changed what, when, old value → new value. Especially critical for timing and result edits."
        color={C}
      />
      <Card>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <input placeholder="🔍 Search by user, action, or BIB…" style={{ flex: 1, padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
          <select style={{ padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
            {["All Categories", "Timing", "Status", "Manual", "User", "Event", "Content"].map((c) => (
              <option key={c} style={{ background: "#0B0A14" }}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", padding: "13px 0", borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#334155", flexShrink: 0, paddingTop: "2px", width: "70px" }}>{e.time}</span>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{catIcon(e.category)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{e.action}</span>
                  <Badge label={e.category} type={catColor(e.category)} />
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  Target: <span style={{ color: C }}>{e.target}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "2px 6px", borderRadius: "4px", background: "rgba(239,68,68,0.10)", color: "#F87171" }}>{e.old}</span>
                <span style={{ fontSize: "11px", color: "#334155" }}>→</span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "2px 6px", borderRadius: "4px", background: "rgba(16,185,129,0.10)", color: "#10B981" }}>{e.next}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#334155", flexShrink: 0, width: "96px", textAlign: "right" }}>{e.user}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </RouteTab>
  );
}
