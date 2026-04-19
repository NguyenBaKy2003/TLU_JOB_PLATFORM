// src/application/services/JobService.ts

import type { IJobRepository }   from "@/domain/repositories/IJobRepository";
import type {
  JobPost, JobPostDetail, JobPostForm,
  CreateJobPayload, UpdateJobPayload, JobSearchParams, PageResponse,
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

  // ── Saved jobs ─────────────────────────────────────────────────────────────

  toggleSave(jobPostId: string): Promise<boolean> {
    return this.repo.toggleSave(jobPostId);
  }

  listSaved(page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.repo.listSaved(page, size);
  }

  // ── Employer ──────────────────────────────────────────────────────────────

  /**
   * Tạo bài đăng từ form state.
   * Chuyển string → number, lọc empty string, build payload đúng kiểu backend.
   */
  createFromForm(form: JobPostForm, publish: boolean): Promise<JobPostDetail> {
    const payload = this._buildCreatePayload(form);
    if (publish) {
      // Tạo draft trước, rồi publish ngay
      return this.repo.create(payload).then(job => this.repo.publish(job.id));
    }
    return this.repo.create(payload);
  }

  /**
   * Cập nhật bài đăng từ form state.
   * Nếu publish=true và job đang là draft → publish sau khi update.
   */
  updateFromForm(id: string, form: JobPostForm, publish: boolean): Promise<JobPostDetail> {
    const payload = this._buildUpdatePayload(form);
    if (publish) {
      return this.repo.update(id, payload).then(job => this.repo.publish(job.id));
    }
    return this.repo.update(id, payload);
  }

  /** Tạo trực tiếp từ payload đã build sẵn */
  create(payload: CreateJobPayload): Promise<JobPostDetail> {
    return this.repo.create(payload);
  }

  /** Cập nhật trực tiếp từ payload đã build sẵn */
  update(id: string, payload: UpdateJobPayload): Promise<JobPostDetail> {
    return this.repo.update(id, payload);
  }

  getMyJobs(page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.repo.getMyJobs(page, size);
  }

  publish(id: string): Promise<JobPostDetail> {
    return this.repo.publish(id);
  }

  close(id: string): Promise<JobPostDetail> {
    return this.repo.close(id);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Map JobPostForm → CreateJobPayload */
  private _buildCreatePayload(form: JobPostForm): CreateJobPayload {
    return {
      title:               form.title.trim(),
      description:         form.description  || undefined,
      requirements:        form.requirements || undefined,
      benefits:            form.benefits     || undefined,
      jobType:             (form.jobType     || undefined) as CreateJobPayload["jobType"],
      level:               (form.level       || undefined) as CreateJobPayload["level"],
      category:            form.category     || undefined,
      salaryNegotiable:    form.salaryNegotiable,
      salaryMin:           form.salaryNegotiable || !form.salaryMin   ? undefined : Number(form.salaryMin),
      salaryMax:           form.salaryNegotiable || !form.salaryMax   ? undefined : Number(form.salaryMax),
      salaryCurrency:      form.salaryCurrency   || undefined,
      workLocationType:    (form.workLocationType || undefined) as CreateJobPayload["workLocationType"],
      workLocationCity:    form.workLocationCity    || undefined,
      workLocationAddress: form.workLocationAddress || undefined,
      experienceYears:     form.experienceYears ? Number(form.experienceYears) : undefined,
      vacancies:           form.vacancies    ? Number(form.vacancies)    : undefined,
      deadline:            form.deadline,
      skills:              form.skills.length ? form.skills : undefined,
    };
  }

  /** Map JobPostForm → UpdateJobPayload (giống create, dùng riêng để dễ mở rộng) */
  private _buildUpdatePayload(form: JobPostForm): UpdateJobPayload {
    return {
      title:               form.title.trim(),
      description:         form.description  || undefined,
      requirements:        form.requirements || undefined,
      benefits:            form.benefits     || undefined,
      jobType:             (form.jobType     || undefined) as UpdateJobPayload["jobType"],
      level:               (form.level       || undefined) as UpdateJobPayload["level"],
      category:            form.category     || undefined,
      salaryNegotiable:    form.salaryNegotiable,
      salaryMin:           form.salaryNegotiable || !form.salaryMin   ? undefined : Number(form.salaryMin),
      salaryMax:           form.salaryNegotiable || !form.salaryMax   ? undefined : Number(form.salaryMax),
      salaryCurrency:      form.salaryCurrency   || undefined,
      workLocationType:    (form.workLocationType || undefined) as UpdateJobPayload["workLocationType"],
      workLocationCity:    form.workLocationCity    || undefined,
      workLocationAddress: form.workLocationAddress || undefined,
      experienceYears:     form.experienceYears ? Number(form.experienceYears) : undefined,
      vacancies:           form.vacancies    ? Number(form.vacancies)    : undefined,
      deadline:            form.deadline,
      skills:              form.skills.length ? form.skills : undefined,
    };
  }
}