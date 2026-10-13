import { Role } from "@/config/roles";

export interface LoginUserDto {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: LoginUserDto;
}

export type LoginResponse = LoginResponseDto;

export interface LoginRequestDto {
  username: string;
  password: string;
}

export type LoginBody = LoginRequestDto;

export type AllowedRole =
  | "admin"
  | "administrator"
  | "volunteer"
  | "coordinator"
  | "photographer"
  | "runner"
  | "organizer"
  | "staff";

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

export { Role };
