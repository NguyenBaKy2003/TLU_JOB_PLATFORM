import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminCompanyRepository } from "@/domain/repositories/IAdminCompanyRepository";
import type {
  AdminCompany,
  AdminCompanyFilters,
  AdminCompanyPage,
} from "@/domain/models/AdminCompany";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export class AdminCompanyRepository implements IAdminCompanyRepository {

  private readonly BASE = "/admin/companies";

  async listCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    const res = await api.get<ApiResponse<AdminCompanyPage>>(this.BASE, adminConfig({
      page: filters.page,
      size: filters.size,
      ...(filters.status ? { status: filters.status } : {}),
    }));
    return res.data.data;
  }

  async getCompany(id: string): Promise<AdminCompany> {
    const res = await api.get<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}`, adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/companies/{id}/approve */
  async approve(id: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/approve`, null, adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/companies/{id}/reject */
  async reject(id: string, reason: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/reject`,
      { reason },
      adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/companies/{id}/suspend */
  async suspend(id: string, reason: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/suspend`,
      { reason },
      adminConfig(),
    );
    return res.data.data;
  }

  /** POST /api/v1/admin/companies/{id}/unsuspend */
  async unsuspend(id: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/unsuspend`, null, adminConfig(),
    );
    return res.data.data;
  }
}