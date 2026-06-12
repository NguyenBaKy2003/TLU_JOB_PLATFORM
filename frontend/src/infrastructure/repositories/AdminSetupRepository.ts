// src/infrastructure/repositories/AdminSetupRepository.ts
import api                                         from '@/lib/axios';
import type { IAdminSetupRepository }              from '@/domain/repositories/IAdminSetupRepository';
import type { AdminSetupPayload, AdminSetupResult } from '@/domain/models/AdminSetup';

interface ApiResponse<T> {
  success:  boolean;
  data:     T;
  message?: string;
}

export class AdminSetupRepository implements IAdminSetupRepository {

  private readonly PATH = '/admin/setup';

  async setupAdmin(payload: AdminSetupPayload): Promise<AdminSetupResult> {
    try {
      const res = await api.post<ApiResponse<AdminSetupResult>>(
        this.PATH,
        {
          email:    payload.email.trim().toLowerCase(),
          fullName: payload.fullName.trim(),
          password: payload.password,
        },
        {
          headers: {
            'Setup-Secret': payload.secret.trim(),
          },
        },
      );
      return res.data.data;
    } catch (error: any) {
      const status  = error?.response?.status;
      const message = error?.response?.data?.message ?? 'Tạo tài khoản thất bại';
      throw Object.assign(
        new Error(message),
        { status, code: status === 403 ? 'INVALID_SECRET' : 'SETUP_FAILED' },
      );
    }
  }
}