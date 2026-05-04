import type { ApiResponse, AuthToken, LoginForm, RegisterForm } from "../types/auth.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Token Storage 
export const TokenStorage = {
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("refreshToken");
  },

  clear(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  },
};

// ── API Calls ────
export async function loginWithEmail(
  form: LoginForm
): Promise<ApiResponse<AuthToken>> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  return res.json();
}

export async function registerWithEmail(
  form: RegisterForm
): Promise<ApiResponse<{ userId: string; email: string; role: string }>> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  return res.json();
}

export async function getOAuth2Url(
  provider: "google" | "facebook"
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/oauth2/url/${provider}`);
    const data: ApiResponse<{ url: string }> = await res.json();
    return data?.data?.url ?? null;
  } catch {
    return null;
  }
}