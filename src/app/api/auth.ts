import { BASE_ENDPOINT } from "@/config/axios";
import { api } from "./client";
import type { LoginResponse } from "@/dtos";

// Re-export DTOs for convenience
export * from "@/dtos/auth.dto";

/**
 * POST /api/v1/iam/auth/login
 * Public authentication login endpoint
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  return api.publicPost<LoginResponse>(`${BASE_ENDPOINT}/iam/auth/login`, {
    username,
    password,
  });
}

/**
 * Compatibility object for IAM Auth API
 */
export const iamApi = {
  login,
};
