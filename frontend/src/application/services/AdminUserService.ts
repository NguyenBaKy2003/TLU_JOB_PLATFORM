// src/application/services/AdminUserService.ts
import type { AdminCreateUserPayload, IAdminUserRepository } from "@/domain/repositories/IAdminUserRepository";
import type {
  AdminUser, AdminUserFilters,
  AdminUserPage, AdminUserRole,
} from "@/domain/models/AdminUser";

/** Trigger browser download từ một Blob */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
    return this.repo.changeRole(id, role);
  }

  async downloadExcel(filters: Omit<AdminUserFilters, "page" | "size">): Promise<void> {
    const blob = await this.repo.exportExcel(filters);
    const now  = new Date().toISOString().slice(0, 10);
    triggerDownload(blob, `users_${now}.xlsx`);
  }

  async downloadPdf(filters: Omit<AdminUserFilters, "page" | "size">): Promise<void> {
    const blob = await this.repo.exportPdf(filters);
    const now  = new Date().toISOString().slice(0, 10);
    triggerDownload(blob, `users_${now}.pdf`);
  }

  createUser(data: AdminCreateUserPayload): Promise<AdminUser> {
    return this.repo.createUser(data);
  }
}