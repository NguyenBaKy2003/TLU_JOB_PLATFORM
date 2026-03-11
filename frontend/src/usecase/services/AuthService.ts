import { IAuthRepository } from "@/domain/repositories/IAuthRepository"
import { User, UserCredentials, OAuthUserData, SignupData } from "@/domain/models/User"

export class AuthService {
  constructor(private authRepository: IAuthRepository) {}

  async getCurrentUser(): Promise<User | null> {
    return await this.authRepository.getCurrentUser()
  }

  async login(credentials: UserCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email và mật khẩu không được để trống")
    }

    return await this.authRepository.login(credentials)
  }

  async loginWithOAuth(data: OAuthUserData): Promise<User> {
    if (!data.email || !data.id) {
      throw new Error("Dữ liệu OAuth không hợp lệ")
    }

    return await this.authRepository.loginWithOAuth(data)
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authRepository.refreshToken()
  }

  async logout(): Promise<void> {
    return await this.authRepository.logout()
  }

  async signup(data: SignupData): Promise<User> {
    if (!data.email.includes("@")) {
      throw new Error("Email không hợp lệ")
    }
    
    if (data.password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự")
    }

    if (!data.fullName || data.fullName.trim().length === 0) {
      throw new Error("Họ và tên không được để trống")
    }

    return await this.authRepository.signup(data)
  }

  // ====================  RESET PASSWORD ====================
  
  async requestPasswordReset(email: string): Promise<void> {
    if (!email.includes("@")) {
      throw new Error("Email không hợp lệ")
    }
    
    return await this.authRepository.requestPasswordReset(email)
  }

  async verifyPasswordReset(
    email: string, 
    code: string, 
    newPassword: string
  ): Promise<void> {
    if (!email.includes("@")) {
      throw new Error("Email không hợp lệ")
    }
    
    if (!code || code.length !== 6) {
      throw new Error("Mã OTP phải có 6 chữ số")
    }
    
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự")
    }
    
    return await this.authRepository.verifyPasswordReset(email, code, newPassword)
  }

  // ====================  CHANGE PASSWORD ====================
  
  async requestPasswordChange(oldPassword: string, newPassword: string): Promise<void> {
    if (!oldPassword.trim()) {
      throw new Error("Vui lòng nhập mật khẩu cũ")
    }
    
    if (!newPassword.trim()) {
      throw new Error("Vui lòng nhập mật khẩu mới")
    }
    
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự")
    }
    
    if (newPassword === oldPassword) {
      throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ")
    }
    
    return await this.authRepository.requestPasswordChange(oldPassword, newPassword)
  }

  async verifyPasswordChange(code: string, newPassword: string): Promise<void> {
    if (!code || code.length !== 6) {
      throw new Error("Mã OTP phải có 6 chữ số")
    }
    
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự")
    }
    
    return await this.authRepository.verifyPasswordChange(code, newPassword)
  }

  // ====================  PROFILE UPDATE ====================
  
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (updates.email && !updates.email.includes("@")) {
      throw new Error("Email không hợp lệ")
    }

    return await this.authRepository.updateProfile(userId, updates)
  }
}