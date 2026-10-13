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
