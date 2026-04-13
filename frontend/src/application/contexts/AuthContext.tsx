"use client";

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

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user:             User | null | undefined; // undefined = chưa load | null = chưa đăng nhập
  loading:          boolean;
  isAuthenticated:  boolean;
  setUserFromToken: (tokenUser: AuthTokenUser) => void;
  refreshUser:      () => Promise<void>;
  logout:           () => Promise<void>;
  logoutAll:        () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Refresh access token khi còn N giây trước khi hết hạn.
 * Đặt đủ lớn để có buffer network latency.
 */
const REFRESH_BEFORE_EXPIRY_S = 60; // 60 giây

/** Backoff tối đa khi retry thất bại (ms) */
const MAX_BACKOFF_MS = 30_000;

// ─── JWT helpers ──────────────────────────────────────────────────────────────

/**
 * Decode phần payload của JWT mà không cần verify signature.
 * Chỉ dùng để đọc `exp` — việc verify vẫn do server thực hiện.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Trả về số giây còn lại trước khi access token hết hạn.
 * Trả về 0 nếu token đã hết hạn hoặc không decode được.
 */
function getSecondsUntilExpiry(token: string): number {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return 0;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - nowSeconds);
}

// ─── Singleton service ────────────────────────────────────────────────────────

const authService = new AuthService(new AuthRepository());

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  /** Chống gọi refreshUser() song song */
  const isRefreshing      = useRef(false);
  /** Chống double-init trong Strict Mode */
  const hasInitialized    = useRef(false);
  /** setTimeout ID của lần schedule tiếp theo */
  const refreshTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Số lần retry liên tiếp thất bại */
  const retryCountRef     = useRef(0);

  // ── cancelScheduledRefresh ───────────────────────────────────────────────

  const cancelScheduledRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // ── scheduleNextRefresh ──────────────────────────────────────────────────
  /**
   * Đọc exp từ access token hiện tại → đặt timer để refresh
   * đúng lúc token sắp hết hạn (còn REFRESH_BEFORE_EXPIRY_S giây).
   *
   * Nếu token đã hết hạn hoặc sắp hết ngay bây giờ → refresh luôn.
   */
  const scheduleNextRefresh = useCallback(
    (doRefreshFn: () => Promise<void>) => {
      cancelScheduledRefresh();

      const token = getAccessToken();
      if (!token) return; // không có token → không schedule

      const secondsLeft = getSecondsUntilExpiry(token);
      const delayMs     = Math.max(
        0,
        (secondsLeft - REFRESH_BEFORE_EXPIRY_S) * 1000,
      );

      refreshTimerRef.current = setTimeout(doRefreshFn, delayMs);
    },
    [cancelScheduledRefresh],
  );

  // ── silentRefresh ─────────────────────────────────────────────────────────
  /**
   * Dùng refresh token để lấy access token mới, không gián đoạn UX.
   * Retry với exponential backoff nếu thất bại.
   * Nếu refresh token cũng hết hạn → buộc đăng xuất.
   */
  const silentRefresh = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // Refresh token không có → session hết, đăng xuất
      cancelScheduledRefresh();
      clearTokens();
      setUser(null);
      return;
    }

    try {
      // authService.refreshToken phải lưu token mới vào storage
      // (setAccessToken / setRefreshToken) bên trong implementation.
      await authService.refreshToken(refreshToken);

      // Reset retry counter sau khi thành công
      retryCountRef.current = 0;

      // Schedule lần refresh tiếp theo dựa trên token mới vừa nhận
      scheduleNextRefresh(silentRefresh);
    } catch (error) {
      retryCountRef.current += 1;

      const isAuthError =
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("invalid_grant") ||
          error.message.includes("Unauthorized"));

      if (isAuthError) {
        // Refresh token không hợp lệ / hết hạn → đăng xuất hẳn
        cancelScheduledRefresh();
        clearTokens();
        setUser(null);
        return;
      }

      // Lỗi mạng hoặc server tạm thời → retry với exponential backoff
      const backoffMs = Math.min(
        1_000 * 2 ** retryCountRef.current,
        MAX_BACKOFF_MS,
      );
      refreshTimerRef.current = setTimeout(silentRefresh, backoffMs);
    }
  }, [cancelScheduledRefresh, scheduleNextRefresh]);

  // ── setUserFromToken ───────────────────────────────────────────────────────
  // Dùng ngay sau login — user đã có trong token response, không cần /users/me

  const setUserFromToken = useCallback(
    (tokenUser: AuthTokenUser) => {
      setUser({
        id:          tokenUser?.id,
        email:       tokenUser?.email,
        fullName:    tokenUser?.fullName,
        role:        tokenUser?.role as UserRole,
        avatarUrl:   tokenUser?.avatarUrl,
        verified:    tokenUser?.verified,
        phone:       null,
        active:      true,
        lastLoginAt: null,
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

      // Bắt đầu schedule refresh ngay sau khi login
      scheduleNextRefresh(silentRefresh);
    },
    [scheduleNextRefresh, silentRefresh],
  );

  // ── refreshUser ───────────────────────────────────────────────────────────
  // Gọi GET /users/me — dùng khi cần thông tin đầy đủ hoặc sau OAuth2 callback

  const refreshUser = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setLoading(true);

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      // Sau khi verify user thành công, bắt đầu silent-refresh cycle
      scheduleNextRefresh(silentRefresh);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, [scheduleNextRefresh, silentRefresh]);

  // ── logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    cancelScheduledRefresh();
    const token = getAccessToken();
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        /* token hết hạn — vẫn clear */
      }
    }
    clearTokens();
    setUser(null);
  }, [cancelScheduledRefresh]);

  // ── logoutAll ─────────────────────────────────────────────────────────────

  const logoutAll = useCallback(async () => {
    cancelScheduledRefresh();
    const token = getAccessToken();
    if (token) {
      try {
        await authService.logoutAll(token);
      } catch {
        /* token hết hạn — vẫn clear */
      }
    }
    clearTokens();
    setUser(null);
  }, [cancelScheduledRefresh]);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Có token → verify qua /users/me và bắt đầu refresh cycle
    refreshUser();
  }, [refreshUser]);

  // ── Lắng nghe tokenChanged (OAuth2 callback / tab khác) ──────────────────

  useEffect(() => {
    const handle = () => refreshUser();
    window.addEventListener("tokenChanged", handle);
    return () => window.removeEventListener("tokenChanged", handle);
  }, [refreshUser]);

  // ── Lắng nghe visibilitychange ────────────────────────────────────────────
  // Khi user quay lại tab sau thời gian dài → kiểm tra token ngay

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState !== "visible") return;

      const token = getAccessToken();
      if (!token) return;

      const secondsLeft = getSecondsUntilExpiry(token);
      if (secondsLeft <= REFRESH_BEFORE_EXPIRY_S) {
        // Token đã hết hoặc sắp hết → silent refresh ngay
        cancelScheduledRefresh();
        silentRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisible);
    return () => document.removeEventListener("visibilitychange", handleVisible);
  }, [silentRefresh, cancelScheduledRefresh]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => cancelScheduledRefresh();
  }, [cancelScheduledRefresh]);

  // ─────────────────────────────────────────────────────────────────────────

  const isAuthenticated = user != null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
}