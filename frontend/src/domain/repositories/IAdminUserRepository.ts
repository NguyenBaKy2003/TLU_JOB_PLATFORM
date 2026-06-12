// src/domain/repositories/IAdminUserRepository.ts
import type {
  AdminUser, AdminUserFilters,
  AdminUserPage, AdminUserRole,
} from "@/domain/models/AdminUser";

export interface IAdminUserRepository {
  listUsers(filters: AdminUserFilters): Promise<AdminUserPage>;
  getUser(id: string): Promise<AdminUser>;
  createUser(data: AdminCreateUserPayload): Promise<AdminUser>; // ← thêm
  toggleActive(id: string): Promise<AdminUser>;
  changeRole(id: string, role: AdminUserRole): Promise<AdminUser>;
  exportExcel(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob>;
  exportPdf(filters: Omit<AdminUserFilters, "page" | "size">): Promise<Blob>;
}

export interface AdminCreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: AdminUserRole;
}