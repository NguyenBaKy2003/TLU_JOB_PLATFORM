// src/infrastructure/repositories/SettingRepository.ts

import api from "@/lib/axios";
import type { ISettingRepository } from "@/domain/repositories/ISettingRepository";
import type {
  UpdateNamePayload,
  RequestEmailChangePayload,
  ConfirmEmailChangeParams,
  ChangePasswordPayload,
  UpdateNotificationPayload,
} from "@/domain/models/Setting";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class SettingRepository implements ISettingRepository {
  private readonly BASE = "/settings";

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async patch(url: string, body?: unknown): Promise<void> {
    await api.patch<ApiResponse<void>>(url, body);
  }

  private async post(
    url: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<void> {
    await api.post<ApiResponse<void>>(url, body ?? null, params ? { params } : undefined);
  }

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── Public ────────────────────────────────────────────────────────────────

  /** PATCH /api/v1/settings/name */
  async updateName(payload: UpdateNamePayload): Promise<void> {
    await this.patch(`${this.BASE}/name`, payload);
  }

  /** POST /api/v1/settings/email/change-request */
  async requestEmailChange(payload: RequestEmailChangePayload): Promise<void> {
    await this.post(`${this.BASE}/email/change-request`, payload);
  }

  /**
   * POST /api/v1/settings/email/confirm?userId=...&token=...
   * Backend đọc userId & token từ query params (không phải body).
   */
  async confirmEmailChange(params: ConfirmEmailChangeParams): Promise<void> {
    await this.post(`${this.BASE}/email/confirm`, undefined, {
      userId: params.userId,
      token: params.token,
    });
  }

  /** PATCH /api/v1/settings/password */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.patch(`${this.BASE}/password`, payload);
  }

  /** PATCH /api/v1/settings/notifications */
  async updateNotificationPreferences(payload: UpdateNotificationPayload): Promise<void> {
    await this.patch(`${this.BASE}/notifications`, payload);
  }

  /** DELETE /api/v1/settings/account */
  async deleteAccount(): Promise<void> {
    await this.del(`${this.BASE}/account`);
  }
}