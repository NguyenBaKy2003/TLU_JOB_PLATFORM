// src/infrastructure/repositories/AdminUserRepository.ts
import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminUserRepository } from "@/domain/repositories/IAdminUserRepository";
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

export class AdminUserRepository implements IAdminUserRepository {

  private readonly BASE = "/admin/users";

  async listUsers(filters: AdminUserFilters): Promise<AdminUserPage> {
    const res = await api.get<ApiResponse<AdminUserPage>>(this.BASE, adminConfig({
      page:    filters.page,
      size:    filters.size,
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.role    ? { role:    filters.role    } : {}),
    }));
    return res.data.data;
  }

  async getUser(id: string): Promise<AdminUser> {
    const res = await api.get<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}`, adminConfig(),
    );
    return res.data.data;
  }

  /** PATCH /api/v1/admin/users/{id}/toggle — toggle active/inactive */
  async toggleActive(id: string): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}/toggle`, null, adminConfig(),
    );
    return res.data.data;
  }

  /** PATCH /api/v1/admin/users/{id}/role?role=EMPLOYER */
  async changeRole(id: string, role: AdminUserRole): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(
      `${this.BASE}/${id}/role`, null,
      adminConfig({ role }),
    );
    return res.data.data;
  }
}