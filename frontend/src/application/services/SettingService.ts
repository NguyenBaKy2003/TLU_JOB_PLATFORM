// src/application/services/SettingService.ts

import type { ISettingRepository } from "@/domain/repositories/ISettingRepository";
import type {
  UpdateNamePayload,
  RequestEmailChangePayload,
  ConfirmEmailChangeParams,
  ChangePasswordPayload,
  UpdateNotificationPayload,
} from "@/domain/models/Setting";

/**
 * SettingService — application layer.
 *
 * Chứa validation logic và orchestration trước khi gọi repository.
 * Dùng chung cho cả 3 role: Candidate, Employer, Admin.
 */
export class SettingService {
  constructor(private readonly settingRepository: ISettingRepository) {}

  // ── Name ──────────

  /**
   * Cập nhật họ và tên.
   * Validation: fullName không rỗng, tối đa 100 ký tự.
   */
  async updateName(payload: UpdateNamePayload): Promise<void> {
    const name = payload.fullName.trim();
    if (!name) throw new Error("Họ và tên không được để trống.");
    if (name.length > 100) throw new Error("Họ và tên không được vượt quá 100 ký tự.");

    await this.settingRepository.updateName({ fullName: name });
  }

  // ── Email ─────────

  /**
   * Gửi yêu cầu đổi email — link xác nhận sẽ gửi đến email mới.
   * Validation: newEmail đúng định dạng.
   */
  async requestEmailChange(payload: RequestEmailChangePayload): Promise<void> {
    const email = payload.newEmail.trim().toLowerCase();
    if (!email) throw new Error("Email mới không được để trống.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email không đúng định dạng.");
    }

    await this.settingRepository.requestEmailChange({ newEmail: email });
  }

  /**
   * Xác nhận đổi email bằng token từ link email.
   * Sau khi thành công, tất cả session bị revoke → redirect về login.
   */
  async confirmEmailChange(params: ConfirmEmailChangeParams): Promise<void> {
    if (!params.userId || !params.token) {
      throw new Error("Thiếu thông tin xác nhận.");
    }
    await this.settingRepository.confirmEmailChange(params);
  }

  // ── Password ──────

  /**
   * Đổi mật khẩu khi đã đăng nhập.
   *
   * Validation:
   * - currentPassword không rỗng
   * - newPassword ≥ 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số
   * - confirmPassword khớp newPassword
   *
   * Backend sẽ revoke tất cả session khác; session hiện tại giữ nguyên.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    if (!payload.currentPassword) {
      throw new Error("Mật khẩu hiện tại không được để trống.");
    }
    if (!payload.newPassword || payload.newPassword.length < 8) {
      throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(payload.newPassword)) {
      throw new Error("Mật khẩu mới phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số.");
    }
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("Mật khẩu xác nhận không khớp.");
    }

    await this.settingRepository.changePassword(payload);
  }

  // ── Notifications ─

  /**
   * Cập nhật cài đặt thông báo.
   */
  async updateNotificationPreferences(payload: UpdateNotificationPayload): Promise<void> {
    await this.settingRepository.updateNotificationPreferences(payload);
  }

  // ── Account ───────

  /**
   * Xóa tài khoản (soft delete).
   * Data xóa hoàn toàn sau 30 ngày — hành động không thể hoàn tác.
   * Sau khi xóa, tất cả session bị revoke ngay lập tức.
   */
  async deleteAccount(): Promise<void> {
    await this.settingRepository.deleteAccount();
  }
}