import * as z from "zod";

export const LoginSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  userId: z.union([z.string(), z.number()]).optional(),
  username: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: number | string;
  status: number | string;
  emailVerified: boolean;
  roleId: string;
  roleName: string | null;
  profileDescription: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  idNumber: string | null;
}
