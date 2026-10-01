"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";

const C = "#06B6D4";
const CR = "6,182,212";

const navItems: NavItem[] = [
  { id: "assignments", label: "Event Assignments", icon: "📅", badge: 3 },
  { id: "upload", label: "Photo Upload", icon: "📤" },
  { id: "ocr", label: "OCR Recognition", icon: "🔍", badge: 12 },
  { id: "corrections", label: "BIB Corrections", icon: "✏️", badge: 5 },
  { id: "analytics", label: "Photo Analytics", icon: "📊" },
  { id: "publish", label: "Publish Photos", icon: "🚀", badge: 48 },
  { id: "requests", label: "Edit / Hide Requests", icon: "📬", badge: 7 },
];

const stats: StatItem[] = [
  { label: "Photos Today", value: "2,341", change: "18%", positive: true, icon: "📷" },
  { label: "Published", value: "1,897", change: "11%", positive: true, icon: "✅" },
  { label: "Pending OCR", value: "444", change: "3%", positive: false, icon: "🔍" },
  { label: "Open Requests", value: "7", icon: "📬" },
  { label: "Avg Accuracy", value: "97.3%", change: "0.4%", positive: true, icon: "🎯" },
];

export default function PhotographerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveTabProvider defaultTab="assignments">
      <DashboardShell
        role="Photographer"
        roleAbbr="PHO"
        roleIcon="📷"
        roleColor={C}
        roleColorRgb={CR}
        basePath="/photographer"
        navItems={navItems}
        stats={stats}
      >
        {children}
      </DashboardShell>
    </ActiveTabProvider>
  );
}
