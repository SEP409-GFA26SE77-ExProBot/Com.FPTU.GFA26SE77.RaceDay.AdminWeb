const SHARED_PATHS = ["/profile", "/forbidden", "/change-password"];

export const ROLE_PREFIX: Record<string, string> = {
  ADMIN: "/admin",
  VOLUNTEER: "/volunteer",
  COORDINATOR: "/coordinator",
  PHOTOGRAPHER: "/photographer",
};

export const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: [
    "approvals",
    "payouts",
    "finance",
    "settings",
    "users",
    "reconciliation",
    "audit",
    "stats",
  ],
  VOLUNTEER: ["scanner", "manual", "issues", "status"],
  COORDINATOR: [
    "map",
    "scanner",
    "medical",
    "cutoff",
    "inventory",
    "contingency",
    "broom",
  ],
  PHOTOGRAPHER: [
    "assignments",
    "upload",
    "ocr",
    "corrections",
    "analytics",
    "publish",
    "requests",
  ],
};


export function routePermission(path: string): string[] | "*" | null {
  if (path === "/login") return null;
  if (SHARED_PATHS.some((p) => path === p || path.startsWith(p + "/"))) return "*";
  const segment = path.split("/")[1];
  const roles = Object.entries(ROLE_PREFIX).filter(([, base]) => path === base || path.startsWith(base + "/")).map(([role]) => role);
  if (roles.length) return roles;
  const owners = Object.entries(ROLE_ROUTES).filter(([, routes]) => routes.includes(segment)).map(([role]) => role);
  return owners.length ? owners : Object.keys(ROLE_PREFIX);
}
