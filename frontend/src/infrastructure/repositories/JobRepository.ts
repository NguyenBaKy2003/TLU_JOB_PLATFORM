// src/infrastructure/repositories/JobRepository.ts

import type { IJobRepository } from "@/domain/repositories/IJobRepository";
import type {
  JobPost, JobPostDetail, CreateJobPayload,
  JobSearchParams, PageResponse,
} from "@/domain/models/Job";
import api from "@/lib/axios";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class JobRepository implements IJobRepository {

  private readonly BASE = "/jobs";

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── Public ─────────────────────────────────────────────────────────────────

  async listPublished(page = 0, size = 12): Promise<PageResponse<JobPost>> {
    return this.get(this.BASE, { page, size });
  }

  async search(params: JobSearchParams): Promise<PageResponse<JobPost>> {
    return this.get(`${this.BASE}/search`, params as Record<string, unknown>);
  }

  async getById(id: string): Promise<JobPostDetail> {
    return this.get(`${this.BASE}/${id}`);
  }

  async getBySlug(slug: string): Promise<JobPostDetail> {
    return this.get(`${this.BASE}/slug/${slug}`);
  }

  // ── Saved jobs ─────────────────────────────────────────────────────────────

  /** POST /api/v1/jobs/{id}/save — toggle, backend trả về Boolean */
  async toggleSave(jobPostId: string): Promise<boolean> {
    return this.post(`${this.BASE}/${jobPostId}/save`);
  }

  async listSaved(page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.get(`${this.BASE}/saved`, { page, size });
  }

  // ── Employer ───────────────────────────────────────────────────────────────

  /** POST /api/v1/jobs — tạo DRAFT */
  async create(payload: CreateJobPayload): Promise<JobPostDetail> {
    return this.post(this.BASE, payload);
  }

  /** GET /api/v1/jobs/my */
  async getMyJobs(page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.get(`${this.BASE}/my`, { page, size });
  }

  /** POST /api/v1/jobs/{id}/publish */
  async publish(id: string): Promise<JobPostDetail> {
    return this.post(`${this.BASE}/${id}/publish`);
  }

  /** POST /api/v1/jobs/{id}/close */
  async close(id: string): Promise<JobPostDetail> {
    return this.post(`${this.BASE}/${id}/close`);
  }

  /** DELETE /api/v1/jobs/{id} */
  async delete(id: string): Promise<void> {
    return this.del(`${this.BASE}/${id}`);
  }
}