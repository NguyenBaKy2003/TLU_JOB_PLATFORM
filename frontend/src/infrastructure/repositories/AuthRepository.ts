// src/infrastructure/repositories/AuthRepository.ts
import api from "@/lib/axios";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "@/lib/auth-helpers";
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
  VerifyEmailRequest,
} from "@/domain/models/User";
import { ApiResponse } from "@/types/auth.types";

/**
 * AuthRepository — implement IAuthRepository bằng HTTP (axios).
 *
 * Quy ước: chỉ xử lý user token (accessToken / refreshToken).
 * Admin token do AdminAuthContext tự quản lý qua fetch thuần.
 */
export class AuthRepository implements IAuthRepository {
  // ── Registration & Login ───────────────────────────────────────────────────

  async signup(data: SignupData): Promise<RegisterResult> {
    const res = await api.post("/auth/register", {
      email:    data.email,
      password: data.password,
      fullName: data.fullName,
      role:     data.role ?? "CANDIDATE",
    });
    return res.data.data as RegisterResult;
  }

  async login(credentials: UserCredentials): Promise<AuthResult> {
    const res = await api.post("/auth/login", credentials);
    return res.data.data as AuthToken;
  }

  async loginWithOAuth(data: OAuthUserData): Promise<AuthResult> {
    const res   = await api.post("/auth/oauth2/callback", data);
    const token = res.data.data as AuthToken;
    setAccessToken(token.accessToken);
    setRefreshToken(token.refreshToken);
    return token;
  }

  // ── Token Management ───────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const res   = await api.post("/auth/refresh", null, {
      params: { refreshToken },
    });
    const token = res.data.data as AuthToken;
    setAccessToken(token.accessToken);
    setRefreshToken(token.refreshToken);
    return token;
  }

  // ── Logout (user token only) ───────────────────────────────────────────────

  async logout(accessToken: string): Promise<void> {
    await api.post("/auth/logout", null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    clearTokens();
  }

  async logoutAll(accessToken: string): Promise<void> {
    await api.post("/auth/logout-all", null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    clearTokens();
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await api.get("/users/me");
      return res.data.data as User;
    } catch {
      return null;
    }
  }

  async updateProfile(userId: string, updates: UpdateProfileData): Promise<User> {
    const res = await api.put(`/users/${userId}`, updates);
    return res.data.data as User;
  }

  // ── OAuth2 URL ─────────────────────────────────────────────────────────────

  /**
   * Lấy OAuth2 authorization URL cho provider + portal cụ thể.
   *
   * portal được truyền xuống backend qua query param:
   *   GET /auth/oauth2/url/google?portal=EMPLOYER
   *
   * Backend (AuthController) sẽ gắn portal vào URL dạng:
   *   /oauth2/authorization/google?state=EMPLOYER
   *
   * CustomAuthorizationRequestResolver nhúng vào OAuth2 state và
   * additionalParameters["portal_type"] để các handler phía sau đọc được.
   */
  async getOAuthUrl(
    provider: "google" | "facebook",
    portal: "CANDIDATE" | "EMPLOYER",
  ): Promise<{ url: string }> {
    const res = await api.get(`/auth/oauth2/url/${provider}`, {
      params: { portal },
    });
    return res.data.data as { url: string };
  }

  async getFacebookOAuthUrl(): Promise<string> {
    const res = await this.getOAuthUrl("facebook", "CANDIDATE");
    return res.url;
  }

  // ── Password Reset ─────────────────────────────────────────────────────────

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await api.post("/auth/forgot-password", data);
  }

  async verifyPasswordReset(data: PasswordResetVerify): Promise<void> {
    await api.post("/auth/reset-password", data);
  }

  // ── Password Change ────────────────────────────────────────────────────────

  async requestPasswordChange(data: PasswordChangeRequest): Promise<void> {
    await api.post("/auth/password/change/request", data);
  }

  async verifyPasswordChange(data: PasswordChangeVerify): Promise<void> {
    await api.post("/auth/password/change/verify", data);
  }

  // ── Email Verification ─────────────────────────────────────────────────────

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthTokenResponse> {
    const res = await api.post<ApiResponse<AuthTokenResponse>>(
      "/auth/verify-email",
      data,
    );
    return res.data.data as AuthTokenResponse;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await api.post("/auth/resend-otp", { email });
  }
}