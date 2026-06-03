import api from '@/lib/axios';
import { getAdminAccessToken } from '@/lib/auth-helpers';
import type { IAdminApplicationRepository } from '@/domain/repositories/IAdminApplicationRepository';
import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  AdminApplicationPage,
  ApplicationStatus,
  ApplicationStatusLog,
  OverrideStatusRequest,
} from '@/domain/models/AdminApplication';

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

function buildParams(
  filters: Omit<AdminApplicationFilters, 'companyId' | 'jobPostId'>,
): Record<string, unknown> {
  const p: Record<string, unknown> = {
    page: filters.page,
    size: filters.size,
  };
  if (filters.status?.trim())  p.status  = filters.status;
  if (filters.keyword?.trim()) p.keyword = filters.keyword.trim();
  return p;
}

export class AdminApplicationRepository implements IAdminApplicationRepository {
  private readonly BASE = '/admin/applications';

  /** GET /api/v1/admin/applications */
  async listAll(
    filters: Omit<AdminApplicationFilters, 'companyId' | 'jobPostId'>,
  ): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      this.BASE,
      adminConfig(buildParams(filters)),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/company/{companyId} */
  async listByCompany(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      `${this.BASE}/company/${filters.companyId}`,
      adminConfig(buildParams(filters)),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/job/{jobPostId} */
  async listByJob(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      `${this.BASE}/job/${filters.jobPostId}`,
      adminConfig(buildParams(filters)),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/{id} */
  async getById(id: string): Promise<AdminApplicationDetail> {
    const res = await api.get<ApiResponse<AdminApplicationDetail>>(
      `${this.BASE}/${id}`,
      adminConfig(),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/{id}/status-logs */
  async getStatusLogs(id: string): Promise<ApplicationStatusLog[]> {
    const res = await api.get<ApiResponse<ApplicationStatusLog[]>>(
      `${this.BASE}/${id}/status-logs`,
      adminConfig(),
    );
    return res.data.data;
  }

  /** PATCH /api/v1/admin/applications/{id}/override-status */
  async overrideStatus(
    id:     string,
    status: ApplicationStatus,
    reason: string,
  ): Promise<AdminApplication> {
    const body: OverrideStatusRequest = { status, reason };
    const res = await api.patch<ApiResponse<AdminApplication>>(
      `${this.BASE}/${id}/override-status`,
      body,
      adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/applications/cancel-by-job/{jobPostId} */
  async cancelByJob(jobPostId: string, reason: string): Promise<number> {
    const res = await api.post<ApiResponse<string>>(
      `${this.BASE}/cancel-by-job/${jobPostId}`,
      null,
      adminConfig({ reason }),
    );
    // response là "N đơn đã được cancel." — parse số đầu
    return parseInt(res.data.data) || 0;
  }

  /** GET /api/v1/admin/applications/export/excel */
  async exportExcel(status?: ApplicationStatus | '', keyword?: string): Promise<Blob> {
    const params: Record<string, unknown> = {};
    if (status?.trim())  params.status  = status;
    if (keyword?.trim()) params.keyword = keyword.trim();
    const res = await api.get<Blob>(
      `${this.BASE}/export/excel`,
      adminBlobConfig(params),
    );
    return res.data;
  }

  /** GET /api/v1/admin/applications/export/pdf */
  async exportPdf(status?: ApplicationStatus | '', keyword?: string): Promise<Blob> {
    const params: Record<string, unknown> = {};
    if (status?.trim())  params.status  = status;
    if (keyword?.trim()) params.keyword = keyword.trim();
    const res = await api.get<Blob>(
      `${this.BASE}/export/pdf`,
      adminBlobConfig(params),
    );
    return res.data;
  }
}