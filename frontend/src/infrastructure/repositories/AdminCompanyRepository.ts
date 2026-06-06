import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminCompanyRepository } from "@/domain/repositories/IAdminCompanyRepository";
import type {
  AdminCompany, AdminCompanyFilters, AdminCompanyPage,
} from "@/domain/models/AdminCompany";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

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
    responseType: "blob" as const,
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function buildSearchParams(filters: Omit<AdminCompanyFilters, "page" | "pageSize">) {
  const p: Record<string, unknown> = {};
  if (filters.status)                                    p.status    = filters.status;
  if (filters.keyword?.trim())                           p.keyword   = filters.keyword.trim();
  if (filters.city?.trim())                              p.city      = filters.city.trim();
  if (filters.size?.trim())                              p.size      = filters.size.trim();
  if (filters.planCode?.trim())                          p.planCode  = filters.planCode.trim();
  if (filters.minRating !== "" && filters.minRating != null)
                                                         p.minRating = filters.minRating;
  return p;
}

export class AdminCompanyRepository implements IAdminCompanyRepository {

  private readonly BASE = "/admin/companies";

  async listCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    const res = await api.get<ApiResponse<AdminCompanyPage>>(this.BASE, adminConfig({
      page: filters.page,
      size: filters.pageSize,
      ...(filters.status ? { status: filters.status } : {}),
    }));
    return res.data.data;
  }

  async searchCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    const res = await api.get<ApiResponse<AdminCompanyPage>>(
      `${this.BASE}/search`,
      adminConfig({
        page: filters.page,
        size: filters.pageSize,
        ...buildSearchParams(filters),
      }),
    );
    return res.data.data;
  }

  async getCompany(id: string): Promise<AdminCompany> {
    const res = await api.get<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}`, adminConfig(),
    );
    return res.data.data;
  }

  async approve(id: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/approve`, null, adminConfig(),
    );
    return res.data.data;
  }

  async reject(id: string, reason: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/reject`, { reason }, adminConfig(),
    );
    return res.data.data;
  }

  async suspend(id: string, reason: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/suspend`, { reason }, adminConfig(),
    );
    return res.data.data;
  }

  async unsuspend(id: string): Promise<AdminCompany> {
    const res = await api.post<ApiResponse<AdminCompany>>(
      `${this.BASE}/${id}/unsuspend`, null, adminConfig(),
    );
    return res.data.data;
  }

  async exportExcel(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<Blob> {
    const res = await api.get<Blob>(
      `${this.BASE}/export/excel`,
      adminBlobConfig(buildSearchParams(filters)),
    );
    return res.data;
  }

  async exportPdf(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<Blob> {
    const res = await api.get<Blob>(
      `${this.BASE}/export/pdf`,
      adminBlobConfig(buildSearchParams(filters)),
    );
    return res.data;
  }
}