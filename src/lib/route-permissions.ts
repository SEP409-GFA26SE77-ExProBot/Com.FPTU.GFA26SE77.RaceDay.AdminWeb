import { mapAppRole } from "./role";

const SHARED_PATHS = ["/profile", "/forbidden", "/change-password"];

export const ROLE_PREFIX: Record<string, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  RACE_STAFF: "/race-staff",
  PHOTOGRAPHER: "/photographer",
};

export const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["users", "finance", "settings", "audit", "refund-claims"],
  MANAGER: [
    "approvals", "payouts", "refund-claims", "package-durations", "package-capacities", "promos",
    "reconciliation", "stats",
  ],
  RACE_STAFF: [
    "checkpoint", "map", "map-demo", "scanner", "manual", "issues", "status", "medical",
    "cutoff", "inventory", "contingency", "broom",
  ],
  PHOTOGRAPHER: [
    "assignments", "upload", "ocr", "corrections", "analytics", "publish", "requests",
  ],
};

const PREFIX_ROLES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(ROLE_PREFIX).map(([role, prefix]) => [prefix, role])),
  "/coordinator": "RACE_STAFF",
  "/volunteer": "RACE_STAFF",
};

const matches = (path: string, base: string) => path === base || path.startsWith(base + "/");

/** The public URLs stay short; workspace prefixes and old bookmarks are also accepted. */
export function cleanWorkspacePath(path: string): string {
  const prefix = Object.keys(PREFIX_ROLES).find((base) => matches(path, base));
  return prefix ? path.slice(prefix.length) || "/" : path;
}

export function routePermission(path: string): string[] | "*" | null {
  if (path === "/login") return null;
  if (SHARED_PATHS.some((base) => matches(path, base))) return "*";

  const prefix = Object.keys(PREFIX_ROLES).find((base) => matches(path, base));
  const segment = cleanWorkspacePath(path).split("/")[1];
  const owners = Object.entries(ROLE_ROUTES)
    .filter(([, routes]) => routes.includes(segment))
    .map(([role]) => role);

  // Old Admin bookmarks for event operations now belong to Manager.
  if (prefix === "/admin" && owners.includes("MANAGER")) return ["MANAGER"];
  if (prefix) {
    const role = PREFIX_ROLES[prefix];
    return owners.length && !owners.includes(role) ? [] : [role];
  }
  return owners.length ? owners : Object.keys(ROLE_PREFIX);
}

/** Resume only a local route that the authenticated role can open. */
export function loginDestination(role: string, requestedPath: string): string {
  if (!requestedPath.startsWith("/") || requestedPath.startsWith("//") || requestedPath.includes("\\")) return "/";
  const target = new URL(requestedPath, "http://raceday.local");
  if (target.origin !== "http://raceday.local") return "/";
  const permission = routePermission(target.pathname);
  if (permission === "*" || (permission && permission.includes(mapAppRole(role)))) {
    return target.pathname + target.search + target.hash;
  }
  return "/";
}
