// src/application/services/AuthService.ts
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
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
} from "@/domain/models/User";

// ─── Validation helpers ───────────────────────────────────────────────────────

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function assertValidEmail(email: string): void {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email không hợp lệ");
  }
}

function assertStrongPassword(password: string, label = "Mật khẩu"): void {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      `${label} phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số`,
    );
  }
}

function assertOtpCode(code: string): void {
  if (!code || !/^\d{6}$/.test(code)) {
    throw new Error("Mã OTP phải gồm đúng 6 chữ số");
  }
}

// ─── AuthService ──────────────────────────────────────────────────────────────

/**
 * AuthService — application layer.
 *
 * Trách nhiệm:
 * - Validate input trước khi gọi repository
 * - Orchestrate business rules
 * - Không biết HTTP, axios, hay storage tồn tại
 *
 * Quy tắc logout:
 * - logout/logoutAll chỉ xử lý user token
 * - Admin logout do AdminAuthContext tự gọi trực tiếp
 */
export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  // ── Session ───────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }

  // ── Registration & Login ──────────────────────────────────────────────────

  async signup(data: SignupData): Promise<RegisterResult> {
    assertValidEmail(data.email);
    assertStrongPassword(data.password);
    if (!data.fullName?.trim()) {
      throw new Error("Họ và tên không được để trống");
    }
    return this.authRepository.signup(data);
  }

  async login(credentials: UserCredentials): Promise<AuthResult> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email và mật khẩu không được để trống");
    }
    return this.authRepository.login(credentials);
  }

  async loginWithOAuth(data: OAuthUserData): Promise<AuthResult> {
    if (!data.accessToken || !data.provider) {
      throw new Error("Dữ liệu OAuth không hợp lệ");
    }
    return this.authRepository.loginWithOAuth(data);
  }

  // ── Token ─────────────────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    if (!refreshToken) throw new Error("Refresh token không hợp lệ");
    return this.authRepository.refreshToken(refreshToken);
  }

  // ── Logout (user token only) ──────────────────────────────────────────────

  async logout(accessToken: string): Promise<void> {
    return this.authRepository.logout(accessToken);
  }

  async logoutAll(accessToken: string): Promise<void> {
    return this.authRepository.logoutAll(accessToken);
  }

  // ── OAuth2 URL ────────────────────────────────────────────────────────────

  /**
   * Lấy Google OAuth2 URL cho portal cụ thể.
   *
   * portal quyết định:
   *  1. Role được gán khi tạo user mới qua OAuth2
   *  2. Portal access check sau khi Google callback về — nếu user đã có role
   *     khác portal → backend redirect về với lỗi PORTAL_ACCESS_DENIED
   *
   * Luôn phải truyền đúng portal tương ứng với trang đang gọi:
   *  - LoginPage (Candidate)  → "CANDIDATE"
   *  - EmployerLoginPage      → "EMPLOYER"
   */
  async getGoogleOAuthUrl(portal: "CANDIDATE" | "EMPLOYER" = "CANDIDATE"): Promise<string> {
    const res = await this.authRepository.getOAuthUrl("google", portal);
    return res.url;
  }

  async getFacebookOAuthUrl(): Promise<string> {
    return this.authRepository.getFacebookOAuthUrl();
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(userId: string, updates: UpdateProfileData): Promise<User> {
    if (!userId) throw new Error("User ID không hợp lệ");
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("Không có thông tin nào để cập nhật");
    }
    return this.authRepository.updateProfile(userId, updates);
  }

  // ── Password Reset ────────────────────────────────────────────────────────

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return this.authRepository.requestPasswordReset(data);
  }

  async verifyPasswordReset(data: PasswordResetVerify): Promise<void> {
    assertStrongPassword(data.newPassword, "Mật khẩu mới");
    return this.authRepository.verifyPasswordReset(data);
  }

  // ── Password Change ───────────────────────────────────────────────────────

  async requestPasswordChange(data: PasswordChangeRequest): Promise<void> {
    if (!data.oldPassword?.trim()) throw new Error("Vui lòng nhập mật khẩu cũ");
    assertStrongPassword(data.newPassword, "Mật khẩu mới");
    if (data.newPassword === data.oldPassword) {
      throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
    }
    return this.authRepository.requestPasswordChange(data);
  }

  async verifyPasswordChange(data: PasswordChangeVerify): Promise<void> {
    assertOtpCode(data.code);
    assertStrongPassword(data.newPassword, "Mật khẩu mới");
    return this.authRepository.verifyPasswordChange(data);
  }

  // ── Email Verification ────────────────────────────────────────────────────

  async verifyEmail(email: string, code: string): Promise<AuthTokenResponse> {
    assertValidEmail(email);
    assertOtpCode(code);
    return this.authRepository.verifyEmail({ email, code });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    assertValidEmail(email);
    return this.authRepository.resendVerificationEmail(email);
  }
}