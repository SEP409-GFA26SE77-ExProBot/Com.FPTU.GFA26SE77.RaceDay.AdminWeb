/**
 * Admin IAM users — /api/v1/iam/admin/users
 * Không đổi role trên UI (Organizer lên qua mua gói; ops role = provision).
 */
import api from "@/config/axios";
import type { AdminUserDto, PagedUsersResult } from "@/dto/admin-user.dto";

const BASE = "api/v1/iam/admin/users";

export async function listAdminUsers(
  page = 1,
  pageSize = 10
): Promise<PagedUsersResult> {
  const data = (await api.get(BASE, {
    params: { page, pageSize },
  })) as PagedUsersResult;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

export async function getAdminUser(userId: string): Promise<AdminUserDto> {
  return api.get(`${BASE}/${userId}`);
}

export async function lockAdminUser(userId: string): Promise<void> {
  await api.post(`${BASE}/${userId}/lock`);
}

export async function unlockAdminUser(userId: string): Promise<void> {
  await api.post(`${BASE}/${userId}/unlock`);
}
