import { useAuthStore, announceSessionChange } from "@/stores/auth-store";
import api from "@/config/axios";
import { LoginDto, LoginResponse } from "@/dto/auth.dto";
import { mapAppRole } from "@/lib/role";

const PUBLIC_API = "api/v1/iam";

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** POST /api/v1/iam/auth/change-password */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await api.post<void>(`${PUBLIC_API}/auth/change-password`, data);
}

/** Login through the same-origin BFF, then load the verified current user. */
export async function login(data: LoginDto): Promise<LoginResponse> {
  const loginPayload = {
    username: (data.username || "").trim(),
    password: data.password,
  };
  const res: LoginResponse = await api.post(
    `${PUBLIC_API}/auth/login`,
    loginPayload,
  );

  useAuthStore.getState().clearAuth();
  await useAuthStore.getState().fetchMe();
  const user = useAuthStore.getState().user;
  if (!user) {
    await useAuthStore.getState().logout();
    throw new Error("Không thể xác nhận phiên đăng nhập.");
  }
  announceSessionChange();
  return { ...res, role: mapAppRole(user.roleName), userId: user.id, username: user.username };

}

export async function logout(): Promise<void> {
  try {
    await useAuthStore.getState().logout();
  } finally {
    window.location.href = '/';
  }
}
