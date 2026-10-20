"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  listAdminUsers,
  lockAdminUser,
  unlockAdminUser,
} from "@/api/admin-users";
import {
  normalizeUserStatus,
  type AdminUserDto,
} from "@/dto/admin-user.dto";
import { getApiErrorMessage } from "@/lib/error";
import {
  extractRoleFromToken,
  extractUserIdFromToken,
} from "@/lib/jwt";
import { RefreshCw, ShieldOff, ShieldCheck } from "lucide-react";

const C = "#8B5CF6";

/** Bậc quyền — chỉ can thiệp role thấp hơn (không ngang/cao hơn, không tự khóa). */
function roleRank(role?: string | null): number {
  const r = (role || "").trim().toLowerCase();
  if (r === "admin" || r === "administrator") return 100;
  if (r === "organizer") return 60;
  if (r === "coordinator") return 50;
  if (r === "photographer") return 40;
  if (r === "volunteer") return 30;
  if (r === "user" || r === "runner") return 10;
  return 0;
}

function canManageTarget(
  actorId: string | undefined,
  actorRole: string | undefined,
  target: AdminUserDto
): { ok: boolean; reason?: string } {
  if (!actorId) return { ok: false, reason: "Chưa xác định phiên đăng nhập." };
  if (target.id === actorId)
    return { ok: false, reason: "Không thể khóa chính tài khoản đang đăng nhập." };
  if (roleRank(actorRole) <= roleRank(target.roleName))
    return {
      ok: false,
      reason: "Không có quyền can thiệp tài khoản ngang cấp hoặc cao hơn.",
    };
  return { ok: true };
}

function roleBadgeType(
  role?: string | null
): "cyan" | "green" | "violet" | "gray" | "rose" {
  const r = (role || "").toLowerCase();
  if (r.includes("photo")) return "cyan";
  if (r.includes("volun")) return "green";
  if (r.includes("organ")) return "violet";
  if (r.includes("admin")) return "rose";
  if (r.includes("coord")) return "cyan";
  return "gray";
}

function statusLabel(u: AdminUserDto) {
  const s = normalizeUserStatus(u.status);
  if (s === "locked") return { label: "Đã khóa", type: "rose" as const };
  if (s === "pending") return { label: "Chờ xác thực", type: "amber" as const };
  if (s === "active") return { label: "Hoạt động", type: "green" as const };
  return { label: String(u.status), type: "gray" as const };
}

export default function AdministratorUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const me = useMemo(() => {
    const token = Cookies.get("accessToken");
    return {
      id: extractUserIdFromToken(token),
      role: extractRoleFromToken(token) || Cookies.get("role") || undefined,
    };
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminUsers(p, pageSize);
      setUsers(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được danh sách người dùng."));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const roles = useMemo(() => {
    const set = new Set(
      users.map((u) => u.roleName || "—").filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [users]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && (u.roleName || "") !== roleFilter) return false;
      if (!needle) return true;
      return (
        u.fullName.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle)
      );
    });
  }, [users, q, roleFilter]);

  const onLockToggle = async (u: AdminUserDto) => {
    const gate = canManageTarget(me.id, me.role, u);
    if (!gate.ok) {
      setError(gate.reason || "Không có quyền.");
      return;
    }
    const locked = normalizeUserStatus(u.status) === "locked";
    const ok = window.confirm(
      locked
        ? `Mở khóa tài khoản ${u.email}?`
        : `Khóa tài khoản ${u.email}? User sẽ không đăng nhập được.`
    );
    if (!ok) return;
    setBusyId(u.id);
    setError(null);
    setToast(null);
    try {
      if (locked) await unlockAdminUser(u.id);
      else await lockAdminUser(u.id);
      setToast(locked ? `Đã mở khóa ${u.email}.` : `Đã khóa ${u.email}.`);
      await load(page);
    } catch (e) {
      setError(getApiErrorMessage(e, "Đổi trạng thái khóa thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <RouteTab tab="users">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-02"
          title="Quản lý người dùng"
          desc="Chỉ khóa/mở khóa tài khoản thấp hơn quyền của bạn. Không đổi role, không đặt mật khẩu, không khóa chính mình hoặc Admin khác."
          color={C}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {toast ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {toast}
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên, email, username…"
            className="min-w-[200px] flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">Tất cả role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load(page)}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Tải lại
          </Button>
        </div>

        {loading ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Đang tải…
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Không có người dùng khớp bộ lọc.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Họ tên</th>
                  <th className="px-3 py-2 font-semibold">Email / Username</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Tham gia</th>
                  <th className="px-3 py-2 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const st = statusLabel(u);
                  const locked = normalizeUserStatus(u.status) === "locked";
                  const gate = canManageTarget(me.id, me.role, u);
                  return (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold">{u.fullName}</td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{u.email}</div>
                        <div className="text-xs text-muted-foreground">
                          @{u.username}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          label={u.roleName || "—"}
                          type={roleBadgeType(u.roleName)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Badge label={st.label} type={st.type} />
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {gate.ok ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => void onLockToggle(u)}
                            className={locked ? "gap-1 text-white" : "gap-1"}
                            variant={locked ? undefined : "outline"}
                            style={locked ? { background: C } : undefined}
                          >
                            {locked ? (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <ShieldOff className="h-3.5 w-3.5" />
                                Khóa
                              </>
                            )}
                          </Button>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            title={gate.reason}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {page}/{totalPages} · {total} user
            {q || roleFilter !== "all"
              ? ` · lọc trang này: ${filtered.length}`
              : ""}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => void load(page - 1)}
            >
              Trước
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => void load(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </RouteTab>
  );
}
