import { BASE_ENDPOINT } from "@/config/axios";
import { api } from "./client";
import type {
  UserDto,
  CreateUserBody,
  UpdateUserBody,
} from "@/dtos";

// Re-export DTOs for convenience
export * from "@/dtos/users.dto";

/**
 * GET /api/v1/iam/admin/users
 * List all users in the system
 */
export async function getUsers(): Promise<UserDto[]> {
  return api.get<UserDto[]>(`${BASE_ENDPOINT}/iam/admin/users`);
}

/**
 * POST /api/v1/iam/admin/users
 * Create a new user with an assigned role
 */
export async function createUser(body: CreateUserBody): Promise<UserDto> {
  return api.post<UserDto>(`${BASE_ENDPOINT}/iam/admin/users`, body);
}

/**
 * PUT /api/v1/iam/admin/users/:id
 * Update an existing user's profile and status
 */
export async function updateUser(userId: string, body: UpdateUserBody): Promise<UserDto> {
  return api.put<UserDto>(`${BASE_ENDPOINT}/iam/admin/users/${userId}`, body);
}

/**
 * POST /api/v1/iam/admin/users/:id/lock
 * Lock a user account to prevent login
 */
export async function lockUser(userId: string): Promise<unknown> {
  return api.post(`${BASE_ENDPOINT}/iam/admin/users/${userId}/lock`);
}

/**
 * POST /api/v1/iam/admin/users/:id/unlock
 * Unlock a user account
 */
export async function unlockUser(userId: string): Promise<unknown> {
  return api.post(`${BASE_ENDPOINT}/iam/admin/users/${userId}/unlock`);
}

/**
 * DELETE /api/v1/iam/admin/users/:id
 * Permanently delete a user account
 */
export async function deleteUser(userId: string): Promise<unknown> {
  return api.delete(`${BASE_ENDPOINT}/iam/admin/users/${userId}`);
}

/**
 * POST /api/v1/iam/admin/users/:id/reset-password
 * Reset a user's password directly (admin override)
 */
export async function resetPassword(userId: string, newPassword: string): Promise<unknown> {
  return api.post(`${BASE_ENDPOINT}/iam/admin/users/${userId}/reset-password`, {
    newPassword,
  });
}

/**
 * Compatibility object for admin IAM operations
 */
export const adminIamApi = {
  listUsers: getUsers,
  createUser,
  updateUser,
  lockUser,
  unlockUser,
  deleteUser,
  resetPassword,
};
