import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import type {
  Application,
  ApplicationWithJob,
  ApplicationWithCandidate,
  ApplicationStatusLog,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  UpdateStatusRequest,
  PageResponse,
  ApplicationStatus,
} from "@/domain/models/Application";

export class ApplicationService {

  constructor(private readonly repo: IApplicationRepository) {}

  // ── Candidate ────────────────────────────────────────────────

  /** Nộp đơn ứng tuyển */
  async submit(req: SubmitApplicationRequest): Promise<Application> {
    if (!req.jobPostId) throw new Error("Thiếu thông tin bài đăng.");
    if (!req.cvUrl)     throw new Error("Vui lòng chọn file CV.");
    return this.repo.submit(req);
  }

  /** Rút đơn */
  async withdraw(applicationId: string): Promise<Application> {
    return this.repo.withdraw(applicationId);
  }

  /** Danh sách đơn của ứng viên */
  async getMyApplications(
    page = 0,
    size = 10,
  ): Promise<PageResponse<ApplicationWithJob>> {
    return this.repo.getMyApplications(page, size);
  }

  /** Chi tiết đơn */
  async getById(applicationId: string): Promise<Application> {
    return this.repo.getById(applicationId);
  }

  /** Kiểm tra đã ứng tuyển vào job chưa */
    async checkApplied(jobPostId: string): Promise<boolean> {
    return this.repo.checkApplied(jobPostId);
    }
  // ── Employer ─────────────────────────────────────────────────

  /** Danh sách đơn theo bài đăng */
  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    return this.repo.getByJobPost(jobPostId, page, size);
  }

  /** Cập nhật trạng thái */
  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
  ): Promise<Application> {
    const req: UpdateStatusRequest = { status, note };
    return this.repo.updateStatus(applicationId, req);
  }

  /** Lên lịch phỏng vấn — tự động set status INTERVIEW_SCHEDULED */
  async scheduleInterview(
    applicationId: string,
    req: ScheduleInterviewRequest,
  ): Promise<Application> {
    if (!req.scheduledAt) throw new Error("Vui lòng chọn thời gian phỏng vấn.");
    if (!req.location)    throw new Error("Vui lòng nhập địa điểm phỏng vấn.");
    return this.repo.scheduleInterview(applicationId, req);
  }

  // ── Shared ───────────────────────────────────────────────────

  /** Lịch sử trạng thái */
  async getStatusLogs(applicationId: string): Promise<ApplicationStatusLog[]> {
    return this.repo.getStatusLogs(applicationId);
  }

  // ── Helpers ───────────────────────────────────────────────────

  /** Ứng viên còn có thể rút đơn không */
  canWithdraw(app: Application): boolean {
    const terminal: ApplicationStatus[] = ["ACCEPTED", "REJECTED", "WITHDRAWN"];
    return !terminal.includes(app.status);
  }

  /** Employer có thể lên lịch phỏng vấn không */
  canScheduleInterview(app: Application): boolean {
    return app.status === "REVIEWING" || app.status === "PENDING";
  }
}