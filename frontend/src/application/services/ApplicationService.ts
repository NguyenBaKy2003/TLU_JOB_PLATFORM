// src/application/services/ApplicationService.ts
import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import type {
  Application,
  ApplicationWithCandidate,
  ApplicationDetail,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  PageResponse,
  ApplicationStatus,
  MyApplicationsParams,
  MyApplicationsResponse,
  InterviewScheduleParams,
  InterviewScheduleItem,
} from "@/domain/models/Application";

export class ApplicationService {

  constructor(private readonly repo: IApplicationRepository) {}

  // ── Candidate ────

  async submit(req: SubmitApplicationRequest): Promise<Application> {
    if (!req.jobPostId) throw new Error("Thiếu thông tin bài đăng.");
    if (!req.cvUrl)     throw new Error("Vui lòng chọn file CV.");
    return this.repo.submit(req);
  }

  async withdraw(applicationId: string): Promise<Application> {
    return this.repo.withdraw(applicationId);
  }

  async getMyApplications(params: MyApplicationsParams = {}): Promise<MyApplicationsResponse> {
    return this.repo.getMyApplications(params);
  }

  async getById(applicationId: string): Promise<Application> {
    return this.repo.getById(applicationId);
  }

  async checkApplied(jobPostId: string): Promise<boolean> {
    return this.repo.checkApplied(jobPostId);
  }

  async acceptOffer(applicationId: string): Promise<Application> {
    return this.repo.acceptOffer(applicationId);
  }

  async declineOffer(applicationId: string, reason?: string): Promise<Application> {
    return this.repo.declineOffer(applicationId, reason);
  }

  /**
   * Candidate mở CV đã nộp trong tab mới.
   */
  async viewCVAsCandidate(applicationId: string): Promise<void> {
    const blobUrl = await this.repo.fetchCandidateCVBlobUrl(applicationId, "view");
    const tab = window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    if (!tab) {
      throw new Error("Trình duyệt chặn popup. Vui lòng cho phép popup cho trang này.");
    }
  }

  /**
   * Candidate tải CV đã nộp về máy.
   */
  async downloadCVAsCandidate(applicationId: string, fileName?: string): Promise<void> {
    const blobUrl = await this.repo.fetchCandidateCVBlobUrl(applicationId, "download");
    const a = document.createElement("a");
    a.href     = blobUrl;
    a.download = fileName ?? "cv-da-nop";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  }

  // ── Employer ─────

  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus | "ALL",
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    const statusParam = (!status || status === "ALL") ? undefined : status;
    return this.repo.getByJobPost(jobPostId, page, size, statusParam);
  }

  async getEmployerDetail(applicationId: string): Promise<ApplicationDetail> {
    return this.repo.getEmployerDetail(applicationId);
  }

  async getApplicationsByCompany(
    page = 0,
    size = 20,
    status?: ApplicationStatus | "ALL",
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    const statusParam = (!status || status === "ALL") ? undefined : status;
    return this.repo.getApplicationsByCompany(page, size, statusParam);
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

  /**
   * Employer mở CV của ứng viên trong tab mới.
   */
  async viewCVAsEmployer(applicationId: string, cvId?: string | null): Promise<void> {
    const blobUrl = await this.repo.fetchCVBlobUrl(applicationId, "view", cvId);
    const tab = window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    if (!tab) {
      throw new Error("Trình duyệt chặn popup. Vui lòng cho phép popup cho trang này.");
    }
  }

  /**
   * Employer tải CV của ứng viên về máy.
   */
  async downloadCVAsEmployer(
    applicationId: string,
    fileName?: string,
    cvId?: string | null,
  ): Promise<void> {
    const blobUrl = await this.repo.fetchCVBlobUrl(applicationId, "download", cvId);
    const a = document.createElement("a");
    a.href     = blobUrl;
    a.download = fileName ?? "cv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  }

  // ── Helpers ───────

  canWithdraw(app: Application): boolean {
    const terminal: ApplicationStatus[] = [
      "ACCEPTED", "REJECTED", "WITHDRAWN", "HIRED", "CANCELLED", "OFFERED",
    ];
    return !terminal.includes(app.status);
  }

  canScheduleInterview(app: Application): boolean {
    return app.status === "SHORTLISTED";
  }

  canAcceptOffer(app: Application): boolean {
    return app.status === "OFFERED";
  }

  canDeclineOffer(app: Application): boolean {
    return app.status === "OFFERED";
  }

  async getInterviewSchedule(
  params: InterviewScheduleParams = {},
): Promise<PageResponse<InterviewScheduleItem>> {
  return this.repo.getInterviewSchedule(params);
}
}