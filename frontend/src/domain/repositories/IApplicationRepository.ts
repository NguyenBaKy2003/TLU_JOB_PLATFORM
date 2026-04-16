// src/domain/repositories/IApplicationRepository.ts
import type {
  Application,
  ApplicationWithJob,
  ApplicationWithCandidate,
  ApplicationDetail,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  UpdateStatusRequest,
  PageResponse,
  ApplicationStatus,
} from "@/domain/models/Application";

export interface IApplicationRepository {

  // ── Candidate ────────────────────────────────────────────────

  submit(req: SubmitApplicationRequest): Promise<Application>;
  withdraw(applicationId: string): Promise<Application>;
  getMyApplications(page?: number, size?: number): Promise<PageResponse<ApplicationWithJob>>;
  getById(applicationId: string): Promise<Application>;
  checkApplied(jobPostId: string): Promise<boolean>;

  // ── Employer ─────────────────────────────────────────────────

  getByJobPost(
    jobPostId: string,
    page?: number,
    size?: number,
    status?: ApplicationStatus,
  ): Promise<PageResponse<ApplicationWithCandidate>>;

  /**
   * GET /api/v1/employer/applications/{id}
   * Trả về ApplicationDetail — có candidate, aiScore, statusHistory.
   */
  getEmployerDetail(applicationId: string): Promise<ApplicationDetail>;


 getApplicationsByCompany(
  page?: number,
  size?: number,
  status?: ApplicationStatus
): Promise<PageResponse<ApplicationWithCandidate>>;

  updateStatus(applicationId: string, req: UpdateStatusRequest): Promise<Application>;
  scheduleInterview(applicationId: string, req: ScheduleInterviewRequest): Promise<Application>;
}