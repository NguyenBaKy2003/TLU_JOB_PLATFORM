// src/domain/repositories/IAdminUserRepository.ts
import type {
  AdminUser, AdminUserFilters,
  AdminUserPage, AdminUserRole,
} from "@/domain/models/AdminUser";

export interface IAdminUserRepository {
  listUsers(filters: AdminUserFilters): Promise<AdminUserPage>;
  getUser(id: string): Promise<AdminUser>;
  toggleActive(id: string): Promise<AdminUser>;
  changeRole(id: string, role: AdminUserRole): Promise<AdminUser>;
  exportExcel(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob>;
  exportPdf(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob>;
}