// src/application/services/JobService.ts

import type {
  IJobRepository,
  MyJobsParams,
  JobStatusCounts,
} from "@/domain/repositories/IJobRepository";
import type {
  JobPost,
  JobPostDetail,
  JobPostForm,
  CreateJobPayload,
  UpdateJobPayload,
  JobSearchParams,
  PageResponse,
  SubmitReviewResponse,
} from "@/domain/models/Job";

export class JobService {
  constructor(private readonly repo: IJobRepository) {}

  // ── Public / candidate ────────────────────────────────────────────────────

  listPublished(page = 0, size = 12): Promise<PageResponse<JobPost>> {
    return this.repo.listPublished(page, size);
  }

  search(params: JobSearchParams): Promise<PageResponse<JobPost>> {
    return this.repo.search(params);
  }

  getById(id: string): Promise<JobPostDetail> {
    return this.repo.getById(id);
  }

  getBySlug(slug: string): Promise<JobPostDetail> {
    return this.repo.getBySlug(slug);
  }

  // ── Saved jobs ────────────────────────────────────────────────────────────

  toggleSave(jobPostId: string): Promise<boolean> {
    return this.repo.toggleSave(jobPostId);
  }

  listSaved(page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.repo.listSaved(page, size);
  }

  checkSaved(jobPostId: string): Promise<boolean> {
    return this.repo.checkSaved(jobPostId);
  }

  // ── Employer — write ──────────────────────────────────────────────────────

  /**
   * Tạo bài đăng từ form state.
   * Nếu publish=true → submit để kiểm duyệt ngay sau khi tạo.
   */
  async createFromForm(
    form: JobPostForm,
    publish: boolean,
    featured = false,
  ): Promise<{ job: JobPostDetail; review?: SubmitReviewResponse["review"] }> {
    const payload = this._buildCreatePayload(form);
    const job = await this.repo.create(payload);

    if (publish) {
      const result = await this.repo.submit(job.id, featured);
      return { job: result.job, review: result.review };
    }
    return { job };
  }

  /**
   * Cập nhật bài đăng từ form state.
   * Nếu publish=true và job đang là draft → submit sau khi update.
   */
  async updateFromForm(
    id: string,
    form: JobPostForm,
    publish: boolean,
    featured = false,
  ): Promise<{ job: JobPostDetail; review?: SubmitReviewResponse["review"] }> {
    const payload = this._buildUpdatePayload(form);
    const updated = await this.repo.update(id, payload);

    if (publish) {
      const result = await this.repo.submit(updated.id, featured);
      return { job: result.job, review: result.review };
    }
    return { job: updated };
  }

  submit(id: string, featured = false): Promise<SubmitReviewResponse> {
    return this.repo.submit(id, featured);
  }

  create(payload: CreateJobPayload): Promise<JobPostDetail> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateJobPayload): Promise<JobPostDetail> {
    return this.repo.update(id, payload);
  }

  // ── Employer — read ───────────────────────────────────────────────────────

  /** Danh sách bài đăng của tôi — paginated + filtered */
  getMyJobs(
    page = 0,
    size = 10,
    params?: MyJobsParams,
  ): Promise<PageResponse<JobPost>> {
    return this.repo.getMyJobs(page, size, params);
  }

  /**
   * Số lượng bài đăng theo từng trạng thái.
   * Gọi endpoint nhẹ GET /api/v1/jobs/my/counts — không load entity.
   */
  getMyJobCounts(): Promise<JobStatusCounts> {
    return this.repo.getMyJobCounts();
  }

  close(id: string): Promise<JobPostDetail> {
    return this.repo.close(id);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _buildCreatePayload(form: JobPostForm): CreateJobPayload {
    return {
      title: form.title.trim(),
      description: form.description || undefined,
      requirements: form.requirements || undefined,
      benefits: form.benefits || undefined,
      jobType: (form.jobType || undefined) as CreateJobPayload["jobType"],
      level: (form.level || undefined) as CreateJobPayload["level"],
      category: form.category || undefined,
      salaryNegotiable: form.salaryNegotiable,
      salaryMin:
        form.salaryNegotiable || !form.salaryMin
          ? undefined
          : Number(form.salaryMin),
      salaryMax:
        form.salaryNegotiable || !form.salaryMax
          ? undefined
          : Number(form.salaryMax),
      salaryCurrency: form.salaryCurrency || undefined,
      workLocationType: (form.workLocationType ||
        undefined) as CreateJobPayload["workLocationType"],
      workLocationCity: form.workLocationCity || undefined,
      workLocationAddress: form.workLocationAddress || undefined,
      experienceYears: form.experienceYears
        ? Number(form.experienceYears)
        : undefined,
      vacancies: form.vacancies ? Number(form.vacancies) : undefined,
      deadline: form.deadline,
      skills: form.skills.length ? form.skills : undefined,
    };
  }

  private _buildUpdatePayload(form: JobPostForm): UpdateJobPayload {
    return {
      title: form.title.trim(),
      description: form.description || undefined,
      requirements: form.requirements || undefined,
      benefits: form.benefits || undefined,
      jobType: (form.jobType || undefined) as UpdateJobPayload["jobType"],
      level: (form.level || undefined) as UpdateJobPayload["level"],
      category: form.category || undefined,
      salaryNegotiable: form.salaryNegotiable,
      salaryMin:
        form.salaryNegotiable || !form.salaryMin
          ? undefined
          : Number(form.salaryMin),
      salaryMax:
        form.salaryNegotiable || !form.salaryMax
          ? undefined
          : Number(form.salaryMax),
      salaryCurrency: form.salaryCurrency || undefined,
      workLocationType: (form.workLocationType ||
        undefined) as UpdateJobPayload["workLocationType"],
      workLocationCity: form.workLocationCity || undefined,
      workLocationAddress: form.workLocationAddress || undefined,
      experienceYears: form.experienceYears
        ? Number(form.experienceYears)
        : undefined,
      vacancies: form.vacancies ? Number(form.vacancies) : undefined,
      deadline: form.deadline,
      skills: form.skills.length ? form.skills : undefined,
    };
  }
}
