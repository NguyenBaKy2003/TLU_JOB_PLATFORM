import type { IAdminCompanyRepository } from "@/domain/repositories/IAdminCompanyRepository";
import type {
  AdminCompany, AdminCompanyFilters, AdminCompanyPage,
} from "@/domain/models/AdminCompany";

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

export class AdminCompanyService {
  constructor(private readonly repo: IAdminCompanyRepository) {}

  listCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    return this.repo.listCompanies(filters);
  }

  searchCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage> {
    return this.repo.searchCompanies(filters);
  }

  getCompany(id: string): Promise<AdminCompany> {
    return this.repo.getCompany(id);
  }

  approve(id: string): Promise<AdminCompany>        { return this.repo.approve(id); }
  reject(id: string, reason: string): Promise<AdminCompany> {
    if (!reason?.trim()) throw new Error("Lý do từ chối không được để trống");
    return this.repo.reject(id, reason.trim());
  }
  suspend(id: string, reason: string): Promise<AdminCompany> {
    if (!reason?.trim()) throw new Error("Lý do khoá không được để trống");
    return this.repo.suspend(id, reason.trim());
  }
  unsuspend(id: string): Promise<AdminCompany>      { return this.repo.unsuspend(id); }

  async downloadExcel(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<void> {
    const blob = await this.repo.exportExcel(filters);
    const now  = new Date().toISOString().slice(0, 10);
    triggerDownload(blob, `companies_${now}.xlsx`);
  }

  async downloadPdf(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<void> {
    const blob = await this.repo.exportPdf(filters);
    const now  = new Date().toISOString().slice(0, 10);
    triggerDownload(blob, `companies_${now}.pdf`);
  }
}