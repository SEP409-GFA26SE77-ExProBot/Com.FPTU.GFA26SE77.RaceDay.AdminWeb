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
  accessToken: z.string().optional(),
  role: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
