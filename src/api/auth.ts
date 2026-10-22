import api from "@/config/axios";
import { LoginDto, LoginResponse } from "@/dto/auth.dto";
import Cookies from "js-cookie";
import { mapAppRole } from "@/lib/role";
import { extractExpirationFromToken, extractRoleFromToken } from "@/lib/jwt";

const PUBLIC_API = "api/v1/iam";

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** POST /api/v1/iam/auth/change-password */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await api.post<void>(`${PUBLIC_API}/auth/change-password`, data);
}

/** POST /api/v1/iam/auth/login — stores accessToken / role / username / user_id cookies */
export async function login(data: LoginDto): Promise<LoginResponse> {
  const loginPayload = {
    username: (data.username || "").trim(),
    password: data.password,
  };
  const res: LoginResponse = await api.post(
    `${PUBLIC_API}/auth/login`,
    loginPayload,
  );

  const accessToken = res.accessToken;
  const role = mapAppRole(
    extractRoleFromToken(accessToken) || res.role || null,
  );
  const username = res.username || loginPayload.username;
  const userId = res.userId;
  const expiredTime = extractExpirationFromToken(accessToken);

  if (accessToken) {
    const days = expiredTime ? expiredTime / (1000 * 60 * 60 * 24) : 7;
    Cookies.set("accessToken", accessToken, {
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
  Cookies.remove("accessToken");
  Cookies.remove("role");
  Cookies.remove("username");
  Cookies.remove("user_id");
  window.location.href = "/";
}
