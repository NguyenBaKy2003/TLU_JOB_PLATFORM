import type { AdminUser, AdminUserFilters, AdminUserPage } from "@/domain/models/AdminUser";
import type { AdminUserRole } from "@/domain/models/AdminUser";

export interface IAdminUserRepository {
  listUsers(filters: AdminUserFilters): Promise<AdminUserPage>;
  getUser(id: string): Promise<AdminUser>;
  toggleActive(id: string): Promise<AdminUser>;
  changeRole(id: string, role: AdminUserRole): Promise<AdminUser>;
}