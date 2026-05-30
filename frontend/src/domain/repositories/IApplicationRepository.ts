import type {
  Application,
  ApplicationWithCandidate,
  ApplicationDetail,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  UpdateStatusRequest,
  PageResponse,
  ApplicationStatus,
  MyApplicationsParams,
  MyApplicationsResponse,
} from "@/domain/models/Application";

export interface IApplicationRepository {

  // ── Candidate ───

  submit(req: SubmitApplicationRequest): Promise<Application>;
  withdraw(applicationId: string): Promise<Application>;

  getMyApplications(params?: MyApplicationsParams): Promise<MyApplicationsResponse>;

  getById(applicationId: string): Promise<Application>;
  checkApplied(jobPostId: string): Promise<boolean>;
  acceptOffer(applicationId: string): Promise<Application>;
  declineOffer(applicationId: string, reason?: string): Promise<Application>;

  /** Candidate xem / tải CV đã nộp trong application của chính mình */
  fetchCandidateCVBlobUrl(
    applicationId: string,
    mode: "view" | "download",
  ): Promise<string>;

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

  /** Employer xem / tải CV ứng viên */
  fetchCVBlobUrl(
    applicationId: string,
    mode: "view" | "download",
    cvId?: string | null,
  ): Promise<string>;
}