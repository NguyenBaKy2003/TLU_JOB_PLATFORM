// src/infrastructure/repositories/AdminUserRepository.ts
import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { AdminCreateUserPayload, IAdminUserRepository } from "@/domain/repositories/IAdminUserRepository";
import type {
  AdminUser, AdminUserFilters,
  AdminUserPage, AdminUserRole,
} from "@/domain/models/AdminUser";

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

export class AdminUserRepository implements IAdminUserRepository {

  private readonly BASE = "/admin/users";

  async listUsers(filters: AdminUserFilters): Promise<AdminUserPage> {
    const params: Record<string, unknown> = {
      page: filters.page,
      size: filters.size,
    };
    if (filters.keyword && filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.role)                               params.role    = filters.role;
    if (filters.active !== "" && filters.active !== undefined)
                                                    params.active  = filters.active;

    const res = await api.get<ApiResponse<AdminUserPage>>(this.BASE, adminConfig(params));
    return res.data.data;
  }

  async getUser(id: string): Promise<AdminUser> {
    const res = await api.get<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}`, adminConfig(),
    );
    return res.data.data;
  }

  async toggleActive(id: string): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}/toggle`, null, adminConfig(),
    );
    return res.data.data;
  }

  async changeRole(id: string, role: AdminUserRole): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}/role`, null,
      adminConfig({ role }),
    );
    return res.data.data;
  }

  /**
   * Xuất Excel (.xlsx) — trả về Blob để trigger download phía client.
   * Backend cần cung cấp GET /admin/users/export/excel?keyword=...
   */
  async exportExcel(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob> {
    const params: Record<string, unknown> = {};
    if (filters.keyword && filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.role)                               params.role    = filters.role;
    if (filters.active !== "" && filters.active !== undefined)
                                                    params.active  = filters.active;

    const res = await api.get<Blob>(
      `${this.BASE}/export/excel`,
      adminBlobConfig(params),
    );
    return res.data;
  }

  /**
   * Xuất PDF — trả về Blob.
   * Backend cần cung cấp GET /admin/users/export/pdf?keyword=...
   */
  async exportPdf(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob> {
    const params: Record<string, unknown> = {};
    if (filters.keyword && filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.role)                               params.role    = filters.role;
    if (filters.active !== "" && filters.active !== undefined)
                                                    params.active  = filters.active;

    const res = await api.get<Blob>(
      `${this.BASE}/export/pdf`,
      adminBlobConfig(params),
    );
    return res.data;
  }

  async createUser(data: AdminCreateUserPayload): Promise<AdminUser> {
  const res = await api.post<ApiResponse<AdminUser>>(
    this.BASE,
    data,
    adminConfig(),
  );
  return res.data.data;
}
}