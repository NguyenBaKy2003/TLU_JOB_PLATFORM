import type { IAdminJobRepository } from "@/domain/repositories/IAdminJobRepository";
import type {
  AdminJob,
  AdminJobFilters,
  AdminJobPage,
} from "@/domain/models/AdminJob";
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
export class AdminJobService {
  constructor(private readonly repo: IAdminJobRepository) {}

  listJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
    return this.repo.listJobs(filters);
  }

  forceClose(id: string, reason: string): Promise<AdminJob> {
    if (!reason?.trim()) throw new Error("Lý do đóng bài không được để trống");
    return this.repo.forceClose(id, reason.trim());
  }

  forceDelete(id: string, reason: string): Promise<void> {
    if (!reason?.trim()) throw new Error("Lý do xóa bài không được để trống");
    return this.repo.forceDelete(id, reason.trim());
  }
  searchJobs(filters: AdminJobFilters): Promise<AdminJobPage> {
  return this.repo.searchJobs(filters);
}

  async downloadExcel(filters: Omit<AdminJobFilters, "page" | "size">): Promise<void> {
    const blob = await this.repo.exportExcel(filters);
    triggerDownload(blob, `jobs_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  async downloadPdf(filters: Omit<AdminJobFilters, "page" | "size">): Promise<void> {
    const blob = await this.repo.exportPdf(filters);
    triggerDownload(blob, `jobs_${new Date().toISOString().slice(0,10)}.pdf`);
  }
}