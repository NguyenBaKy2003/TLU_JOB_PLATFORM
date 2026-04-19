import type {
  AdminJob,
  AdminJobFilters,
  AdminJobPage,
} from "@/domain/models/AdminJob";

export interface IAdminJobRepository {
  /** GET /api/v1/admin/jobs?status=&page=&size= */
  listJobs(filters: AdminJobFilters): Promise<AdminJobPage>;

  /** POST /api/v1/admin/jobs/{id}/close?reason= */
  forceClose(id: string, reason: string): Promise<AdminJob>;

  /** DELETE /api/v1/admin/jobs/{id}?reason= */
  forceDelete(id: string, reason: string): Promise<void>;
}