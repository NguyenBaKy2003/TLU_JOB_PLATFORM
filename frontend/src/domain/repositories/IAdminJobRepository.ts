import type {
  AdminJob,
  AdminJobDetail,
  AdminJobFilters,
  AdminJobPage,
} from '@/domain/models/AdminJob';

export interface IAdminJobRepository {
  listJobs(filters: AdminJobFilters): Promise<AdminJobPage>;
  searchJobs(filters: AdminJobFilters): Promise<AdminJobPage>;
  getById(id: string): Promise<AdminJobDetail>;
  forceClose(id: string, reason: string): Promise<AdminJob>;
  forceDelete(id: string, reason: string): Promise<void>;
  exportExcel(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<Blob>;
  exportPdf(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<Blob>;
}