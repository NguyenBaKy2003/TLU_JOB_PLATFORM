// src/infrastructure/repositories/ApplicationRepository.ts
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
import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import api from "@/lib/axios";

const BASE     = "/applications";
const JOBS     = "/jobs";
const EMPLOYER = "/employer/applications";

export class ApplicationRepository implements IApplicationRepository {

  // ── Candidate ────────────────────────────────────────────────

  async submit(req: SubmitApplicationRequest): Promise<Application> {
    const res = await api.post<{ data: Application }>(
      `${JOBS}/${req.jobPostId}/apply`,
      { cvUrl: req.cvUrl, coverLetter: req.coverLetter, expectedSalary: req.expectedSalary },
    );
    return res.data.data;
  }

  async withdraw(applicationId: string): Promise<Application> {
    const res = await api.delete<{ data: Application }>(`${BASE}/${applicationId}/withdraw`);
    return res.data.data;
  }

  async getMyApplications(page = 0, size = 10): Promise<PageResponse<ApplicationWithJob>> {
    const res = await api.get<{ data: PageResponse<ApplicationWithJob> }>(
      `${BASE}/my`,
      { params: { page, size } },
    );
    return res.data.data;
  }

  async getById(applicationId: string): Promise<Application> {
    const res = await api.get<{ data: Application }>(`${BASE}/${applicationId}`);
    return res.data.data;
  }

  async checkApplied(jobPostId: string): Promise<boolean> {
    try {
      const res = await api.get<{ data: boolean }>(`${JOBS}/${jobPostId}/my-application`);
      return res.data.data;
    } catch {
      return false;
    }
  }

  // ── Employer ─────────────────────────────────────────────────

  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus | "ALL",
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    const params: Record<string, unknown> = { page, size };
    if (status && status !== "ALL") params.status = status;

    const res = await api.get<{ data: PageResponse<ApplicationWithCandidate> }>(
      `${JOBS}/${jobPostId}/applications`,
      { params },
    );
    return res.data.data;
  }

  /**
   * GET /api/v1/employer/applications/{id}
   * Response chứa candidate, aiScore, statusHistory — không cần gọi /logs riêng.
   */
  async getEmployerDetail(applicationId: string): Promise<ApplicationDetail> {
    const res = await api.get<{ data: ApplicationDetail }>(
      `${EMPLOYER}/${applicationId}`,
    );
    return res.data.data;
  }

  async updateStatus(applicationId: string, req: UpdateStatusRequest): Promise<Application> {
    const res = await api.patch<{ data: Application }>(
      `${BASE}/${applicationId}/status`,
      req,
    );
    return res.data.data;
  }

  async scheduleInterview(
    applicationId: string,
    req: ScheduleInterviewRequest,
  ): Promise<Application> {
    const res = await api.post<{ data: Application }>(
      `${BASE}/${applicationId}/schedule-interview`,
      req,
    );
    return res.data.data;
  }

  async getApplicationsByCompany(
  page = 0,
  size = 20,
  status?: ApplicationStatus | "ALL",
): Promise<PageResponse<ApplicationWithCandidate>> {

  const params: Record<string, unknown> = { page, size };
  if (status && status !== "ALL") params.status = status;

  const res = await api.get<{ data: PageResponse<ApplicationWithCandidate> }>(
    `${EMPLOYER}`,
    { params },
  );

  return res.data.data;
}
}