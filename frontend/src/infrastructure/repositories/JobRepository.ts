// src/infrastructure/repositories/JobRepository.ts

import type { IJobRepository, MyJobsParams, JobStatusCounts } from "@/domain/repositories/IJobRepository";
import type {
  JobPost, JobPostDetail, CreateJobPayload, UpdateJobPayload,
  JobSearchParams, PageResponse,
  SubmitReviewResponse,
  SavedJobsParams,
  MySavedJobsResponse,
} from "@/domain/models/Job";
import api from "@/lib/axios";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class JobRepository implements IJobRepository {

  private readonly BASE = "/jobs";

  // ── Helpers ────────

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

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── Public ─────────

  async listPublished(page = 0, size = 12): Promise<PageResponse<JobPost>> {
    return this.get(this.BASE, { page, size });
  }

async search(params: JobSearchParams): Promise<PageResponse<JobPost>> {
  const { jobTypes, levels, ...rest } = params;
  return this.get(`${this.BASE}/search`, {
    ...rest,
    ...(jobTypes?.length ? { jobTypes } : {}),
    ...(levels?.length   ? { levels }   : {}),
  } as Record<string, unknown>);
}

  async getById(id: string): Promise<JobPostDetail> {
    return this.get(`${this.BASE}/${id}`);
  }

  async getBySlug(slug: string): Promise<JobPostDetail> {
    return this.get(`${this.BASE}/slug/${slug}`);
  }

  // ── Saved jobs ─────

  async toggleSave(jobPostId: string): Promise<boolean> {
    return this.post(`${this.BASE}/${jobPostId}/save`);
  }

async listSaved(page = 0, size = 10, params?: SavedJobsParams): Promise<MySavedJobsResponse> {
  return this.get(`${this.BASE}/saved`, {
    page,
    size,
    keyword:     params?.keyword     || undefined,
    jobType:     params?.jobType     || undefined,
    category:    params?.category    || undefined,
    savedAtFrom: params?.savedAtFrom || undefined,
    savedAtTo:   params?.savedAtTo   || undefined,
    sortBy:      params?.sortBy      || undefined,
    sortDir:     params?.sortDir     || undefined,
  });
}

  async checkSaved(jobPostId: string): Promise<boolean> {
    try {
      const res = await api.get<ApiResponse<boolean>>(`${this.BASE}/${jobPostId}/saved`);
      return res.data.data;
    } catch {
      return false;
    }
  }

  // ── Employer ───────

  async create(payload: CreateJobPayload): Promise<JobPostDetail> {
    return this.post(this.BASE, payload);
  }

  async update(id: string, payload: UpdateJobPayload): Promise<JobPostDetail> {
    return this.patch(`${this.BASE}/${id}`, payload);
  }

  async submit(id: string, featured = false): Promise<SubmitReviewResponse> {
    const res = await api.post<ApiResponse<SubmitReviewResponse>>(
      `${this.BASE}/${id}/submit`,
      { featured },
    );
    return res.data.data;
  }

  /** GET /api/v1/jobs/my — paginated, filtered */
  async getMyJobs(page = 0, size = 10, params?: MyJobsParams): Promise<PageResponse<JobPost>> {
    return this.get(`${this.BASE}/my`, {
      page,
      size,
      keyword:       params?.keyword,
      status:        params?.status,
      createdAtFrom: params?.dateFrom ? `${params.dateFrom}T00:00:00` : undefined,
      createdAtTo:   params?.dateTo   ? `${params.dateTo}T23:59:59`   : undefined,
    });
  }

  /**
   * GET /api/v1/jobs/my/counts
   * Trả về số lượng bài đăng theo từng trạng thái — không load entity, không phân trang.
   */
  async getMyJobCounts(): Promise<JobStatusCounts> {
    return this.get(`${this.BASE}/my/counts`);
  }

  async close(id: string): Promise<JobPostDetail> {
    return this.post(`${this.BASE}/${id}/close`);
  }

  async delete(id: string): Promise<void> {
    return this.del(`${this.BASE}/${id}`);
  }
}