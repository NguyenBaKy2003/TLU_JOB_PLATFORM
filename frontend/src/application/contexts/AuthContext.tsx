"use client";
// src/application/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { User, UserRole, AuthTokenUser } from "@/domain/models/User";
import { AuthService }                   from "@/application/services/AuthService";
import { AuthRepository }                from "@/infrastructure/repositories/AuthRepository";
import {
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/lib/auth-helpers";

// ─── Context type ─────────

interface AuthContextType {
  user:             User | null | undefined; // undefined = chưa load | null = chưa đăng nhập
  loading:          boolean;
  isAuthenticated:  boolean;
  setUserFromToken: (tokenUser: AuthTokenUser) => void;
  refreshUser:      () => Promise<void>;
  logout:           () => Promise<void>;
  logoutAll:        () => Promise<void>;
}

// ─── Constants ────────────

const REFRESH_BEFORE_EXPIRY_S = 60;
const MAX_BACKOFF_MS          = 30_000;

// ─── JWT helpers ──────────

function getSecondsUntilExpiry(token: string): number {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 0;
  } catch {
    return 0;
  }
}

// ─── Singleton service ────

const authService = new AuthService(new AuthRepository());

// ─── Context ──────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const isRefreshing    = useRef(false);
  const hasInitialized  = useRef(false);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef   = useRef(0);
  const silentRefreshRef = useRef<() => Promise<void>>(async () => {});

  // ── cancelTimer ──────

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── scheduleRefresh ───

  const scheduleRefresh = useCallback(() => {
    cancelTimer();
    const token = getAccessToken();
    if (!token) return;
    const delay = Math.max(
      0,
      (getSecondsUntilExpiry(token) - REFRESH_BEFORE_EXPIRY_S) * 1000,
    );
    timerRef.current = setTimeout(() => silentRefreshRef.current(), delay);
  }, [cancelTimer]);

  // ── silentRefresh ─────

  const silentRefresh = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      cancelTimer();
      clearTokens();
      setUser(null);
      return;
    }

    try {
      await authService.refreshToken(refreshToken);
      retryCountRef.current = 0;
      scheduleRefresh();
    } catch (error) {
      retryCountRef.current += 1;

      const isAuthError =
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("invalid_grant") ||
          error.message.includes("Unauthorized"));

      if (isAuthError) {
        cancelTimer();
        clearTokens();
        setUser(null);
        return;
      }

      const backoffMs = Math.min(1_000 * 2 ** retryCountRef.current, MAX_BACKOFF_MS);
      timerRef.current = setTimeout(() => silentRefreshRef.current(), backoffMs);
    }
  }, [cancelTimer, scheduleRefresh]);

  useEffect(() => { silentRefreshRef.current = silentRefresh; }, [silentRefresh]);

  // ── setUserFromToken ──

  const setUserFromToken = useCallback(
    (tokenUser: AuthTokenUser) => {
      setUser({
        id:                  tokenUser.id,
        email:               tokenUser.email,
        fullName:            tokenUser.fullName,
        role:                tokenUser.role as UserRole,
        avatarUrl:           tokenUser.avatarUrl,
        verified:            tokenUser.verified,
        active:              tokenUser.active,
        phone:               null,
        lastLoginAt:         null,
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
    },
    [scheduleRefresh],
  );

  // ── refreshUser ───────

  const refreshUser = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setLoading(true);

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      scheduleRefresh();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, [scheduleRefresh]);

  // ── logout — chỉ clear user tokens ─────────

  const logout = useCallback(async () => {
    cancelTimer();
    const token = getAccessToken();
    if (token) {
      try {
        await authService.logout(token);
      } catch { /* expired — vẫn clear */ }
    }
    clearTokens(); // chỉ xóa accessToken + refreshToken
    setUser(null);
  }, [cancelTimer]);

  // ── logoutAll — chỉ clear user tokens ──────

  const logoutAll = useCallback(async () => {
    cancelTimer();
    const token = getAccessToken();
    if (token) {
      try {
        await authService.logoutAll(token);
      } catch {}
    }
    clearTokens();
    setUser(null);
  }, [cancelTimer]);

  // ── Initial load ──────

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  // ── tokenChanged event (OAuth2 / tab khác) ──

  useEffect(() => {
    const handle = () => refreshUser();
    window.addEventListener("tokenChanged", handle);
    return () => window.removeEventListener("tokenChanged", handle);
  }, [refreshUser]);

  // ── visibilitychange ──

  useEffect(() => {
    const handle = () => {
      if (document.visibilityState !== "visible") return;
      const token = getAccessToken();
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

  // ──────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user != null,
        setUserFromToken,
        refreshUser,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong AuthProvider");
  return ctx;
}