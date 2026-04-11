import type {
  Application,
  ApplicationWithJob,
  ApplicationWithCandidate,
  ApplicationStatusLog,
  SubmitApplicationRequest,
  ScheduleInterviewRequest,
  UpdateStatusRequest,
  PageResponse,
} from "@/domain/models/Application";

export interface IApplicationRepository {

  // ── Candidate ────────────────────────────────────────────────

  /** Nộp đơn ứng tuyển */
  submit(req: SubmitApplicationRequest): Promise<Application>;

  /** Rút đơn */
  withdraw(applicationId: string): Promise<Application>;

  /** Danh sách đơn của ứng viên hiện tại */
  getMyApplications(page?: number, size?: number): Promise<PageResponse<ApplicationWithJob>>;

  /** Chi tiết đơn theo id */
  getById(applicationId: string): Promise<Application>;

  /** Kiểm tra đã ứng tuyển vào job chưa */
  checkApplied(jobPostId: string): Promise<boolean>;

  // ── Employer ─────────────────────────────────────────────────

  /** Danh sách đơn theo bài đăng */
  getByJobPost(
    jobPostId: string,
    page?: number,
    size?: number,
  ): Promise<PageResponse<ApplicationWithCandidate>>;

  /** Cập nhật trạng thái đơn */
  updateStatus(applicationId: string, req: UpdateStatusRequest): Promise<Application>;

  /** Lên lịch phỏng vấn */
  scheduleInterview(applicationId: string, req: ScheduleInterviewRequest): Promise<Application>;

  // ── Shared ───────────────────────────────────────────────────

  /** Lịch sử thay đổi trạng thái */
  getStatusLogs(applicationId: string): Promise<ApplicationStatusLog[]>;
}