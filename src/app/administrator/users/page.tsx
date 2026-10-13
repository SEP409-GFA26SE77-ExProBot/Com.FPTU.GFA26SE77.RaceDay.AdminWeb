"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import { adminIamApi, ApiError } from "@/app/api";
import type { UserDto, UpdateUserBody } from "@/dtos";
import { Loader2, RefreshCw, Search, Lock, Unlock, Trash2, KeyRound, Edit3, X, Check } from "lucide-react";

const C = "#8B5CF6";
const CR = "139,92,246";

// Role display helpers
const ROLE_ID_ADMIN = "11111111-1111-1111-1111-111111111111";
const ROLE_ID_USER = "22222222-2222-2222-2222-222222222222";
const ROLE_ID_ORGANIZER = "33333333-3333-3333-3333-333333333333";

const ROLE_LABELS: Record<string, string> = {
  [ROLE_ID_ADMIN]: "Administrator",
  [ROLE_ID_USER]: "Runner",
  [ROLE_ID_ORGANIZER]: "Organizer",
};

const roleLabel = (u: UserDto) =>
  ROLE_LABELS[u.roleId] ?? u.role ?? "User";

const roleColor = (label: string): "cyan" | "green" | "violet" | "gray" | "rose" | "amber" =>
  ({
    Photographer: "cyan",
    Volunteer: "green",
    Organizer: "violet",
    Runner: "gray",
    Administrator: "rose",
    User: "gray",
  }[label] ?? "gray") as "cyan" | "green" | "violet" | "gray" | "rose" | "amber";

const statusColor = (s: string): "green" | "rose" | "amber" =>
  s === "Active" ? "green" : s === "Locked" ? "rose" : "amber";

// ── Inline Edit Modal ─────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: UserDto;
  onClose: () => void;
  onSaved: (updated: UserDto) => void;
}

