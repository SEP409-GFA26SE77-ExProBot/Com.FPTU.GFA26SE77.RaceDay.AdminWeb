/** IAM admin user DTOs — khớp /api/v1/iam/admin/users */

export type UserStatusDto = "Locked" | "Active" | "Pending" | 0 | 1 | 2 | string;

export interface AdminUserDto {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender: number | string;
  status: UserStatusDto;
  emailVerified: boolean;
  roleId: string;
  roleName?: string | null;
  profileDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
  idNumber?: string | null;
}

export interface PagedUsersResult {
  items: AdminUserDto[];
  total: number;
  page: number;
  pageSize: number;
}

export function normalizeUserStatus(status: UserStatusDto): "locked" | "active" | "pending" | "unknown" {
  if (status === 0 || status === "Locked" || status === "locked") return "locked";
  if (status === 1 || status === "Active" || status === "active") return "active";
  if (status === 2 || status === "Pending" || status === "pending") return "pending";
  return "unknown";
}
