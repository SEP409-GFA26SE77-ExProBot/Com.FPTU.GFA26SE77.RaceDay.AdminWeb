import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server-auth";

export async function GET() {
  const jar = await cookies();
  const accessToken = jar.get(SESSION_COOKIE)?.value;
  if (!accessToken) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ accessToken }, { headers: { "Cache-Control": "no-store" } });
}
