export type AllowedRole =
  | "admin"
  | "administrator"
  | "volunteer"
  | "coordinator"
  | "photographer";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
}

export interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  Role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}
