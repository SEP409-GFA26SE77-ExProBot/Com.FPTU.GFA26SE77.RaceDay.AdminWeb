"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { exportAdminDashboard, getAdminDashboard } from "@/api/dashboard";
import { listPagedAuditEntries } from "@/api/admin-audit";
import { Button } from "@/components/ui/button";
import { RouteTab } from "@/context/ActiveTabContext";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { dateLabel, recentRange, updatedLabel } from "@/lib/dashboard";
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
  RACE_STAFF: "Nhân viên giải chạy",
  "RACE-STAFF": "Nhân viên giải chạy",
  RACESTAFF: "Nhân viên giải chạy",
  PHOTOGRAPHER: "Nhiếp ảnh gia",
};
const actionLabels: Record<string, string> = {
  UserCreated: "Tạo tài khoản",
  UserUpdated: "Cập nhật tài khoản",
  UserDeleted: "Xóa tài khoản",
  UserLoggedIn: "Đăng nhập",
  UserLocked: "Khóa tài khoản",
  UserUnlocked: "Mở khóa tài khoản",
  UserEmailVerified: "Xác thực thư điện tử",
  PasswordReset: "Đặt lại mật khẩu",
  OrganizerRoleAssigned: "Cấp quyền tổ chức",
  RaceEventCreated: "Tạo giải chạy",
  RaceEventSubmitted: "Gửi duyệt giải chạy",
  RaceEventApproved: "Duyệt giải chạy",
  RaceEventRejected: "Từ chối giải chạy",
  RegistrationCreated: "Tạo đăng ký",
  RegistrationConfirmed: "Xác nhận đăng ký",
  RegistrationRejected: "Từ chối đăng ký",
  PaymentCompleted: "Thanh toán thành công",
  PackagePaymentCompleted: "Thanh toán gói tổ chức",
  PaymentFailed: "Thanh toán thất bại",
  RefundCompleted: "Hoàn tiền thành công",
};
const resourceLabels: Record<string, string> = {
  User: "Tài khoản",
  RaceEvent: "Giải chạy",
  Registration: "Đăng ký",
  Payment: "Thanh toán",
  Refund: "Hoàn tiền",
};

export default function AdminDashboard() {
  const [range, setRange] = useState(() => recentRange());
  const load = useCallback(() => getAdminDashboard(range), [range]);
  const dashboard = useDashboardResource(load);
  const audit = useDashboardResource(loadAudit);
  const data = dashboard.data;
  return (
    <RouteTab tab="dashboard">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <Button asChild className="min-h-11">
            <Link href="/users">Quản lý tài khoản</Link>
          </Button>
        </header>
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-card p-3">
          <DateFilter value={range} onChange={setRange} />
          <div className="flex flex-wrap items-start gap-2">
            <RefreshButton onClick={() => { dashboard.reload(); audit.reload(); }} />
            <DashboardExport
              key={range.from + range.to}
              range={range}
              download={(format) => exportAdminDashboard(range, format)}
              disabled={!data || dashboard.loading}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Tài khoản mới: {dateLabel(range.from)} – {dateLabel(range.to)} (giờ Việt Nam). Các chỉ số khác là số liệu hiện tại.
        </p>
        <ResourceState
          loading={dashboard.loading}
          error={dashboard.error}
          retry={dashboard.reload}
        />
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric label="Tổng tài khoản" value={data.totalUsers} />
              <Metric label="Mới trong kỳ" value={data.newUsersInPeriod} />
              <Metric label="Đã kích hoạt" value={data.activeUsers} />
              <Metric label="Đã khóa" value={data.lockedUsers} />
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Panel
                title="Tài khoản mới"
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
              <div className="space-y-4">
                <Panel title="Trạng thái tài khoản" description="Kích hoạt khi đã xác thực thư điện tử.">
                  <Distribution items={[
                    { label: "Đã kích hoạt", count: data.activeUsers },
                    { label: "Chờ xác thực thư điện tử", count: data.pendingUsers },
                    { label: "Đã khóa", count: data.lockedUsers },
                  ]} />
                </Panel>
                <Panel
                  title="Phân bố vai trò"
                >
                  {data.usersByRole.length ? (
                    <Distribution
                      items={data.usersByRole.map((item) => ({
                        label: roleLabels[item.role.toUpperCase()] ?? "Vai trò khác",
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
          description="6 hoạt động mới nhất, không theo bộ lọc ngày."
          action={
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/audit">
                Xem nhật ký
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
              <ul className="grid gap-x-6 lg:grid-cols-2">
                {audit.data.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 border-b border-border py-3"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">
                        {actionLabels[item.action] ?? "Hoạt động hệ thống"}
                      </p>
                      <details className="text-xs text-muted-foreground">
                        <summary className="min-h-11 cursor-pointer py-3 font-medium focus-visible:outline-2 focus-visible:outline-primary">Chi tiết</summary>
                        <p className="break-all">{resourceLabels[item.resourceType] ?? "Đối tượng"}: {item.resourceId}</p>
                        <p className="mt-1 break-all">Người thực hiện: {!item.actorId || item.actorId.toLowerCase() === "system" ? "Hệ thống" : item.actorId.toLowerCase() === "admin" ? "Quản trị viên" : item.actorId}</p>
                      </details>
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