function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState(user.status);
  const [gender, setGender] = useState(user.gender ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      const body: UpdateUserBody = { fullName, phone: phone || undefined, roleId, status, gender: gender || undefined };
      const updated = await adminIamApi.updateUser(user.userId, body);
      onSaved(updated);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = { fontSize: "11px", color: "#64748B", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
      <div style={{ width: "460px", background: "var(--modal-bg,#0F1117)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "16px", padding: "24px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>✏️ Chỉnh sửa người dùng</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}><X size={18} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <div>
            <div style={labelStyle}>Họ tên</div>
            <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Số điện thoại</div>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Vai trò</div>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value={ROLE_ID_ADMIN} style={{ background: "#0B0A14" }}>Administrator</option>
              <option value={ROLE_ID_USER} style={{ background: "#0B0A14" }}>Runner</option>
              <option value={ROLE_ID_ORGANIZER} style={{ background: "#0B0A14" }}>Organizer</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Trạng thái</div>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={status} onChange={(e) => setStatus(e.target.value)}>
              {["Active", "Inactive", "Locked"].map((s) => (
                <option key={s} value={s} style={{ background: "#0B0A14" }}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Giới tính</div>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="" style={{ background: "#0B0A14" }}>—</option>
              <option value="Male" style={{ background: "#0B0A14" }}>Nam</option>
              <option value="Female" style={{ background: "#0B0A14" }}>Nữ</option>
              <option value="Other" style={{ background: "#0B0A14" }}>Khác</option>
            </select>
          </div>
        </div>

        {err && <div style={{ fontSize: "12px", color: "#EF4444", marginBottom: "12px" }}>⚠️ {err}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#94A3B8", fontSize: "13px", cursor: "pointer" }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", borderRadius: "8px", background: `rgba(${CR},0.15)`, border: `1px solid rgba(${CR},0.35)`, color: C, fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────────────────

interface ResetPwdModalProps {
  user: UserDto;
  onClose: () => void;
}

function ResetPwdModal({ user, onClose }: ResetPwdModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!newPassword.trim()) { setErr("Mật khẩu không được để trống."); return; }
    setSaving(true);
    setErr(null);
    try {
      await adminIamApi.resetPassword(user.userId, newPassword);
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
      <div style={{ width: "380px", background: "var(--modal-bg,#0F1117)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "16px", padding: "24px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>🔑 Đặt lại mật khẩu</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
            <div style={{ fontSize: "14px", color: "#10B981", fontWeight: 600 }}>Đặt lại mật khẩu thành công!</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Người dùng: {user.fullName}</div>
            <button onClick={onClose} style={{ marginTop: "16px", padding: "8px 20px", borderRadius: "8px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontSize: "13px", cursor: "pointer" }}>
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>Người dùng: <span style={{ color: "#fff", fontWeight: 600 }}>{user.fullName}</span> ({user.email})</div>
            <input
              type="password"
              placeholder="Mật khẩu mới…"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
            />
            {err && <div style={{ fontSize: "12px", color: "#EF4444", marginBottom: "12px" }}>⚠️ {err}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#94A3B8", fontSize: "13px", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleReset} disabled={saving} style={{ padding: "8px 16px", borderRadius: "8px", background: `rgba(${CR},0.15)`, border: `1px solid rgba(${CR},0.35)`, color: C, fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />} Đặt lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdministratorUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");

  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [resetUser, setResetUser] = useState<UserDto | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminIamApi.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setAction = (id: string, v: boolean) =>
    setActionLoading((prev) => ({ ...prev, [id]: v }));

  const handleLock = async (u: UserDto) => {
    setAction(u.userId, true);
    try {
      await adminIamApi.lockUser(u.userId);
      setUsers((prev) => prev.map((x) => x.userId === u.userId ? { ...x, status: "Locked" } : x));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi khóa tài khoản.");
    } finally { setAction(u.userId, false); }
  };

  const handleUnlock = async (u: UserDto) => {
    setAction(u.userId, true);
    try {
      await adminIamApi.unlockUser(u.userId);
      setUsers((prev) => prev.map((x) => x.userId === u.userId ? { ...x, status: "Active" } : x));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi mở khóa tài khoản.");
    } finally { setAction(u.userId, false); }
  };

  const handleDelete = async (u: UserDto) => {
    if (!confirm(`Xóa tài khoản "${u.fullName}"? Hành động này không thể hoàn tác.`)) return;
    setAction(u.userId, true);
    try {
      await adminIamApi.deleteUser(u.userId);
      setUsers((prev) => prev.filter((x) => x.userId !== u.userId));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi xóa tài khoản.");
    } finally { setAction(u.userId, false); }
  };

  const handleEditSaved = (updated: UserDto) => {
    setUsers((prev) => prev.map((x) => x.userId === updated.userId ? updated : x));
    setEditUser(null);
  };

  // Filtering
  const filtered = users.filter((u) => {
    const label = roleLabel(u);
    const matchRole = filterRole === "Tất cả" || label === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <RouteTab tab="users">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-02"
          title="Quản lý Người dùng"
          desc="Xem, chỉnh sửa role/trạng thái, khóa/mở khóa, đặt lại mật khẩu và xóa tài khoản người dùng trên nền tảng."
          color={C}
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input
              placeholder="Tìm theo tên, email, username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: "34px", padding: "9px 14px 9px 34px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: "13px", cursor: "pointer" }}
          >
            {["Tất cả", "Administrator", "Runner", "Organizer", "Photographer", "Volunteer"].map((r) => (
              <option key={r} style={{ background: "#0B0A14" }}>{r}</option>
            ))}
          </select>
          <button
            onClick={fetchUsers}
            disabled={loading}
            title="Làm mới"
            style={{ padding: "9px 13px", borderRadius: "9px", background: `rgba(${CR},0.08)`, border: `1px solid rgba(${CR},0.22)`, color: C, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          </button>
        </div>

        <Card style={{ marginBottom: "20px" }}>
          {/* Loading */}
          {loading && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <Loader2 size={18} className="animate-spin" style={{ color: C }} /> Đang tải danh sách người dùng…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ padding: "20px", textAlign: "center", color: "#EF4444", fontSize: "13px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Họ tên", "Email / Username", "Vai trò", "Trạng thái", "Ngày tạo", "Thao tác"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#334155", fontSize: "13px" }}>
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                ) : filtered.map((u) => {
                  const label = roleLabel(u);
                  const busy = actionLoading[u.userId];
                  return (
                    <tr key={u.userId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{u.fullName}</td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.email}</div>
                        <div style={{ fontSize: "11px", color: "#334155" }}>@{u.username}</div>
                      </td>
                      <td style={{ padding: "10px" }}><Badge label={label} type={roleColor(label)} /></td>
                      <td style={{ padding: "10px" }}><Badge label={u.status} type={statusColor(u.status)} /></td>
                      <td style={{ padding: "10px", fontSize: "11px", color: "#334155" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {/* Edit */}
                          <button
                            title="Chỉnh sửa"
                            onClick={() => setEditUser(u)}
                            style={{ padding: "5px 8px", borderRadius: "7px", background: `rgba(${CR},0.10)`, border: `1px solid rgba(${CR},0.25)`, color: C, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                          >
                            <Edit3 size={12} /> Sửa
                          </button>

                          {/* Lock / Unlock */}
                          {u.status === "Locked" ? (
                            <button
                              title="Mở khóa"
                              onClick={() => handleUnlock(u)}
                              disabled={busy}
                              style={{ padding: "5px 8px", borderRadius: "7px", background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                            >
                              {busy ? <Loader2 size={12} className="animate-spin" /> : <Unlock size={12} />} Mở khóa
                            </button>
                          ) : (
                            <button
                              title="Khóa tài khoản"
                              onClick={() => handleLock(u)}
                              disabled={busy}
                              style={{ padding: "5px 8px", borderRadius: "7px", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                            >
                              {busy ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />} Khóa
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            title="Đặt lại mật khẩu"
                            onClick={() => setResetUser(u)}
                            style={{ padding: "5px 8px", borderRadius: "7px", background: "rgba(6,182,212,0.10)", border: "1px solid rgba(6,182,212,0.25)", color: "#06B6D4", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                          >
                            <KeyRound size={12} /> Reset
                          </button>

                          {/* Delete */}
                          <button
                            title="Xóa tài khoản"
                            onClick={() => handleDelete(u)}
                            disabled={busy}
                            style={{ padding: "5px 8px", borderRadius: "7px", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
                          >
                            {busy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Footer summary */}
        {!loading && !error && (
          <div style={{ fontSize: "11px", color: "#334155", textAlign: "right" }}>
            Hiển thị {filtered.length}/{users.length} người dùng
          </div>
        )}
      </div>

      {/* Modals */}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={handleEditSaved} />}
      {resetUser && <ResetPwdModal user={resetUser} onClose={() => setResetUser(null)} />}
    </RouteTab>
  );
}
