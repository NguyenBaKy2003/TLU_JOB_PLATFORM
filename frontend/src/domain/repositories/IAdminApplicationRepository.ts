import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  AdminApplicationPage,
  ApplicationStatus,
  ApplicationStatusLog,
} from '@/domain/models/AdminApplication';

export interface IAdminApplicationRepository {
  listAll(filters: Omit<AdminApplicationFilters, 'companyId' | 'jobPostId'>): Promise<AdminApplicationPage>;
  listByCompany(filters: AdminApplicationFilters): Promise<AdminApplicationPage>;
  listByJob(filters: AdminApplicationFilters): Promise<AdminApplicationPage>;
  getById(id: string): Promise<AdminApplicationDetail>;
  getStatusLogs(id: string): Promise<ApplicationStatusLog[]>;
  overrideStatus(id: string, status: ApplicationStatus, reason: string): Promise<AdminApplication>;
  cancelByJob(jobPostId: string, reason: string): Promise<number>;
  exportExcel(status?: ApplicationStatus | '', keyword?: string): Promise<Blob>;
  exportPdf(status?: ApplicationStatus | '', keyword?: string): Promise<Blob>;
}