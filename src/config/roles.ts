export enum Role {
    ADMIN = 'ADMIN',
    PHOTOGRAPHER = 'PHOTOGRAPHER',
    RUNNER = 'RUNNER',
    ORGANIZER = 'ORGANIZER',
    STAFF = 'STAFF',
    VOLUNTEER = 'VOLUNTEER',
    COORDINATOR = 'COORDINATOR',
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
  href?: string;
}

export interface StatItemConfig {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: string;
}

export interface RoleConfig {
  id: string;
  name: string;
  roleAbbr: string;
  roleIcon: string;
  roleColor: string;
  roleColorRgb: string;
  basePath: string;
  navItems: NavItemConfig[];
  stats: StatItemConfig[];
}

export const ROLES_CONFIG: Record<string, RoleConfig> = {
  volunteer: {
    id: "volunteer",
    name: "Volunteer",
    roleAbbr: "VOL",
    roleIcon: "🏃",
    roleColor: "#10B981",
    roleColorRgb: "16,185,129",
    basePath: "/volunteer",
    navItems: [
      { id: "scanner", label: "QR / RFID Scanner", icon: "📡", badge: "LIVE" },
      { id: "manual", label: "Manual Entry", icon: "✍️" },
      { id: "issues", label: "Lost BIB / Issues", icon: "⚠️", badge: 3 },
      { id: "status", label: "DNS / DNF / DQ", icon: "📋" },
    ],
    stats: [
      { label: "Check-in Count", value: "847", change: "12%", positive: true, icon: "✅" },
      { label: "Pending Sync", value: "3", icon: "🔄" },
      { label: "Issues Flagged", value: "3", change: "1", positive: false, icon: "⚠️" },
      { label: "Scanner Battery", value: "84%", icon: "🔋" },
    ],
  },
  coordinator: {
    id: "coordinator",
    name: "Race-Day Coordinator",
    roleAbbr: "OPS",
    roleIcon: "🗺️",
    roleColor: "#F59E0B",
    roleColorRgb: "245,158,11",
    basePath: "/coordinator",
    navItems: [
      { id: "map", label: "Live Map", icon: "🗺️", badge: "2 SOS" },
      { id: "scanner", label: "QR / RFID Scanner", icon: "📡", badge: "LIVE" },
      { id: "medical", label: "Medical Teams", icon: "🚑", badge: 2 },
      { id: "cutoff", label: "Route & Cut-off", icon: "⏱️" },
      { id: "inventory", label: "Aid Stations", icon: "🏕️", badge: "⚠️ 1" },
      { id: "contingency", label: "Contingency Plans", icon: "🔴" },
      { id: "broom", label: "Broom Wagon", icon: "🚐" },
    ],
    stats: [
      { label: "Active Runners", value: "1,024", change: "38", positive: false, icon: "🏃" },
      { label: "SOS Alerts", value: "2", icon: "🆘" },
      { label: "On Route", value: "91.2%", icon: "✅" },
      { label: "Aid Stations", value: "6/6", icon: "🏕️" },
      { label: "DNF so far", value: "42", change: "8", positive: false, icon: "🚩" },
    ],
  },
  administrator: {
    id: "administrator",
    name: "Administrator",
    roleAbbr: "ADM",
    roleIcon: "⚡",
    roleColor: "#8B5CF6",
    roleColorRgb: "139,92,246",
    basePath: "/administrator",
    navItems: [
      { id: "approvals", label: "Approvals", icon: "📋", badge: 3 },
      { id: "users", label: "User Management", icon: "👥" },
      { id: "reconciliation", label: "Timing Reconcile", icon: "⚖️", badge: 5 },
      { id: "audit", label: "Audit Trail", icon: "🔒" },
      { id: "stats", label: "Platform KPIs", icon: "📊" },
    ],
    stats: [
      { label: "Total Events", value: "48", change: "4", positive: true, icon: "🏆" },
      { label: "Pending Approvals", value: "3", icon: "⏳" },
      { label: "Timing Flags", value: "5", icon: "⚠️" },
      { label: "Active Users", value: "1,840", change: "120", positive: true, icon: "👥" },
    ],
  },
  photographer: {
    id: "photographer",
    name: "Photographer",
    roleAbbr: "PHO",
    roleIcon: "📷",
    roleColor: "#06B6D4",
    roleColorRgb: "6,182,212",
    basePath: "/photographer",
    navItems: [
      { id: "assignments", label: "Assignments", icon: "🏔️", badge: 3 },
      { id: "upload", label: "Upload Photos", icon: "📤" },
      { id: "ocr", label: "OCR Recognition", icon: "🔍", badge: "AI" },
      { id: "corrections", label: "BIB Corrections", icon: "✏️", badge: 5 },
      { id: "analytics", label: "Photo Analytics", icon: "📈" },
      { id: "publish", label: "Publish Review", icon: "🚀", badge: 83 },
      { id: "requests", label: "Photo Requests", icon: "📩", badge: 5 },
    ],
    stats: [
      { label: "Uploaded Today", value: "3,820", change: "1,200", positive: true, icon: "📷" },
      { label: "AI Tagged", value: "3,711", change: "97.1%", positive: true, icon: "🏷️" },
      { label: "Corrections", value: "5", icon: "⚠️" },
      { label: "Published", value: "3,628", icon: "✅" },
    ],
  },
};
