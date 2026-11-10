import { NextRequest, NextResponse } from "next/server";
import { userForRequest } from "@/lib/server-auth";
import { mapAppRole } from "./lib/role";

import { ROLE_PREFIX, ROLE_ROUTES } from "@/lib/route-permissions";
const PUBLIC_PATHS = ["/login"];
const SHARED_PATHS = ["/profile", "/forbidden", "/change-password"];
const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const matches = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const firstSegment = (pathname: string) => pathname.split("/")[1] ?? "";

const forbidden = (req: NextRequest) =>
  NextResponse.redirect(new URL("/forbidden", req.url));

export async function proxy(request: NextRequest) {
  const { pathname, search  } = request.nextUrl;
  let user;
  try { user = await userForRequest(request); }
  catch { return new NextResponse("Authentication service unavailable", { status: 503 }); }

  if (!user) {
    if (isPublic(pathname)) return NextResponse.next(); // tránh vòng lặp redirect
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  const role = mapAppRole(user.roleName);
  const prefix = ROLE_PREFIX[role];
  if (!prefix) {
    if (pathname === "/forbidden") return NextResponse.next();
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  // Đã login mà vào login → về "/"
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  for (const [r, p] of Object.entries(ROLE_PREFIX)) {
    if (matches(pathname, p)) {
      if (r !== role) return forbidden(request); // role khác → /forbidden
      const clean = pathname.slice(p.length) || "/";
      return NextResponse.redirect(new URL(clean + search, request.url));
    }
  }

  if (
    SHARED_PATHS.some((p) => matches(pathname, p))
  ) {
    return NextResponse.next();
  }

  // 6. URL gọn thuộc về role khác (volunteer gõ /finance) → /forbidden
  const seg = firstSegment(pathname);
  if (seg) {
    const ownedByMe = ROLE_ROUTES[role]?.includes(seg);
    const ownedByOther = Object.entries(ROLE_ROUTES).some(
      ([r, segs]) => r !== role && segs.includes(seg),
    );
    if (!ownedByMe && ownedByOther) return forbidden(request);
  }

  // 7. Còn lại: rewrite vào thư mục của role
  //    Route không ai sở hữu sẽ tự ra 404 đúng nghĩa
  const target = pathname === "/" ? prefix : `${prefix}${pathname}`;
  return NextResponse.rewrite(new URL(target + search, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
