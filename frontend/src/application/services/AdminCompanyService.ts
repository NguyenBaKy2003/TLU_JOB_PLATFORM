import type { IAdminCompanyRepository } from "@/domain/repositories/IAdminCompanyRepository";
import type {
  AdminCompany,
  AdminCompanyFilters,
  AdminCompanyPage,
} from "@/domain/models/AdminCompany";

export class AdminCompanyService {
  constructor(private readonly repo: IAdminCompanyRepository) {}

  listCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    return this.repo.listCompanies(filters);
  }

  getCompany(id: string): Promise<AdminCompany> {
    return this.repo.getCompany(id);
  }

  approve(id: string): Promise<AdminCompany> {
    return this.repo.approve(id);
  }

  reject(id: string, reason: string): Promise<AdminCompany> {
    if (!reason?.trim()) throw new Error("Lý do từ chối không được để trống");
    return this.repo.reject(id, reason.trim());
  }

  suspend(id: string, reason: string): Promise<AdminCompany> {
    if (!reason?.trim()) throw new Error("Lý do khoá không được để trống");
    return this.repo.suspend(id, reason.trim());
  }

  unsuspend(id: string): Promise<AdminCompany> {
    return this.repo.unsuspend(id);
  }
}