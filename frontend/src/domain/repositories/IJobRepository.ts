// src/domain/repositories/IJobRepository.ts

import type {
  JobPost, JobPostDetail, CreateJobPayload, UpdateJobPayload,
  JobSearchParams, PageResponse,
  SubmitReviewResponse,
  JobStatus,
} from "@/domain/models/Job";

export interface MyJobsParams {
  keyword?:  string;
  status?:   JobStatus;
  dateFrom?: string;
  dateTo?:   string;
}


export type JobStatusCounts = { total: number } & Partial<Record<JobStatus, number>>;

export interface IJobRepository {

  // ── Public / candidate ────────────────────────────────────────────────────

  listPublished(page?: number, size?: number): Promise<PageResponse<JobPost>>;

  search(params: JobSearchParams): Promise<PageResponse<JobPost>>;

  getById(id: string): Promise<JobPostDetail>;

  getBySlug(slug: string): Promise<JobPostDetail>;

  // ── Candidate — saved jobs ────────────────────────────────────────────────

  toggleSave(jobPostId: string): Promise<boolean>;

  listSaved(page?: number, size?: number): Promise<PageResponse<JobPost>>;

  checkSaved(jobPostId: string): Promise<boolean>;

  // ── Employer ──────────────────────────────────────────────────────────────

  create(payload: CreateJobPayload): Promise<JobPostDetail>;

  update(id: string, payload: UpdateJobPayload): Promise<JobPostDetail>;

  submit(id: string, featured?: boolean): Promise<SubmitReviewResponse>;

  /**
   * Danh sách bài đăng của tôi — paginated + filtered.
   * Gọi GET /api/v1/jobs/my
   */
  getMyJobs(page?: number, size?: number, params?: MyJobsParams): Promise<PageResponse<JobPost>>;

  /**
   * Số lượng bài đăng theo từng trạng thái — lightweight, không phân trang.
   * Gọi GET /api/v1/jobs/my/counts
   */
  getMyJobCounts(): Promise<JobStatusCounts>;

  close(id: string): Promise<JobPostDetail>;

  delete(id: string): Promise<void>;
}