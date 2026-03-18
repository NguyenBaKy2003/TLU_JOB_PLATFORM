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
 */
export interface IAuthRepository {
  // ── Registration & Login ─────────────────────────────────────────────────

  /** POST /api/auth/register — trả về thông tin đăng ký, chưa có token */
  signup(data: SignupData): Promise<RegisterResult>;

  /** POST /api/auth/login — trả về user + token */
  login(credentials: UserCredentials): Promise<AuthResult>;

  /** Đăng nhập qua OAuth2 (Google/Facebook) — trả về user + token */
  loginWithOAuth(data: OAuthUserData): Promise<AuthResult>;

  // ── Token Management ─────────────────────────────────────────────────────

  /** POST /api/auth/refresh — làm mới access token bằng refresh token */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  // ── Logout ───────────────────────────────────────────────────────────────

  /** POST /api/auth/logout — đăng xuất thiết bị hiện tại */
  logout(accessToken: string): Promise<void>;

  /** POST /api/auth/logout-all — đăng xuất tất cả thiết bị */
  logoutAll(accessToken: string): Promise<void>;

  // ── Profile ───────────────────────────────────────────────────────────────

  /** GET /api/users/me — lấy thông tin user hiện tại */
  getCurrentUser(): Promise<User | null>;

  /** PUT /api/users/:id — cập nhật profile */
  updateProfile(userId: string, updates: UpdateProfileData): Promise<User>;

  // ── OAuth2 URL ────────────────────────────────────────────────────────────

  /** GET /api/auth/oauth2/url/google */
  getGoogleOAuthUrl(): Promise<string>;

  /** GET /api/auth/oauth2/url/facebook */
  getFacebookOAuthUrl(): Promise<string>;

  // ── Password Reset (quên mật khẩu) ───────────────────────────────────────

  /** Gửi email reset password */
  requestPasswordReset(data: PasswordResetRequest): Promise<void>;

  /** Xác nhận code + đặt lại mật khẩu */
  verifyPasswordReset(data: PasswordResetVerify): Promise<void>;

  // ── Password Change (đã đăng nhập) ───────────────────────────────────────

  /** Yêu cầu thay đổi mật khẩu (gửi OTP) */
  requestPasswordChange(data: PasswordChangeRequest): Promise<void>;

  /** Xác nhận OTP + đổi mật khẩu */
  verifyPasswordChange(data: PasswordChangeVerify): Promise<void>;

  /** POST /api/auth/verify-email — xác thực email sau đăng ký */
  verifyEmail(data: VerifyEmailRequest): Promise<AuthTokenResponse>;

  /** POST /api/auth/resend-verification — gửi lại OTP xác thực email */
  resendVerificationEmail(email: string): Promise<void>;
}
