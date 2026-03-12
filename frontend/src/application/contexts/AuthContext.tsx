"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react"
import { User, UserRole, AuthTokenUser } from "@/domain/models/User"
import { AuthService } from "@/application/services/AuthService"
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository"
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/auth-helpers"

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null | undefined   // undefined = chưa load | null = chưa đăng nhập
  loading: boolean
  isAuthenticated: boolean
  setUserFromToken: (tokenUser: AuthTokenUser) => void
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
}

// ─── Singleton service ────────────────────────────────────────────────────────

const authService = new AuthService(new AuthRepository())

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const isRefreshing          = useRef(false)
  const hasInitialized        = useRef(false)

  // ── setUserFromToken ───────────────────────────────────────────────────────
  // Dùng sau login — user đã có trong token response, không cần gọi /users/me
  const setUserFromToken = useCallback((tokenUser: AuthTokenUser) => {
    setUser({
      id:          tokenUser.id,
      email:       tokenUser.email,
      fullName:    tokenUser.fullName,
      role:        tokenUser.role as UserRole,
      avatarUrl:   tokenUser.avatarUrl,
      verified:    tokenUser.verified,
      // Các field chưa có trong token — hydrate sau bằng refreshUser() nếu cần
      phone:       null,
      active:      true,
      lastLoginAt: null,
    })
  }, [])

  // ── refreshUser ───────────────────────────────────────────────────────────
  // Gọi GET /users/me — dùng khi cần thông tin đầy đủ hoặc sau OAuth2 callback
  const refreshUser = useCallback(async () => {
    if (isRefreshing.current) return
    isRefreshing.current = true
    setLoading(true)

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
      isRefreshing.current = false
    }
  }, [])

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = getAccessToken()
    if (token) {
      try { await authService.logout(token) } catch { /* token hết hạn — vẫn clear */ }
    }
    clearTokens()
    setUser(null)
  }, [])

  // ── logoutAll ─────────────────────────────────────────────────────────────
  const logoutAll = useCallback(async () => {
    const token = getAccessToken()
    if (token) {
      try { await authService.logoutAll(token) } catch { /* token hết hạn — vẫn clear */ }
    }
    clearTokens()
    setUser(null)
  }, [])

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const token = getAccessToken()
    if (!token) {
      // Chưa có token → không gọi API, set null ngay
      setUser(null)
      setLoading(false)
      return
    }

    // Có token → gọi /users/me để lấy thông tin đầy đủ và verify token còn hợp lệ
    refreshUser()
  }, [])

  // ── Lắng nghe tokenChanged (sau OAuth2 callback) ──────────────────────────
  useEffect(() => {
    const handle = () => refreshUser()
    window.addEventListener("tokenChanged", handle)
    return () => window.removeEventListener("tokenChanged", handle)
  }, [])

  // ── Auto silent refresh token ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const INTERVAL_MS = 12 * 60 * 1000 // 12 phút (access token hết hạn sau 15p)

    const timer = setInterval(async () => {
      const token = getRefreshToken()
      if (!token) return

      try {
        await authService.refreshToken(token)
      } catch {
        // Refresh token hết hạn → buộc đăng xuất
        clearTokens()
        setUser(null)
      }
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [user?.id])

  // ─────────────────────────────────────────────────────────────────────────

  const isAuthenticated = user != null

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      setUserFromToken,
      refreshUser,
      logout,
      logoutAll,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider")
  return context
}