import api from "@/config/axios";
import { LoginDto, LoginResponse } from "@/dto/auth.dto";
import Cookies from "js-cookie";
import { mapAppRole } from "@/lib/role";

const PUBLIC_API = "api/v1/iam";

function normalizeRole(raw: unknown): string | undefined {
  if (Array.isArray(raw) && raw.length > 0) return normalizeRole(raw[0]);
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  return raw.replace(/^ROLE_/i, "").trim().toUpperCase();
}

function extractRoleFromToken(token?: string): string | undefined {
  if (!token) return undefined;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return undefined;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      normalizeRole(payload.role) ||
      normalizeRole(
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      ) ||
      normalizeRole(
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
      ) ||
      normalizeRole(payload.roles) ||
      normalizeRole(payload.userRole) ||
      normalizeRole(payload.Role)
    );
  } catch {
    return undefined;
  }
}

/** POST /api/v1/iam/auth/login — cookie access_token / role / username / user_id */
export async function login(data: LoginDto): Promise<LoginResponse> {
  const loginPayload = {
    username: (data.username || data.email || "").trim(),
    password: data.password,
  };
  const res: LoginResponse = await api.post(
    `${PUBLIC_API}/auth/login`,
    loginPayload
  );
  const token = res.accessToken || res.token;
  const role = mapAppRole(
    normalizeRole(res.role) || extractRoleFromToken(token)
  );
  const username = res.username || loginPayload.username;
  const userId = res.userId || res.user_id;

  if (token) {
    const days = res.expiredTime ? res.expiredTime / (1000 * 60 * 60 * 24) : 7;
    Cookies.set("access_token", token, {
      expires: days,
      sameSite: "lax",
      path: "/",
    });
    Cookies.set("role", role, { expires: days, sameSite: "lax", path: "/" });
    if (username)
      Cookies.set("username", username, {
        expires: days,
        sameSite: "lax",
        path: "/",
      });
    if (userId)
      Cookies.set("user_id", userId.toString(), {
        expires: days,
        sameSite: "lax",
        path: "/",
      });
  }
  return res;
}

export async function logout(): Promise<void> {
  Cookies.remove("access_token");
  Cookies.remove("role");
  Cookies.remove("username");
  Cookies.remove("user_id");
  window.location.href = "/";
}
