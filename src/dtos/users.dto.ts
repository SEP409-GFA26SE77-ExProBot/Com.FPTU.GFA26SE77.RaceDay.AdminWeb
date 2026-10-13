export interface UserDto {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  roleId: string;
  status: string;
  gender?: string;
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: string;
  gender?: string;
}

export type CreateUserBody = CreateUserDto;

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  roleId?: string;
  status?: string;
  gender?: string;
}

export type UpdateUserBody = UpdateUserDto;

export interface ResetPasswordDto {
  newPassword: string;
}
