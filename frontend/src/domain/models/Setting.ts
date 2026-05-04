// src/domain/models/Setting.ts

/**
 * Cài đặt thông báo
 */
export interface NotificationPreferences {
  newJobs: boolean;
  applications: boolean;
  messages: boolean;
}

/**
 * Payload: PATCH /api/v1/settings/name
 */
export interface UpdateNamePayload {
  fullName: string;
}

/**
 * Payload: POST /api/v1/settings/email/change-request
 */
export interface RequestEmailChangePayload {
  newEmail: string;
}

/**
 * Payload: POST /api/v1/settings/email/confirm
 * (gửi qua query params, không phải body)
 */
export interface ConfirmEmailChangeParams {
  userId: string;
  token: string;
}

/**
 * Payload: PATCH /api/v1/settings/password
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Payload: PATCH /api/v1/settings/notifications
 */
export interface UpdateNotificationPayload {
  newJobs: boolean;
  applications: boolean;
  messages: boolean;
}