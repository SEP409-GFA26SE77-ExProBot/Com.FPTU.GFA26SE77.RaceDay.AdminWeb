"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";

const C = "#F59E0B";
const CR = "245,158,11";

const navItems: NavItem[] = [
  { id: "map", label: "Live Map", icon: "🗺️", badge: "2 SOS" },
  { id: "scanner", label: "QR / RFID Scanner", icon: "📡", badge: "LIVE" },
  { id: "medical", label: "Medical Teams", icon: "🚑", badge: 2 },
  { id: "cutoff", label: "Route & Cut-off", icon: "⏱️" },
  { id: "inventory", label: "Aid Stations", icon: "🏕️", badge: "⚠️ 1" },
  { id: "contingency", label: "Contingency Plans", icon: "🔴" },
  { id: "broom", label: "Broom Wagon", icon: "🚐" },
];

const stats: StatItem[] = [
  { label: "Active Runners", value: "1,024", change: "38", positive: false, icon: "🏃" },
  { label: "SOS Alerts", value: "2", icon: "🆘" },
  { label: "On Route", value: "91.2%", icon: "✅" },
  { label: "Aid Stations", value: "6/6", icon: "🏕️" },
  { label: "DNF so far", value: "42", change: "8", positive: false, icon: "🚩" },
];

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveTabProvider defaultTab="map">
      <DashboardShell
        role="Race-Day Coordinator"
        roleAbbr="OPS"
        roleIcon="🗺️"
        roleColor={C}
        roleColorRgb={CR}
        basePath="/coordinator"
        navItems={navItems}
        stats={stats}
      >
        {children}
      </DashboardShell>
    </ActiveTabProvider>
  );
}
