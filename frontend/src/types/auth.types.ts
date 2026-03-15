export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  verified: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummary;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}