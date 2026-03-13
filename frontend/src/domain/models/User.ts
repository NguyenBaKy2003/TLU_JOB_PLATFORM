// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type OAuthProvider = "LOCAL" | "GOOGLE" | "FACEBOOK";

// ─── Core Domain Model ────────────────────────────────────────────────────────

export interface User {
  id: string;                          // UUID từ backend
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  oauthProvider: OAuthProvider;
  verified: boolean;
  lastLoginAt: string | null;          // ISO 8601
  createdAt: string;
  updatedAt: string;
  // Thông tin lock account
  accountLocked: boolean;
  accountLockedUntil: string | null;
  minutesUntilUnlock: number;
  failedLoginAttempts: number;
}

// ─── Auth Token ───────────────────────────────────────────────────────────────

export interface AuthTokenUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  verified: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;   // "Bearer"
  expiresIn: number;   // seconds (900 = 15 phút)
  user: AuthTokenUser;
}
// ─── Command DTOs (Request) ───────────────────────────────────────────────────

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;                     // default CANDIDATE nếu không truyền
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface OAuthUserData {
  provider: "google" | "facebook";
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerify {
  token: string;
  userId: string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordChangeVerify {
  code: string;
  newPassword: string;
}

// ─── Result DTOs (Response) ───────────────────────────────────────────────────


export type AuthResult = AuthToken;
export interface RegisterResult {
  userId: string;
  email: string;
  role: UserRole;
}
