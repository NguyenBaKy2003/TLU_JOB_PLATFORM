import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminApplicationRepository } from "@/domain/repositories/IAdminApplicationRepository";
import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  AdminApplicationPage,
  ApplicationStatus,
  ApplicationStatusLog,
} from "@/domain/models/AdminApplication";

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

export class AdminApplicationRepository implements IAdminApplicationRepository {
  private readonly BASE = "/admin/applications";

  /** GET /api/v1/admin/applications */
  async listAll(
    filters: Omit<AdminApplicationFilters, "companyId" | "jobPostId">,
  ): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      this.BASE,
      adminConfig({
        page: filters.page,
        size: filters.size,
        ...(filters.status ? { status: filters.status } : {}),
      }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/company/{companyId} */
  async listByCompany(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      `${this.BASE}/company/${filters.companyId}`,
      adminConfig({
        page: filters.page,
        size: filters.size,
      }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/applications/job/{jobPostId}?status=&page=&size= */
  async listByJob(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    const res = await api.get<ApiResponse<AdminApplicationPage>>(
      `${this.BASE}/job/${filters.jobPostId}`,
      adminConfig({
        page:   filters.page,
        size:   filters.size,
        ...(filters.status ? { status: filters.status } : {}),
      }),
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
    const res = await api.patch<ApiResponse<AdminApplication>>(
      `${this.BASE}/${id}/override-status`,
      { status, reason },
      adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/applications/cancel-by-job/{jobPostId}?reason= */
  async cancelByJob(jobPostId: string, reason: string): Promise<number> {
    const res = await api.post<ApiResponse<string>>(
      `${this.BASE}/cancel-by-job/${jobPostId}`,
      null,
      adminConfig({ reason }),
    );
    // Backend trả "N đơn đã được cancel." — parse số
    const match = res.data.data.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}