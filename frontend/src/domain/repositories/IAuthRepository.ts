// src/domain/repositories/IAuthRepository.ts
import {
  AuthResult,
  AuthToken,
  AuthTokenResponse,
  OAuthUserData,
  PasswordChangeRequest,
  PasswordChangeVerify,
  PasswordResetRequest,
  PasswordResetVerify,
  RegisterResult,
  SignupData,
  UpdateProfileData,
  User,
  UserCredentials,
  VerifyEmailRequest,
} from "../models/User";

/**
 * IAuthRepository — contract giữa domain và infrastructure.
 *
 * - Domain/UseCase chỉ phụ thuộc vào interface này.
 * - AuthRepository (infrastructure) implement cụ thể bằng HTTP/axios.
 * - Dễ mock trong unit test.
 *
 * Quy tắc: mỗi method chỉ biết token của chính nó.
 * User logout → chỉ dùng accessToken.
 * Admin logout → AdminAuthContext tự gọi endpoint với adminAccessToken.
 */
export interface IAuthRepository {
  // ── Registration & Login ────

  /** POST /auth/register */
  signup(data: SignupData): Promise<RegisterResult>;

  /** POST /auth/login */
  login(credentials: UserCredentials): Promise<AuthResult>;

  /** OAuth2 callback */
  loginWithOAuth(data: OAuthUserData): Promise<AuthResult>;

  // ── Token Management ─

  /** POST /auth/refresh */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  // ── Logout (user only) 

  /** POST /auth/logout — đăng xuất thiết bị hiện tại, chỉ dùng user token */
  logout(accessToken: string): Promise<void>;

  /** POST /auth/logout-all — đăng xuất tất cả thiết bị, chỉ dùng user token */
  logoutAll(accessToken: string): Promise<void>;

  // ── Profile ───────────

  /** GET /users/me */
  getCurrentUser(): Promise<User | null>;

  /** PUT /users/:id */
  updateProfile(userId: string, updates: UpdateProfileData): Promise<User>;

  // ── OAuth2 URL ────────

  /**
   * GET /auth/oauth2/url/{provider}?portal={portal}
   *
   * portal xác định role khi tạo user mới và kiểm tra portal access:
   *  - "CANDIDATE" → trang ứng viên
   *  - "EMPLOYER"  → trang nhà tuyển dụng
   *
   * Trả về { url: string } để frontend redirect sang Google/Facebook.
   */
  getOAuthUrl(
    provider: "google" | "facebook",
    portal: "CANDIDATE" | "EMPLOYER",
  ): Promise<{ url: string }>;

  getFacebookOAuthUrl(): Promise<string>;

  // ── Password Reset ────

  requestPasswordReset(data: PasswordResetRequest): Promise<void>;
  verifyPasswordReset(data: PasswordResetVerify): Promise<void>;

  // ── Password Change ───

  requestPasswordChange(data: PasswordChangeRequest): Promise<void>;
  verifyPasswordChange(data: PasswordChangeVerify): Promise<void>;

  // ── Email Verification 

  verifyEmail(data: VerifyEmailRequest): Promise<AuthTokenResponse>;
  resendVerificationEmail(email: string): Promise<void>;
}