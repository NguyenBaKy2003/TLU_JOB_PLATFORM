import type { IAdminUserRepository } from "@/domain/repositories/IAdminUserRepository";
import type { AdminUser, AdminUserFilters, AdminUserPage, AdminUserRole } from "@/domain/models/AdminUser";

export class AdminUserService {
  constructor(private readonly repo: IAdminUserRepository) {}

  listUsers(filters: AdminUserFilters): Promise<AdminUserPage> {
    return this.repo.listUsers(filters);
  }

  getUser(id: string): Promise<AdminUser> {
    return this.repo.getUser(id);
  }

  toggleActive(id: string): Promise<AdminUser> {
    return this.repo.toggleActive(id);
  }

  changeRole(id: string, role: AdminUserRole): Promise<AdminUser> {
    if (!role) throw new Error("Role không hợp lệ");
    return this.repo.changeRole(id, role);
  }
}