// src/infrastructure/repositories/ApplicationRepository.ts
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
import type { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import api from "@/lib/axios";

const BASE      = "/applications";
const JOBS_BASE = "/jobs";

export class ApplicationRepository implements IApplicationRepository {

  // ── Candidate ────────────────────────────────────────────────

  // POST /api/v1/jobs/{jobPostId}/apply
  async submit(req: SubmitApplicationRequest): Promise<Application> {
    const res = await api.post<{ data: Application }>(
      `${JOBS_BASE}/${req.jobPostId}/apply`,
      {
        cvUrl:          req.cvUrl,
        coverLetter:    req.coverLetter,
        expectedSalary: req.expectedSalary,
      },
    );
    return res.data.data;
  }

  // DELETE /api/v1/applications/{id}/withdraw
  async withdraw(applicationId: string): Promise<Application> {
    const res = await api.delete<{ data: Application }>(
      `${BASE}/${applicationId}/withdraw`,
    );
    return res.data.data;
  }

  // GET /api/v1/applications/my
  async getMyApplications(
    page = 0,
    size = 10,
  ): Promise<PageResponse<ApplicationWithJob>> {
    const res = await api.get<{ data: PageResponse<ApplicationWithJob> }>(
      `${BASE}/my`,
      { params: { page, size } },
    );
    return res.data.data;
  }

  // GET /api/v1/applications/{id}
  async getById(applicationId: string): Promise<Application> {
    const res = await api.get<{ data: Application }>(
      `${BASE}/${applicationId}`,
    );
    return res.data.data;
  }

  // GET /api/v1/jobs/{jobPostId}/my-application
  async checkApplied(jobPostId: string): Promise<boolean> {
    try {
      const res = await api.get<{ data: boolean }>(
        `${JOBS_BASE}/${jobPostId}/my-application`,
      );
      return res.data.data;
    } catch {
      return false;
    }
  }

  // ── Employer ─────────────────────────────────────────────────

  // ✅ Fix: đúng endpoint GET /api/v1/jobs/{jobPostId}/applications
  async getByJobPost(
    jobPostId: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus | "ALL",
  ): Promise<PageResponse<ApplicationWithCandidate>> {
    const params: Record<string, unknown> = { page, size };
    if (status && status !== "ALL") params.status = status;

    const res = await api.get<{ data: PageResponse<ApplicationWithCandidate> }>(
      `${JOBS_BASE}/${jobPostId}/applications`, // ✅ sửa từ /applications/job/{id}
      { params },
    );
    return res.data.data;
  }

  // PATCH /api/v1/applications/{id}/status
  async updateStatus(
    applicationId: string,
    req: UpdateStatusRequest,
  ): Promise<Application> {
    const res = await api.patch<{ data: Application }>(
      `${BASE}/${applicationId}/status`,
      req,
    );
    return res.data.data;
  }

  // POST /api/v1/applications/{id}/interview
  async scheduleInterview(
    applicationId: string,
    req: ScheduleInterviewRequest,
  ): Promise<Application> {
    const res = await api.post<{ data: Application }>(
      `${BASE}/${applicationId}/interview`,
      req,
    );
    return res.data.data;
  }

  // ── Shared ───────────────────────────────────────────────────

  // GET /api/v1/applications/{id}/logs
  async getStatusLogs(applicationId: string): Promise<ApplicationStatusLog[]> {
    const res = await api.get<{ data: ApplicationStatusLog[] }>(
      `${BASE}/${applicationId}/logs`,
    );
    return res.data.data;
  }
}