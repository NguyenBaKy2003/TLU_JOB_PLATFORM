// src/domain/repositories/ISettingRepository.ts

import type {
  UpdateNamePayload,
  RequestEmailChangePayload,
  ConfirmEmailChangeParams,
  ChangePasswordPayload,
  UpdateNotificationPayload,
} from "@/domain/models/Setting";

export interface ISettingRepository {
  /**
   * PATCH /api/v1/settings/name
   * Cập nhật họ và tên.
   */
  updateName(payload: UpdateNamePayload): Promise<void>;

  /**
   * POST /api/v1/settings/email/change-request
   * Gửi link xác nhận đổi email đến email mới (TTL 15 phút).
   */
  requestEmailChange(payload: RequestEmailChangePayload): Promise<void>;

  /**
   * POST /api/v1/settings/email/confirm?userId=...&token=...
   * Xác nhận đổi email bằng token từ link email.
   * Sau khi thành công, tất cả session bị revoke → cần đăng nhập lại.
   */
  confirmEmailChange(params: ConfirmEmailChangeParams): Promise<void>;

  /**
   * PATCH /api/v1/settings/password
   * Đổi mật khẩu khi đã đăng nhập.
   * Sau khi đổi, tất cả session khác bị revoke; session hiện tại giữ nguyên.
   */
  changePassword(payload: ChangePasswordPayload): Promise<void>;

  /**
   * PATCH /api/v1/settings/notifications
   * Cập nhật cài đặt thông báo.
   */
  updateNotificationPreferences(payload: UpdateNotificationPayload): Promise<void>;

  /**
   * DELETE /api/v1/settings/account
   * Soft-delete tài khoản. Data xóa hoàn toàn sau 30 ngày (GDPR).
   */
  deleteAccount(): Promise<void>;
}