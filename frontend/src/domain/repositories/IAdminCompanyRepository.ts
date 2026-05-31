import type {
  AdminCompany, AdminCompanyFilters, AdminCompanyPage,
} from "@/domain/models/AdminCompany";

export interface IAdminCompanyRepository {
  listCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage>;
  searchCompanies(filters: AdminCompanyFilters): Promise<AdminCompanyPage>;
  getCompany(id: string): Promise<AdminCompany>;
  approve(id: string): Promise<AdminCompany>;
  reject(id: string, reason: string): Promise<AdminCompany>;
  suspend(id: string, reason: string): Promise<AdminCompany>;
  unsuspend(id: string): Promise<AdminCompany>;
  exportExcel(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<Blob>;
  exportPdf(filters: Omit<AdminCompanyFilters, "page" | "pageSize">): Promise<Blob>;
}