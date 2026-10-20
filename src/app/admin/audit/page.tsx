"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import { listPagedAuditEntries } from "@/api/admin-audit";
import type { AuditEntryDto } from "@/dto/admin-audit.dto";
import { getApiErrorMessage } from "@/lib/error";
import { RefreshCw } from "lucide-react";

const C = "#8B5CF6";
const PAGE_SIZE = 10;

type Category =
  | "all"
  | "user"
  | "event"
  | "registration"
  | "payment"
  | "refund"
  | "other";

function categorize(action: string, resourceType: string): Category {
  const a = action.toLowerCase();
  const r = resourceType.toLowerCase();
  if (
    r === "user" ||
    a.includes("user") ||
    a.includes("password") ||
    a.includes("organizerrole")
  )
    return "user";
  if (r === "raceevent" || a.includes("raceevent")) return "event";
  if (r === "registration" || a.includes("registration")) return "registration";
  if (r === "payment" || a.includes("payment") || a.includes("package"))
    return "payment";
  if (r === "refund" || a.includes("refund")) return "refund";
  return "other";
}

function catMeta(c: Category): {
  label: string;
  type: "cyan" | "amber" | "violet" | "rose" | "green" | "gray";
} {
  switch (c) {
    case "user":
      return { label: "user", type: "rose" };
    case "event":
      return { label: "event", type: "green" };
    case "registration":
      return { label: "registration", type: "violet" };
    case "payment":
      return { label: "payment", type: "cyan" };
    case "refund":
      return { label: "refund", type: "amber" };
    default:
      return { label: "other", type: "gray" };
  }
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    UserCreated: "Tạo user",
    UserUpdated: "Cập nhật user",
    UserDeleted: "Xóa user",
    UserLoggedIn: "Đăng nhập",
    UserLocked: "Khóa user",
    UserUnlocked: "Mở khóa user",
    UserEmailVerified: "Xác thực email",
    PasswordReset: "Đặt lại mật khẩu",
    OrganizerRoleAssigned: "Gán role Organizer",
    RaceEventCreated: "Tạo giải",
    RaceEventSubmitted: "Nộp duyệt giải",
    RaceEventApproved: "Duyệt giải",
    RaceEventRejected: "Từ chối giải",
    RegistrationCreated: "Đăng ký giải",
    RegistrationConfirmed: "Xác nhận đăng ký",
    RegistrationRejected: "Từ chối đăng ký",
    PaymentCompleted: "Thanh toán vé",
    PackagePaymentCompleted: "Thanh toán gói",
    PaymentFailed: "Thanh toán lỗi",
    RefundCompleted: "Hoàn tiền",
  };
  return map[action] || action;
}

function payloadPreview(raw?: string | null) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(obj)
      .slice(0, 4)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(" · ");
  } catch {
    return raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
  }
}

export default function AdministratorAuditPage() {
  const [entries, setEntries] = useState<AuditEntryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPagedAuditEntries(p, PAGE_SIZE);
      setEntries(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được nhật ký audit."));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      const cat = categorize(e.action, e.resourceType);
      if (category !== "all" && cat !== category) return false;
      if (!needle) return true;
      const hay = [
        e.action,
        e.actorId,
        e.resourceType,
        e.resourceId,
        e.payloadJson || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [entries, q, category]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <RouteTab tab="audit">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-04"
          title="Nhật ký audit"
          desc="Trail từ integration events: IAM, Event, Payment & hoàn tiền. Phân trang server-side."
          color={C}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <Card className="p-4">
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Lọc trang hiện tại: action, actor, resource…"
              className="min-w-[200px] flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="user">User / IAM</option>
              <option value="event">Giải</option>
              <option value="registration">Đăng ký</option>
              <option value="payment">Thanh toán</option>
              <option value="refund">Hoàn tiền</option>
              <option value="other">Khác</option>
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
            <p className="py-8 text-center text-sm text-muted-foreground">
              Đang tải…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có bản ghi audit (hoặc không khớp bộ lọc trang này).
            </p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((e) => {
                const cat = categorize(e.action, e.resourceType);
                const meta = catMeta(cat);
                const preview = payloadPreview(e.payloadJson);
                return (
                  <div
                    key={e.id}
                    className="flex gap-4 border-b border-border py-3 last:border-0"
                  >
                    <span className="w-[148px] shrink-0 pt-0.5 font-mono text-[11px] text-muted-foreground">
                      {e.occurredOnUtc
                        ? new Date(e.occurredOnUtc).toLocaleString("vi-VN")
                        : "—"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {actionLabel(e.action)}
                        </span>
                        <Badge label={meta.label} type={meta.type} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.resourceType}{" "}
                        <span style={{ color: C }} className="font-mono">
                          {e.resourceId.slice(0, 8)}…
                        </span>
                        {preview ? (
                          <span className="mt-0.5 block truncate">{preview}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="w-28 shrink-0 text-right text-[11px] text-muted-foreground">
                      {e.actorId === "system" || e.actorId === "admin"
                        ? e.actorId
                        : `${e.actorId.slice(0, 8)}…`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
            <span>
              Trang {page}/{totalPages} · {total} bản ghi
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
        </Card>
      </div>
    </RouteTab>
  );
}
