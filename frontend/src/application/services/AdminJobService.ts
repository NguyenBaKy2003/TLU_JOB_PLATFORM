import type { IAdminJobRepository } from '@/domain/repositories/IAdminJobRepository';
import type {
  AdminJob,
  AdminJobDetail,
  AdminJobFilters,
  AdminJobPage,
} from '@/domain/models/AdminJob';

export class AdminJobService {
  constructor(private readonly repo: IAdminJobRepository) {}

  searchJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
    return this.repo.searchJobs(filters);
  }

  listJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
    return this.repo.listJobs(filters);
  }

  getJobDetail(id: string): Promise<AdminJobDetail> {
    return this.repo.getById(id);
  }

  forceClose(id: string, reason: string): Promise<AdminJob> {
    return this.repo.forceClose(id, reason);
  }

  forceDelete(id: string, reason: string): Promise<void> {
    return this.repo.forceDelete(id, reason);
  }

  async downloadExcel(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<void> {
    const blob = await this.repo.exportExcel(filters);
    this._triggerDownload(blob, `jobs-${Date.now()}.xlsx`);
  }

  async downloadPdf(filters: Omit<AdminJobFilters, 'page' | 'size'>): Promise<void> {
    const blob = await this.repo.exportPdf(filters);
    this._triggerDownload(blob, `jobs-${Date.now()}.pdf`);
  }

  private _triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}