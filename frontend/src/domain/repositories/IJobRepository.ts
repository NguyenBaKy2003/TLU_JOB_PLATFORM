// src/domain/repositories/IJobRepository.ts

import type {
  JobPost, JobPostDetail, CreateJobPayload, UpdateJobPayload,
  JobSearchParams, PageResponse,
} from "@/domain/models/Job";

export interface IJobRepository {

  // ── Public / candidate ────────────────────────────────────────────────────

  /** Danh sách việc làm đang PUBLISHED */
  listPublished(page?: number, size?: number): Promise<PageResponse<JobPost>>;

  /** Tìm kiếm việc làm với filter */
  search(params: JobSearchParams): Promise<PageResponse<JobPost>>;

  /** Chi tiết theo ID (tăng view) */
  getById(id: string): Promise<JobPostDetail>;

  /** Chi tiết theo slug (tăng view) */
  getBySlug(slug: string): Promise<JobPostDetail>;

  // ── Candidate — saved jobs ────────────────────────────────────────────────

  /** Toggle lưu/bỏ lưu — trả về true nếu đã lưu, false nếu bỏ lưu */
  toggleSave(jobPostId: string): Promise<boolean>;

  /** Danh sách bài đã lưu */
  listSaved(page?: number, size?: number): Promise<PageResponse<JobPost>>;

  // ── Employer ──────────────────────────────────────────────────────────────

  /** Tạo bài đăng mới (DRAFT) */
  create(payload: CreateJobPayload): Promise<JobPostDetail>;

  /** Cập nhật bài đăng — PATCH /api/v1/jobs/:id */
  update(id: string, payload: UpdateJobPayload): Promise<JobPostDetail>;

  /** Lấy danh sách bài đăng của tôi (employer) */
  getMyJobs(page?: number, size?: number): Promise<PageResponse<JobPost>>;

  /** Publish bài đăng */
  publish(id: string): Promise<JobPostDetail>;

  /** Đóng bài đăng */
  close(id: string): Promise<JobPostDetail>;

  /** Xóa bài đăng */
  delete(id: string): Promise<void>;

  checkSaved(jobPostId: string): Promise<boolean>;
}