// src/application/services/AdminSetupService.ts
import type { IAdminSetupRepository }              from '@/domain/repositories/IAdminSetupRepository';
import type { AdminSetupPayload, AdminSetupResult } from '@/domain/models/AdminSetup';

export class AdminSetupService {
  constructor(private readonly repo: IAdminSetupRepository) {}

  /**
   * Tạo tài khoản Admin đầu tiên thông qua Setup Secret.
   * Throws nếu secret sai (403) hoặc email đã tồn tại (400).
   */
  setupAdmin(payload: AdminSetupPayload): Promise<AdminSetupResult> {
    return this.repo.setupAdmin(payload);
  }
}