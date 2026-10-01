"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";

const C = "#10B981";
const CR = "16,185,129";

const navItems: NavItem[] = [
  { id: "scanner", label: "QR / RFID Scanner", icon: "📡", badge: "LIVE" },
  { id: "manual", label: "Manual Entry", icon: "⌨️", badge: 3 },
  { id: "issues", label: "On-site Issues", icon: "⚠️", badge: 2 },
  { id: "status", label: "Special Status", icon: "🚩" },
];

const stats: StatItem[] = [
  { label: "Scans Today", value: "1,284", change: "22%", positive: true, icon: "📡" },
  { label: "Manual Entries", value: "3", change: "1", positive: false, icon: "⌨️" },
  { label: "Open Issues", value: "2", icon: "⚠️" },
  { label: "DNS / DNF / DQ", value: "8", change: "3", positive: false, icon: "🚩" },
  { label: "Checkpoint", value: "CP3", icon: "📍" },
];

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveTabProvider defaultTab="scanner">
      <DashboardShell
        role="Volunteer"
        roleAbbr="VOL"
        roleIcon="🏃"
        roleColor={C}
        roleColorRgb={CR}
        basePath="/volunteer"
        navItems={navItems}
        stats={stats}
      >
        {children}
      </DashboardShell>
    </ActiveTabProvider>
  );
}
