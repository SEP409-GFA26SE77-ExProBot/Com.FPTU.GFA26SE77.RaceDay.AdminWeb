import { ADMINISTRATOR_NAV, MANAGER_NAV, PHOTOGRAPHER_NAV, RACE_STAFF_NAV, type OpsRoleNav } from "./ops-nav";
export { Role } from "@/interfaces/role";

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
  name: string;
  roleAbbr: string;
  roleColor: string;
  roleColorRgb: string;
  basePath: string;
  navItems: NavItemConfig[];
}

function sidebarConfig(name: string, roleAbbr: string, roleColor: string, roleColorRgb: string, nav: OpsRoleNav): RoleConfig {
  return {
    name, roleAbbr, roleColor, roleColorRgb, basePath: "",
    navItems: nav.groups.flatMap((group) => group.items.map((item) => ({ ...item, icon: item.id }))),
  };
}

/** Compatibility sidebar uses the same navigation as each authenticated workspace. */
export const ROLES_CONFIG: Record<string, RoleConfig> = {
  admin: sidebarConfig("Admin", "ADM", "#8B5CF6", "139,92,246", ADMINISTRATOR_NAV),
  manager: sidebarConfig("Manager", "MGR", "#8B5CF6", "139,92,246", MANAGER_NAV),
  "race-staff": sidebarConfig("Race-staff", "STAFF", "#F59E0B", "245,158,11", RACE_STAFF_NAV),
  photographer: sidebarConfig("Photographer", "PHOTO", "#06B6D4", "6,182,212", PHOTOGRAPHER_NAV),
};
