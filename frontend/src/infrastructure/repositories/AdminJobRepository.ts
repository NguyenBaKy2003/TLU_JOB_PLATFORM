import api from '@/lib/axios';
import { getAdminAccessToken } from '@/lib/auth-helpers';
import type { IAdminJobRepository } from '@/domain/repositories/IAdminJobRepository';
import type {
  AdminJob,
  AdminJobDetail,
  AdminJobFilters,
  AdminJobPage,
} from '@/domain/models/AdminJob';

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function adminBlobConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    responseType: 'blob' as const,
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function buildSearchParams(filters: Omit<AdminJobFilters, 'page' | 'size'>) {
  const p: Record<string, unknown> = {};
  if (filters.status)           p.status   = filters.status;
  if (filters.keyword?.trim())  p.keyword  = filters.keyword.trim();
  if (filters.city?.trim())     p.city     = filters.city.trim();
  if (filters.category?.trim()) p.category = filters.category.trim();
  return p;
}

export class AdminJobRepository implements IAdminJobRepository {
  private readonly BASE = '/admin/jobs';

  /** GET /api/v1/admin/jobs */
  async listJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
    const res = await api.get<ApiResponse<AdminJobPage>>(
      this.BASE,
      adminConfig({
        page: filters.page,
        size: filters.size,
        ...(filters.status ? { status: filters.status } : {}),
      }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/jobs/search */
  async searchJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
    const res = await api.get<ApiResponse<AdminJobPage>>(
      `${this.BASE}/search`,
      adminConfig({
        page: filters.page,
        size: filters.size,
        ...buildSearchParams(filters),
      }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/jobs/{id} */
  async getById(id: string): Promise<AdminJobDetail> {
    const res = await api.get<ApiResponse<AdminJobDetail>>(
      `${this.BASE}/${id}`,
      adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/jobs/{id}/close */
  async forceClose(id: string, reason: string): Promise<AdminJob> {
    const res = await api.post<ApiResponse<AdminJob>>(
      `${this.BASE}/${id}/close`,
      null,
      adminConfig({ reason }),
    );
    return res.data.data;
  }

  /** DELETE /api/v1/admin/jobs/{id}/delete */
  async forceDelete(id: string, reason: string): Promise<void> {
    const token = getAdminAccessToken();
    await api.delete(`${this.BASE}/${id}/delete`, {
      params:  { reason },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  /** GET /api/v1/admin/jobs/export/excel */
  async exportExcel(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<Blob> {
    const res = await api.get<Blob>(
      `${this.BASE}/export/excel`,
      adminBlobConfig(buildSearchParams(filters)),
    );
    return res.data;
  }

  /** GET /api/v1/admin/jobs/export/pdf */
  async exportPdf(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<Blob> {
    const res = await api.get<Blob>(
      `${this.BASE}/export/pdf`,
      adminBlobConfig(buildSearchParams(filters)),
    );
    return res.data;
  }
}