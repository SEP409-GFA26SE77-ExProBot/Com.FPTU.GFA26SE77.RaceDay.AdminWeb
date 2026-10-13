import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/config/global-config";

/**
 * Proxy file từ API local (uploads/event-docs|event-banners/…) —
 * cùng quy tắc User FE `/api/media`: BE UseStaticFiles phục vụ wwwroot/uploads.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u");
  if (!raw) {
    return NextResponse.json({ error: "Thiếu u" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
  }

  const apiBase = (BASE_URL || "").replace(/\/$/, "");
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);
  if (apiBase) {
    try {
      allowedHosts.add(new URL(apiBase).hostname);
    } catch {
      /* ignore */
    }
  }

  if (!allowedHosts.has(target.hostname)) {
    return NextResponse.json({ error: "Host không được phép" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: upstream.status }
      );
    }
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const body = await upstream.arrayBuffer();
    const fileName =
      target.pathname.split("/").filter(Boolean).pop() || "file";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Không tải được file" }, { status: 502 });
  }
}
