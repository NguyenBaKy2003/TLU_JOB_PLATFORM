import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminJobRepository } from "@/domain/repositories/IAdminJobRepository";
import type {
  AdminJob,
  AdminJobFilters,
  AdminJobPage,
} from "@/domain/models/AdminJob";

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

export class AdminJobRepository implements IAdminJobRepository {
  private readonly BASE = "/admin/jobs";

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

  /** POST /api/v1/admin/jobs/{id}/close */
  async forceClose(id: string, reason: string): Promise<AdminJob> {
    const res = await api.post<ApiResponse<AdminJob>>(
      `${this.BASE}/${id}/close`,
      null,
      adminConfig({ reason }),
    );
    return res.data.data;
  }

  /** DELETE /api/v1/admin/jobs/{id} */
  async forceDelete(id: string, reason: string): Promise<void> {
    await api.delete(
      `${this.BASE}/${id}`,
      adminConfig({ reason }),
    );
  }
}