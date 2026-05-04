// src/infrastructure/repositories/ApplicationRepository.ts
import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
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
import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string | null;
}

export class ApplicationRepository implements IApplicationRepository {

  private readonly BASE      = "/applications";
  private readonly EMPLOYER  = "/employer/applications";
  private readonly CANDIDATE = "/candidate/applications";
  private readonly JOBS     = "/jobs";
  // ─── Helpers ──────────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  // ─── Candidate ────────

async submit(req: SubmitApplicationRequest): Promise<Application> {
    const res = await api.post<{ data: Application }>(
      `${this.JOBS}/${req.jobPostId}/apply`,
      { cvUrl: req.cvUrl, coverLetter: req.coverLetter, expectedSalary: req.expectedSalary },
    );
    return res.data.data;
  }

  async withdraw(applicationId: string): Promise<Application> {
    return this.patch(`${this.BASE}/${applicationId}/withdraw`);
  }

  async getMyApplications(page = 0, size = 10): Promise<PageResponse<ApplicationWithJob>> {
    return this.get(`${this.CANDIDATE}/my`, { page, size });
  }

  async getById(applicationId: string): Promise<Application> {
    return this.get(`${this.BASE}/${applicationId}`);
  }
  async checkApplied(jobPostId: string): Promise<boolean> {
    try {
      const res = await api.get<{ data: boolean }>(`${this.JOBS}/${jobPostId}/my-application`);
      return res.data.data;
    } catch {
      return false;
    }
  }

  async acceptOffer(applicationId: string): Promise<Application> {
    return this.patch(`${this.BASE}/${applicationId}/accept-offer`);
  }

  async declineOffer(applicationId: string, reason?: string): Promise<Application> {
    return this.patch(`${this.BASE}/${applicationId}/decline-offer`, reason ? { reason } : undefined);
  }

  // ─── Employer ─────────

  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus,
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    return this.get(`/jobs/${jobPostId}/applications`, {
      page,
      size,
      ...(status ? { status } : {}),
    });
  }

  async getEmployerDetail(applicationId: string): Promise<ApplicationDetail> {
    return this.get(`${this.EMPLOYER}/${applicationId}`);
  }

  async getApplicationsByCompany(
    page = 0,
    size = 20,
    status?: ApplicationStatus,
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    return this.get(`${this.EMPLOYER}`, {
      page,
      size,
      ...(status ? { status } : {}),
    });
  }

  async updateStatus(applicationId: string, req: UpdateStatusRequest): Promise<Application> {
    return this.patch(`${this.EMPLOYER}/${applicationId}/status`, req);
  }

  async scheduleInterview(
    applicationId: string,
    req: ScheduleInterviewRequest,
  ): Promise<Application> {
    return this.post(`${this.EMPLOYER}/${applicationId}/schedule-interview`, req);
  }

  /**
   * Employer xem / tải CV của ứng viên.
   *
   * Endpoint:
   *   - CV từ application (không có cvId):
   *       GET /employer/applications/{applicationId}/cv/view
   *       GET /employer/applications/{applicationId}/cv/download
   *   - CV cụ thể (có cvId):
   *       GET /employer/applications/{applicationId}/cv/{cvId}/view
   *       GET /employer/applications/{applicationId}/cv/{cvId}/download
   *
   * Backend trả về stream (InputStreamResource) — không phải JSON,
   * nên phải dùng responseType: "blob".
   */
  async fetchCVBlobUrl(
    applicationId: string,
    mode: "view" | "download",
    cvId?: string | null,
  ): Promise<string> {
    const url = cvId
      ? `${this.EMPLOYER}/${applicationId}/cv/${cvId}/${mode}`
      : `${this.EMPLOYER}/${applicationId}/cv/${mode}`;

    const res = await api.get(url, {
      responseType: "blob",
    });

    return URL.createObjectURL(res.data as Blob);
  }
}