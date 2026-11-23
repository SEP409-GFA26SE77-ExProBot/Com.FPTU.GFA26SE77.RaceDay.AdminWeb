"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { exportAdminDashboard, getAdminDashboard } from "@/api/dashboard";
import { listPagedAuditEntries } from "@/api/admin-audit";
import { Button } from "@/components/ui/button";
import { RouteTab } from "@/context/ActiveTabContext";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { numberLabel, recentRange, updatedLabel } from "@/lib/dashboard";
import {
  DateFilter,
  Distribution,
  Metric,
  Panel,
  RefreshButton,
  ResourceState,
  TrendChart,
  Updated,
} from "./DashboardUI";
import DashboardExport from "./DashboardExport";

const loadAudit = () => listPagedAuditEntries(1, 6);
const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý vận hành",
  ORGANIZER: "Ban tổ chức",
  RUNNER: "Vận động viên",
  STAFF: "Nhân viên",
  USER: "Người dùng",
};
const actionLabels: Record<string, string> = {
  UserCreated: "Tạo tài khoản",
  UserUpdated: "Cập nhật tài khoản",
  UserDeleted: "Xóa tài khoản",
  UserLoggedIn: "Đăng nhập",
  UserLocked: "Khóa tài khoản",
  UserUnlocked: "Mở khóa tài khoản",
  UserEmailVerified: "Xác thực email",
  PasswordReset: "Đặt lại mật khẩu",
  OrganizerRoleAssigned: "Cấp quyền tổ chức",
};

export default function AdminDashboard() {
  const [range, setRange] = useState(() => recentRange());
  const load = useCallback(() => getAdminDashboard(range), [range]);
  const dashboard = useDashboardResource(load);
  const audit = useDashboardResource(loadAudit);
  const data = dashboard.data;
  return (
    <RouteTab tab="dashboard">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4" />
              Quản trị hệ thống
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi tài khoản và hoạt động quản trị trên RaceDay.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RefreshButton
              onClick={() => {
                dashboard.reload();
                audit.reload();
              }}
            />
            <Button asChild className="min-h-11">
              <Link href="/users">
                Quản lý tài khoản
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>
        <DateFilter value={range} onChange={setRange} />
        <DashboardExport
          key={range.from + range.to}
          range={range}
          download={(format) => exportAdminDashboard(range, format)}
          disabled={!data || dashboard.loading}
        />
        <p className="text-xs text-muted-foreground">
          Bộ lọc ngày áp dụng cho tài khoản mới. Trạng thái tài khoản và vai trò
          là số liệu hiện tại.
        </p>
        <ResourceState
          loading={dashboard.loading}
          error={dashboard.error}
          retry={dashboard.reload}
        />
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric
                label="Tổng tài khoản"
                value={data.totalUsers}
                note="Toàn bộ tài khoản trong hệ thống"
              />
              <Metric
                label="Tài khoản mới trong kỳ"
                value={data.newUsersInPeriod}
                note="Theo ngày tạo trong khoảng đã áp dụng"
              />
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Panel
                title="Tài khoản mới"
                description={
                  numberLabel(data.newUsersInPeriod) +
                  " tài khoản được tạo trong khoảng ngày đã chọn"
                }
              >
                <TrendChart
                  dates={data.newUsersByDay.map((day) => day.date)}
                  series={[
                    {
                      label: "Tài khoản mới",
                      values: data.newUsersByDay.map((day) => day.count),
                    },
                  ]}
                />
              </Panel>
              <div className="space-y-6">
                <Panel title="Trạng thái tài khoản" description="Số tài khoản hiện tại; đã kích hoạt là đã xác thực email.">
                  <Distribution items={[
                    { label: "Đã kích hoạt", count: data.activeUsers },
                    { label: "Chờ xác thực email", count: data.pendingUsers },
                    { label: "Đã khóa", count: data.lockedUsers },
                  ]} />
                </Panel>
                <Panel
                  title="Phân bố vai trò"
                  description="Số tài khoản theo vai trò hiện tại"
                >
                  {data.usersByRole.length ? (
                    <Distribution
                      items={data.usersByRole.map((item) => ({
                        label: roleLabels[item.role.toUpperCase()] ?? item.role,
                        count: item.count,
                      }))}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có tài khoản.
                    </p>
                  )}
                </Panel>
              </div>
            </div>
            <Updated at={data.generatedAtUtc} />
          </>
        )}
        <Panel
          title="Hoạt động gần đây"
          description="6 bản ghi mới nhất của nhật ký hệ thống; không áp dụng bộ lọc ngày phía trên."
          action={
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/audit">
                Xem nhật ký
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <ResourceState
            loading={audit.loading}
            error={audit.error}
            retry={audit.reload}
          />
          {audit.data &&
            (audit.data.items.length ? (
              <ul className="divide-y divide-border">
                {audit.data.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-4"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">
                        {actionLabels[item.action] ?? item.action}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {item.resourceType} · {item.resourceId}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        Người thực hiện: {item.actorId || "Hệ thống"}
                      </p>
                    </div>
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={item.occurredOnUtc}
                    >
                      {updatedLabel(item.occurredOnUtc)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có hoạt động được ghi nhận.
              </p>
            ))}
        </Panel>
      </div>
    </RouteTab>
  );
}
