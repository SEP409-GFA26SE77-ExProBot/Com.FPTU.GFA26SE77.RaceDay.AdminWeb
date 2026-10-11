"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { isAdminRole } from "@/lib/role";

const C = "#8B5CF6";
const CR = "139,92,246";

const navItems: NavItem[] = [
  { id: "approvals", label: "Duyệt giải", icon: "✅" },
  { id: "payouts", label: "Giải ngân", icon: "💸" },
  { id: "finance", label: "Tài chính", icon: "💰" },
  { id: "settings", label: "Cấu hình phí", icon: "⚙️" },
  { id: "users", label: "Người dùng", icon: "👥" },
  { id: "reconciliation", label: "Đối soát dữ liệu", icon: "🔎" },
  { id: "audit", label: "Nhật ký", icon: "📋" },
  { id: "stats", label: "Thống kê", icon: "📊" },
];

const stats: StatItem[] = [
  { label: "Total Events", value: "142", change: "12", positive: true, icon: "🏁" },
  { label: "Total Users", value: "28,410", change: "2.4%", positive: true, icon: "👥" },
  { label: "Pending Review", value: "5", icon: "✅" },
  { label: "Anomalies", value: "8", change: "3", positive: false, icon: "⚠️" },
  { label: "Monthly Revenue", value: "$84.2K", change: "11%", positive: true, icon: "💰" },
];

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const role = Cookies.get("role");
    if (!token || !isAdminRole(role)) {
      router.replace(
        `/?from=${encodeURIComponent("/administrator")}`
      );
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
        Đang kiểm tra phiên Admin…
      </div>
    );
  }

  return (
    <ActiveTabProvider defaultTab="approvals">
      <DashboardShell
        role="Administrator"
        roleAbbr="ADM"
        roleIcon="⚡"
        roleColor={C}
        roleColorRgb={CR}
        basePath="/administrator"
        navItems={navItems}
        stats={stats}
      >
        {children}
      </DashboardShell>
    </ActiveTabProvider>
  );
}
