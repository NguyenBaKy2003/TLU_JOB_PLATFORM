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

/**
 * AuthRepository — implement IAuthRepository bằng HTTP (axios).
 *
 * Quy ước backend: mọi response đều bọc trong { data: { ... } }
 * theo ApiResponse<T> của Spring.
 */
export class AuthRepository implements IAuthRepository {
  // ── Registration & Login ───────────────────────────────────────────────────

  async signup(data: SignupData): Promise<RegisterResult> {
    const res = await api.post("/auth/register", {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role ?? "CANDIDATE",
    });

    // Backend trả: { userId, email, role }
    const payload = res.data.data as RegisterResult;
    return payload;
  }

  async login(credentials: UserCredentials): Promise<AuthResult> {
    const res = await api.post("/auth/login", credentials);

    // Backend: { success: true, data: { accessToken, refreshToken, user, ... } }
    const token = res.data.data as AuthToken;

    setAccessToken(token.accessToken);
    setRefreshToken(token.refreshToken);

    return token;
  }

  async loginWithOAuth(data: OAuthUserData): Promise<AuthResult> {
    // Token đã được Spring Security xử lý, frontend nhận qua redirect/callback
    const res = await api.post(`/auth/oauth2/callback`, data);
    const token = res.data.data as AuthToken;

    setAccessToken(token.accessToken);
    setRefreshToken(token.refreshToken);

    return token;
  }

  // ── Token Management ───────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const res = await api.post("/auth/refresh", null, {
      params: { refreshToken },
    });

    const token = res.data.data as AuthToken;
    setAccessToken(token.accessToken);
    setRefreshToken(token.refreshToken);

    return token;
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

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

  async updateProfile(
    userId: string,
    updates: UpdateProfileData,
  ): Promise<User> {
    const res = await api.put(`/users/${userId}`, updates);
    return res.data.data as User;
  }

  // ── OAuth2 URL ─────────────────────────────────────────────────────────────

  async getGoogleOAuthUrl(): Promise<string> {
    const res = await api.get("/auth/oauth2/url/google");
    return res.data.data.url as string;
  }

  async getFacebookOAuthUrl(): Promise<string> {
    const res = await api.get("/auth/oauth2/url/facebook");
    return res.data.data.url as string;
  }

  // ── Password Reset ─────────────────────────────────────────────────────────

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await api.post("/auth/password/reset/request", data);
  }

  async verifyPasswordReset(data: PasswordResetVerify): Promise<void> {
    await api.post("/auth/password/reset/verify", data);
  }

  // ── Password Change ────────────────────────────────────────────────────────

  async requestPasswordChange(data: PasswordChangeRequest): Promise<void> {
    await api.post("/auth/password/change/request", data);
  }

  async verifyPasswordChange(data: PasswordChangeVerify): Promise<void> {
    await api.post("/auth/password/change/verify", data);
  }


  async verifyEmail(email: string, code: string): Promise<void> {
  await api.post("/auth/verify-email", { email, code });
}

async resendVerificationEmail(email: string): Promise<void> {
  await api.post("/auth/resend-verification", { email });
}
}
