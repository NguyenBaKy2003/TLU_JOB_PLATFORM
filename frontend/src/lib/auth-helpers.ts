// lib/auth-helpers.ts
// Token storage and validation helpers

import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  sub: string
  role: string
  exp: number
  iat: number
}

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const ADMIN_ACCESS=  "adminAccessToken"
const  ADMIN_REFRESH= "adminRefreshToken"
// ==================== Token Storage ====================

export const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    window.dispatchEvent(new Event("tokenChanged"))
  }
}

export const setRefreshToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }
  return null
}

export function getAdminAccessToken():  string | null { return localStorage.getItem(ADMIN_ACCESS);  }
export function getAdminRefreshToken(): string | null { return localStorage.getItem(ADMIN_REFRESH); }
 
export function setAdminAccessToken(t: string):  void { localStorage.setItem(ADMIN_ACCESS,  t); }
export function setAdminRefreshToken(t: string): void { localStorage.setItem(ADMIN_REFRESH, t); }
export function clearAdminTokens(): void {
  localStorage.removeItem(ADMIN_ACCESS);
  localStorage.removeItem(ADMIN_REFRESH);
}
export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

export const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.dispatchEvent(new Event("tokenChanged"))
  }
}

// ==================== Token Validation ====================

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    const exp = decoded.exp * 1000
    return Date.now() >= exp
  } catch {
    return true
  }
}

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    const exp = decoded.exp * 1000
    const timeUntilExpiry = exp - Date.now()
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 5 * 60 * 1000
  } catch {
    return false
  }
}

// ==================== Type Export ====================

export type { JWTPayload }