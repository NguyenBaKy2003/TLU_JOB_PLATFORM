import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  AdminApplicationPage,
  ApplicationStatus,
  ApplicationStatusLog,
} from "@/domain/models/AdminApplication";

export interface IAdminApplicationRepository {
  /** GET /api/v1/admin/applications?status=&page=&size= */
  listAll(filters: Omit<AdminApplicationFilters, "companyId" | "jobPostId">): Promise<AdminApplicationPage>;

  /** GET /api/v1/admin/applications/company/{companyId} */
  listByCompany(filters: AdminApplicationFilters): Promise<AdminApplicationPage>;

  /** GET /api/v1/admin/applications/job/{jobPostId} */
  listByJob(filters: AdminApplicationFilters): Promise<AdminApplicationPage>;

  /** GET /api/v1/admin/applications/{id} */
  getById(id: string): Promise<AdminApplicationDetail>;

  /** GET /api/v1/admin/applications/{id}/status-logs */
  getStatusLogs(id: string): Promise<ApplicationStatusLog[]>;

  /** PATCH /api/v1/admin/applications/{id}/override-status — SUPER_ADMIN only */
  overrideStatus(id: string, status: ApplicationStatus, reason: string): Promise<AdminApplication>;

  /** POST /api/v1/admin/applications/cancel-by-job/{jobPostId} — SUPER_ADMIN only */
  cancelByJob(jobPostId: string, reason: string): Promise<number>;
}