export interface UserDto {
  id?: number;
  userName: string;
  phone: string;
  email: string;
  userRoles: string[];
  createdAt: string;
}

export interface UpdateUserRequest {
  id?: number;
  userName: string;
  countryCode: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  HELPER = 'HELPER',
  USER = 'USER'
}
