import type { IAdminApplicationRepository } from '@/domain/repositories/IAdminApplicationRepository';
import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  AdminApplicationPage,
  ApplicationStatus,
  ApplicationStatusLog,
} from '@/domain/models/AdminApplication';
import { triggerBlobDownload } from '@/lib/download';

export class AdminApplicationService {
  constructor(private readonly repo: IAdminApplicationRepository) {}

  listAll(
    filters: Omit<AdminApplicationFilters, 'companyId' | 'jobPostId'>,
  ): Promise<AdminApplicationPage> {
    return this.repo.listAll(filters);
  }

  listByCompany(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    if (!filters.companyId) throw new Error('companyId là bắt buộc');
    return this.repo.listByCompany(filters);
  }

  listByJob(filters: AdminApplicationFilters): Promise<AdminApplicationPage> {
    if (!filters.jobPostId) throw new Error('jobPostId là bắt buộc');
    return this.repo.listByJob(filters);
  }

  getById(id: string): Promise<AdminApplicationDetail> {
    return this.repo.getById(id);
  }

  getStatusLogs(id: string): Promise<ApplicationStatusLog[]> {
    return this.repo.getStatusLogs(id);
  }

  overrideStatus(
    id:     string,
    status: ApplicationStatus,
    reason: string,
  ): Promise<AdminApplication> {
    if (!reason?.trim()) throw new Error('Lý do override không được để trống');
    return this.repo.overrideStatus(id, status, reason.trim());
  }

  cancelByJob(jobPostId: string, reason: string): Promise<number> {
    if (!reason?.trim()) throw new Error('Lý do cancel không được để trống');
    return this.repo.cancelByJob(jobPostId, reason.trim());
  }

  async downloadExcel(
    status?: ApplicationStatus | '',
    keyword?: string,
  ): Promise<void> {
    const blob = await this.repo.exportExcel(status, keyword);
    triggerBlobDownload(blob, `applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async downloadPdf(
    status?: ApplicationStatus | '',
    keyword?: string,
  ): Promise<void> {
    const blob = await this.repo.exportPdf(status, keyword);
    triggerBlobDownload(blob, `applications_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}