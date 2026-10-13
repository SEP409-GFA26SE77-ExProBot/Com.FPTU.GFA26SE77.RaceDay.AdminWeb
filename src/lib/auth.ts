import type { AuthUser } from "@/dtos";
export type { AuthUser };

/**
 * RaceDay auth token helpers.
 * Stores the JWT access token in localStorage & document.cookie.
 */

const TOKEN_KEY = "raceday_access_token";
const USER_KEY = "raceday_user";
const ROLE_KEY = "raceday_role";

export const ALLOWED_ROLES = ["admin", "administrator", "volunteer", "coordinator", "photographer"];

export function isAllowedRole(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_ROLES.includes(role.trim().toLowerCase());
}

/**
 * Decode base64url JWT payload safely in browser or Node/Edge environment.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    let jsonStr = "";
    if (typeof atob === "function") {
      jsonStr = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    }
    const parsed = JSON.parse(jsonStr);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Extract role claim from JWT token payload.
 */
export function extractRoleFromToken(token: string): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const rawRole =
    payload?.role ||
    payload?.Role ||
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

  return rawRole ? String(rawRole).toLowerCase() : null;
}

/**
 * Map role string to target route path.
 */
export function getRouteForRole(role?: string | null): string {
  const r = (role || "").toLowerCase();
  if (r === "admin" || r === "administrator") return "/administrator";
  if (r === "coordinator") return "/coordinator";
  if (r === "photographer") return "/photographer";
  if (r === "volunteer") return "/volunteer";
  return "/administrator";
}

export function setAuth(token: string, user?: AuthUser | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const roleFromToken = extractRoleFromToken(token);
    const effectiveRole = (user?.role || roleFromToken || "").toLowerCase();

    // Verify role is in ALLOWED_ROLES (Admin, Volunteer, Coordinator, Photographer)
    if (!isAllowedRole(effectiveRole)) {
      clearAuth();
      return false;
    }

    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role: effectiveRole }));
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify({ userId: "", username: "", email: "", role: effectiveRole }));
    }
    localStorage.setItem(ROLE_KEY, effectiveRole);

    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `${ROLE_KEY}=${encodeURIComponent(effectiveRole)}; path=/; max-age=2592000; SameSite=Lax`;
    return true;
  } catch {
    console.error("[auth] Failed to persist token");
    return false;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(TOKEN_KEY);
    if (fromLocal) return fromLocal;

    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${TOKEN_KEY}=`));
    if (cookieMatch) {
      return decodeURIComponent(cookieMatch.split("=")[1]);
    }
  } catch {
    return null;
  }
  return null;
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);

    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${ROLE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  const role = extractRoleFromToken(token);
  return isAllowedRole(role);
}
