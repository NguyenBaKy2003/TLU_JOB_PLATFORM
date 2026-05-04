// ─── Enums ─

export type UserRole     = "CANDIDATE" | "EMPLOYER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus   = "ACTIVE" | "INACTIVE" | "LOCKED";
export type OAuthProvider = "LOCAL" | "GOOGLE" | "FACEBOOK";

// ─── Core Domain Model ────

export interface User {
  id:                   string;
  email:                string;
  fullName:             string;
  phone:                string | null;
  avatarUrl:            string | null;
  role:                 UserRole;
  status:               UserStatus;
  oauthProvider:        OAuthProvider;
  verified:             boolean;
  active:               boolean;
  lastLoginAt:          string | null;
  createdAt:            string;
  updatedAt:            string;
  accountLocked:        boolean;
  accountLockedUntil:   string | null;
  minutesUntilUnlock:   number;
  failedLoginAttempts:  number;
}

// ─── Auth Token ───────────

export interface AuthTokenUser {
  id:        string;
  email:     string;
  fullName:  string;
  role:      UserRole;
  active:    boolean;
  avatarUrl: string | null;
  verified:  boolean;
}

export interface AuthToken {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;   // "Bearer"
  expiresIn:    number;   // seconds
  user:         AuthTokenUser;
}

/**
 * Alias — dùng khi backend trả về token sau verify email.
 * Cùng shape với AuthToken, đặt tên riêng để phân biệt ngữ cảnh.
 */
export type AuthTokenResponse = AuthToken;

// ─── Command DTOs ─────────

export interface SignupData {
  email:     string;
  password:  string;
  fullName:  string;
  role?:     UserRole;
}

export interface UserCredentials {
  email: string;
  password: string;
  portalType?: "CANDIDATE" | "EMPLOYER" | "ADMIN";
}
export interface OAuthUserData {
  provider:     "google" | "facebook";
  accessToken:  string;
  refreshToken: string;
}

export interface UpdateProfileData {
  fullName?:  string;
  phone?:     string;
  avatarUrl?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerify {
  token:       string;
  userId:      string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordChangeVerify {
  code:        string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code:  string;
}

// ─── Result DTOs ──────────

export type AuthResult = AuthToken;

export interface RegisterResult {
  userId: string;
  email:  string;
  role:   UserRole;
}