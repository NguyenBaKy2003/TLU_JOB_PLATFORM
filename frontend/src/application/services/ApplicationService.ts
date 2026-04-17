// src/application/services/ApplicationService.ts
import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import type {
  Application,
  ApplicationWithJob,
  ApplicationWithCandidate,
  ApplicationDetail,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  PageResponse,
  ApplicationStatus,
} from "@/domain/models/Application";

export class ApplicationService {

  constructor(private readonly repo: IApplicationRepository) {}

  // ── Candidate ────────────────────────────────────────────────

  async submit(req: SubmitApplicationRequest): Promise<Application> {
    if (!req.jobPostId) throw new Error("Thiếu thông tin bài đăng.");
    if (!req.cvUrl)     throw new Error("Vui lòng chọn file CV.");
    return this.repo.submit(req);
  }

  async withdraw(applicationId: string): Promise<Application> {
    return this.repo.withdraw(applicationId);
  }

  async getMyApplications(page = 0, size = 10): Promise<PageResponse<ApplicationWithJob>> {
    return this.repo.getMyApplications(page, size);
  }

  async getById(applicationId: string): Promise<Application> {
    return this.repo.getById(applicationId);
  }

  async checkApplied(jobPostId: string): Promise<boolean> {
    return this.repo.checkApplied(jobPostId);
  }

  // ── Employer ─────────────────────────────────────────────────

  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus | "ALL",
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    const statusParam = (!status || status === "ALL") ? undefined : status;
    return this.repo.getByJobPost(jobPostId, page, size, statusParam);
  }

  /**
   * Gọi GET /employer/applications/{id}.
   * Response đã có candidate + aiScore + statusHistory — không cần /logs.
   */
  async getEmployerDetail(applicationId: string): Promise<ApplicationDetail> {
    return this.repo.getEmployerDetail(applicationId);
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
  ): Promise<Application> {
    return this.repo.updateStatus(applicationId, { status, note });
  }

  async scheduleInterview(
    applicationId: string,
    req: ScheduleInterviewRequest,
  ): Promise<Application> {
    if (!req.scheduledAt) throw new Error("Vui lòng chọn thời gian phỏng vấn.");
    if (!req.location)    throw new Error("Vui lòng nhập địa điểm phỏng vấn.");
    return this.repo.scheduleInterview(applicationId, req);
  }

  // ── Helpers ──────────────────────────────────────────────────

  canWithdraw(app: Application): boolean {
    const terminal: ApplicationStatus[] = [
      "ACCEPTED", "REJECTED", "WITHDRAWN", "HIRED", "CANCELLED",
    ];
    return !terminal.includes(app.status);
  }

  /** Theo backend TRANSITIONS: SHORTLISTED → INTERVIEW_SCHEDULED */
  canScheduleInterview(app: Application): boolean {
    return app.status === "SHORTLISTED";
  }


  async getApplicationsByCompany(
  page = 0,
  size = 20,
  status?: ApplicationStatus | "ALL",
): Promise<PageResponse<ApplicationWithCandidate>> {

  const statusParam = (!status || status === "ALL") ? undefined : status;
  return this.repo.getApplicationsByCompany(page, size, statusParam);
}


}