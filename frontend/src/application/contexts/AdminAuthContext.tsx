"use client";

import {
  createContext, useContext, useState,
  useEffect, useRef, useCallback, ReactNode,
} from "react";
import type { User, AuthTokenUser, UserRole } from "@/domain/models/User";
import {
  getAdminAccessToken, getAdminRefreshToken,
  setAdminAccessToken, setAdminRefreshToken,
  clearAdminTokens,
} from "@/lib/auth-helpers";

// ─── Context type ─────────────────────────────────────────────────────────────

interface AdminAuthContextType {
  adminUser:         User | null | undefined;
  adminLoading:      boolean;
  setAdminFromToken: (tokenUser: AuthTokenUser, accessToken: string, refreshToken: string) => void;
  refreshAdminUser:  () => Promise<void>;
  adminLogout:       () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_BEFORE_EXPIRY_S = 60;
const MAX_BACKOFF_MS          = 30_000;

// ─── Lấy base URL — dùng cùng 1 nguồn với axios ──────────────────────────────
// axios dùng NEXT_PUBLIC_API_BASE_URL, fetch thuần phải dùng cùng biến

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/$/, ""); // bỏ trailing slash nếu có

// ─── JWT helpers ──────────────────────────────────────────────────────────────

function getSecondsUntilExpiry(token: string): number {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 0;
  } catch {
    return 0;
  }
}

// ─── fetch /users/me với adminAccessToken ────────────────────────────────────

async function fetchAdminMe(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as User | null;
  } catch {
    return null;
  }
}

// ─── fetch /auth/refresh với adminRefreshToken ────────────────────────────────

async function fetchAdminRefresh(refreshToken: string): Promise<{
  accessToken:  string;
  refreshToken: string;
} | null> {
  try {
    const res = await fetch(
      `${API_BASE}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser,    setAdminUser]    = useState<User | null | undefined>(undefined);
  const [adminLoading, setAdminLoading] = useState(true);

  const isRefreshing   = useRef(false);
  const hasInitialized = useRef(false);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount     = useRef(0);
  const silentRefreshRef = useRef<() => Promise<void>>(async () => {});

  // ── cancelTimer ──────────────────────────────────────────────────────────

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── scheduleRefresh ───────────────────────────────────────────────────────

  const scheduleRefresh = useCallback(() => {
    cancelTimer();
    const token = getAdminAccessToken();
    if (!token) return;
    const delay = Math.max(
      0,
      (getSecondsUntilExpiry(token) - REFRESH_BEFORE_EXPIRY_S) * 1000,
    );
    timerRef.current = setTimeout(() => silentRefreshRef.current(), delay);
  }, [cancelTimer]);

  // ── silentRefresh ─────────────────────────────────────────────────────────

  const silentRefresh = useCallback(async () => {
    const rt = getAdminRefreshToken();
    if (!rt) {
      cancelTimer();
      clearAdminTokens();
      setAdminUser(null);
      return;
    }

    const result = await fetchAdminRefresh(rt);
    if (!result) {
      retryCount.current += 1;
      const backoff = Math.min(1_000 * 2 ** retryCount.current, MAX_BACKOFF_MS);
      timerRef.current = setTimeout(() => silentRefreshRef.current(), backoff);
      return;
    }

    setAdminAccessToken(result.accessToken);
    if (result.refreshToken) setAdminRefreshToken(result.refreshToken);
    retryCount.current = 0;
    scheduleRefresh();
  }, [cancelTimer, scheduleRefresh]);

  useEffect(() => { silentRefreshRef.current = silentRefresh; }, [silentRefresh]);

  // ── setAdminFromToken ─────────────────────────────────────────────────────

  const setAdminFromToken = useCallback((
    tokenUser:    AuthTokenUser,
    accessToken:  string,
    refreshToken: string,
  ) => {
    setAdminAccessToken(accessToken);
    setAdminRefreshToken(refreshToken);

    // ✅ Build User object đủ các field bắt buộc của interface User
    setAdminUser({
      id:                  tokenUser.id,
      email:               tokenUser.email,
      fullName:            tokenUser.fullName,
      role:                tokenUser.role as UserRole,
      avatarUrl:           tokenUser.avatarUrl,
      verified:            tokenUser.verified,
      active:              tokenUser.active,
      phone:               null,
      lastLoginAt:         null,
      // ── fields bắt buộc còn lại — sẽ được ghi đè bởi refreshAdminUser ──
      status:              "ACTIVE",
      oauthProvider:       "LOCAL",
      createdAt:           "",
      updatedAt:           "",
      accountLocked:       false,
      accountLockedUntil:  null,
      minutesUntilUnlock:  0,
      failedLoginAttempts: 0,
    });

    scheduleRefresh();
  }, [scheduleRefresh]);

  // ── refreshAdminUser ──────────────────────────────────────────────────────

  const refreshAdminUser = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setAdminLoading(true);

    try {
      const token = getAdminAccessToken();
      if (!token) { setAdminUser(null); return; }

      const currentUser = await fetchAdminMe(token);

      if (!currentUser || currentUser.role !== "ADMIN") {
        clearAdminTokens();
        setAdminUser(null);
        return;
      }

      setAdminUser(currentUser);
      scheduleRefresh();
    } catch {
      setAdminUser(null);
    } finally {
      setAdminLoading(false);
      isRefreshing.current = false;
    }
  }, [scheduleRefresh]);

  // ── adminLogout ───────────────────────────────────────────────────────────

  const adminLogout = useCallback(async () => {
    cancelTimer();
    const token = getAdminAccessToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* token hết hạn — bỏ qua */ }
    }
    clearAdminTokens();
    setAdminUser(null);
  }, [cancelTimer]);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = getAdminAccessToken();
    if (!token) {
      setAdminUser(null);
      setAdminLoading(false);
      return;
    }

    refreshAdminUser();
  }, [refreshAdminUser]);

  // ── Visibility change ─────────────────────────────────────────────────────

  useEffect(() => {
    const handle = () => {
      if (document.visibilityState !== "visible") return;
      const token = getAdminAccessToken();
      if (!token) return;
      if (getSecondsUntilExpiry(token) <= REFRESH_BEFORE_EXPIRY_S) {
        cancelTimer();
        silentRefreshRef.current();
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [cancelTimer]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminAuthContext.Provider value={{
      adminUser, adminLoading,
      setAdminFromToken, refreshAdminUser, adminLogout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth phải được dùng trong AdminAuthProvider");
  return ctx;
}