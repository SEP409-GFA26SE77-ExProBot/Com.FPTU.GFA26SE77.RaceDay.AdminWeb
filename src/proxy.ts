import { NextRequest, NextResponse } from "next/server";
import { mapAppRole } from "./lib/role";
import { cleanWorkspacePath, ROLE_PREFIX, routePermission } from "./lib/route-permissions";
import { clearSession, SESSION_COOKIE, verifiedUser } from "./lib/server-auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (pathname === "/login" && !token) return NextResponse.next();

  let user;
  try {
    user = await verifiedUser(token);
  } catch {
    return new NextResponse("Authentication service unavailable", { status: 503 });
  }

  const role = mapAppRole(user?.roleName);
  const prefix = ROLE_PREFIX[role];
  if (!user || !prefix) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/login") loginUrl.searchParams.set("from", pathname + search);
    const response = pathname === "/login" ? NextResponse.next() : NextResponse.redirect(loginUrl);
    clearSession(response);
    return response;
  }

  if (pathname === "/login") return NextResponse.redirect(new URL("/", request.url));

  const permission = routePermission(pathname);
  if (permission === "*") return NextResponse.next();
  if (!permission || !permission.includes(role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  const clean = cleanWorkspacePath(pathname);
  if (clean !== pathname) return NextResponse.redirect(new URL(clean + search, request.url));
  const target = pathname === "/" ? prefix : prefix + pathname;
  return NextResponse.rewrite(new URL(target + search, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
