// src/domain/repositories/IAdminSetupRepository.ts
import type { AdminSetupPayload, AdminSetupResult } from '@/domain/models/AdminSetup';

export interface IAdminSetupRepository {
  setupAdmin(payload: AdminSetupPayload): Promise<AdminSetupResult>;
}