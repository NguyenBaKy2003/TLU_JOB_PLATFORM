import type { IAdminJobRepository } from "@/domain/repositories/IAdminJobRepository";
import type {
  AdminJob,
  AdminJobFilters,
  AdminJobPage,
} from "@/domain/models/AdminJob";

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
}