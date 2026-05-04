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

  // ── Candidate ───

  submit(req: SubmitApplicationRequest): Promise<Application>;
  withdraw(applicationId: string): Promise<Application>;
  getMyApplications(page?: number, size?: number): Promise<PageResponse<ApplicationWithJob>>;
  getById(applicationId: string): Promise<Application>;
  checkApplied(jobPostId: string): Promise<boolean>;
  acceptOffer(applicationId: string): Promise<Application>;
  declineOffer(applicationId: string, reason?: string): Promise<Application>;

  // ── Employer ────

  getByJobPost(
    jobPostId: string,
    page?: number,
    size?: number,
    status?: ApplicationStatus,
  ): Promise<PageResponse<ApplicationWithCandidate>>;

  getEmployerDetail(applicationId: string): Promise<ApplicationDetail>;

  getApplicationsByCompany(
    page?: number,
    size?: number,
    status?: ApplicationStatus,
  ): Promise<PageResponse<ApplicationWithCandidate>>;

  updateStatus(applicationId: string, req: UpdateStatusRequest): Promise<Application>;
  scheduleInterview(applicationId: string, req: ScheduleInterviewRequest): Promise<Application>;

  /**
   * Lấy blob URL để xem hoặc tải CV của ứng viên.
   *
   * @param applicationId  ID của application
   * @param mode           "view" (inline) | "download" (attachment)
   * @param cvId           Nếu có → xem CV cụ thể, nếu null → xem CV từ application (cvUrl)
   */
  fetchCVBlobUrl(
    applicationId: string,
    mode: "view" | "download",
    cvId?: string | null,
  ): Promise<string>;
}