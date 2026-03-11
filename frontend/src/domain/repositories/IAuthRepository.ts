import { OAuthUserData, SignupData, User, UserCredentials } from "../models/User"

export interface IAuthRepository {
  signup(data: SignupData): Promise<User>
  login(credentials: UserCredentials): Promise<User>
  loginWithOAuth(data: OAuthUserData): Promise<User>
  refreshToken(): Promise<{ accessToken: string; refreshToken: string }>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  updateProfile(userId: string, updates: Partial<User>): Promise<User>
  getGoogleOAuthUrl(redirectUri: string): string
  getFacebookOAuthUrl(redirectUri: string): string
  requestPasswordReset(email: string): Promise<void>
  verifyPasswordReset(email: string, code: string, newPassword: string): Promise<void>
  requestPasswordChange(oldPassword: string, newPassword: string): Promise<void>
  verifyPasswordChange(code: string, newPassword: string): Promise<void>
}