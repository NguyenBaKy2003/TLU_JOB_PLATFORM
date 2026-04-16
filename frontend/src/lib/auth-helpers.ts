// lib/auth-helpers.ts
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY  = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ADMIN_ACCESS_KEY  = "adminAccessToken";
const ADMIN_REFRESH_KEY = "adminRefreshToken";

// ─── User tokens ──────────────────────────────────────────────────────────────

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event("tokenChanged"));
};

export const setRefreshToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event("tokenChanged"));
};

// ─── Admin tokens ─────────────────────────────────────────────────────────────

export const getAdminAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_ACCESS_KEY);
};

export const getAdminRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_REFRESH_KEY);
};

export const setAdminAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_ACCESS_KEY, token);
};

export const setAdminRefreshToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_REFRESH_KEY, token);
};

export const clearAdminTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_ACCESS_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
};

// ─── Token validation ─────────────────────────────────────────────────────────

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const timeUntilExpiry = decoded.exp * 1000 - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // < 5 phút
  } catch {
    return false;
  }
};

export type { JWTPayload };