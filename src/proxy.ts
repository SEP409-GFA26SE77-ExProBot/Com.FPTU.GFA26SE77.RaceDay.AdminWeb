import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = ["/login"];

const ALLOWED_ROLES = ["admin", "administrator", "volunteer", "coordinator", "photographer"];

/**
 * Extract role claim from JWT token payload string in Edge environment.
 */
function extractRoleFromTokenString(token?: string | null): string | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (!payload || typeof payload !== "object") return null;

    const rawRole =
      payload?.role ||
      payload?.Role ||
      payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

    return rawRole ? String(rawRole).toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Resolve target route from role.
 */
function getTargetRoute(role?: string | null): string {
  const r = (role || "").toLowerCase();
  if (r === "admin" || r === "administrator") return "/administrator";
  if (r === "coordinator") return "/coordinator";
  if (r === "photographer") return "/photographer";
  if (r === "volunteer") return "/volunteer";
  return "/administrator";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and system files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("raceday_access_token")?.value;
  const cookieRole = request.cookies.get("raceday_role")?.value;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // If user is NOT logged in and attempting to access a protected route or /
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user IS logged in
  if (token) {
    const roleFromToken = extractRoleFromTokenString(token);
    const effectiveRole = (roleFromToken || cookieRole || "").toLowerCase();

    // Verify if role is in ALLOWED_ROLES (Admin, Volunteer, Coordinator, Photographer)
    if (!ALLOWED_ROLES.includes(effectiveRole)) {
      const response = NextResponse.redirect(new URL("/login?error=403", request.url));
      response.cookies.delete("raceday_access_token");
      response.cookies.delete("raceday_role");
      return response;
    }

    const targetRoute = getTargetRoute(effectiveRole);

    // Redirect root "/" or "/login" directly to their role-specific screen
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL(targetRoute, request.url));
    }
  }

  return NextResponse.next();
}

// Keep middleware export for compatibility if needed
export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
