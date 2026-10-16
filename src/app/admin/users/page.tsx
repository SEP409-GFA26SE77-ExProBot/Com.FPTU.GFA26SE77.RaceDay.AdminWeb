"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function AdministratorUsersPage() {
  const users = [
    { name: "Nguyen Van A", email: "vana@email.com", role: "Photographer", status: "active", joined: "Jan 2025" },
    { name: "Tran Thi B", email: "thib@email.com", role: "Volunteer", status: "active", joined: "Mar 2025" },
    { name: "Le Van C", email: "vanc@email.com", role: "Organizer", status: "suspended", joined: "Feb 2024" },
    { name: "Pham Thi D", email: "thid@email.com", role: "Runner", status: "active", joined: "Jun 2025" },
    { name: "Hoang Van E", email: "vane@email.com", role: "Administrator", status: "active", joined: "Dec 2023" },
  ];
  const moderation = [
    { id: "MOD-001", type: "Comment", content: "Offensive remark on photo #8821", reporter: "User A", status: "pending" as const },
    { id: "MOD-002", type: "Photo", content: "Reported: identifiable minor visible", reporter: "User B", status: "pending" as const },
    { id: "MOD-003", type: "Dispute", content: "Timing dispute for BIB C0055 at CP2", reporter: "Runner", status: "review" as const },
  ];
  const roleColor = (r: string) =>
    ({ Photographer: "cyan", Volunteer: "green", Organizer: "violet", Runner: "gray", Administrator: "rose" }[r] ?? "gray") as "cyan" | "green" | "violet" | "gray" | "rose";

  return (
    <RouteTab tab="users">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-02"
        title="User Management & Content Moderation"
        desc="Manage all platform users, update roles and status, and review reported content and disputes."
        color={C}
      />
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input placeholder="🔍 Search users…" style={{ flex: 1, padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px" }} />
        <select style={{ padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
          {["All Roles", "Photographer", "Volunteer", "Organizer", "Runner", "Administrator"].map((r) => (
            <option key={r} style={{ background: "#0B0A14" }}>{r}</option>
          ))}
        </select>
      </div>
      <Card style={{ marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>{u.email}</td>
                <td style={{ padding: "10px" }}><Badge label={u.role} type={roleColor(u.role)} /></td>
                <td style={{ padding: "10px" }}><Badge label={u.status} type={u.status === "active" ? "green" : "rose"} /></td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#334155" }}>{u.joined}</td>
                <td style={{ padding: "10px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Btn label="Edit" small color={C} colorRgb={CR} />
                    {u.status === "active" ? <Btn label="Suspend" danger small color={C} colorRgb={CR} /> : <Btn label="Restore" small color={C} colorRgb={CR} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
        🛡️ Content Moderation Queue
      </div>
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
            <Btn label="Remove" danger small color={C} colorRgb={CR} />
            <Btn label="Dismiss" small color={C} colorRgb={CR} />
          </div>
        </Card>
      ))}
    </div>
    </RouteTab>
  );
}
