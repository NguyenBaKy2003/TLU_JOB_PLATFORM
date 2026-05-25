import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import {
  CandidateProfile, CandidateCV, JobSearchStatus,
  UpdateProfilePayload, ExperiencePayload, EducationPayload,
  UploadCVPayload, CreateOnlineCVPayload,
  BoostResult, BoostStatus,
} from "@/domain/models/Candidate";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE      = 5 * 1024 * 1024;
const MAX_CV_SIZE          = 10 * 1024 * 1024;
const ALLOWED_CV_TYPES     = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export class CandidateService {
  constructor(private readonly repo: ICandidateRepository) {}

  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(): Promise<CandidateProfile> {
    return this.repo.getProfile();
  }

  async updateProfile(data: UpdateProfilePayload): Promise<CandidateProfile> {
    if (!data || Object.keys(data).length === 0)
      throw new Error("Không có thông tin nào để cập nhật");
    return this.repo.updateProfile(data);
  }

  async updateAvatar(file: File): Promise<CandidateProfile> {
    if (!file) throw new Error("File không được để trống");
    if (file.size > MAX_AVATAR_SIZE) throw new Error("Ảnh đại diện tối đa 5MB");
    if (!ALLOWED_AVATAR_TYPES.includes(file.type))
      throw new Error("Chỉ chấp nhận JPEG, PNG, WEBP");
    return this.repo.updateAvatar(file);
  }

  async updateJobSearchStatus(status: JobSearchStatus): Promise<void> {
    if (!status) throw new Error("Trạng thái tìm việc không hợp lệ");
    return this.repo.updateJobSearchStatus(status);
  }

  // ── Boost ─────────────────────────────────────────────────────────────────

  async boostCv(): Promise<BoostResult> {
    return this.repo.boostCv();
  }

  async getBoostStatus(): Promise<BoostStatus> {
    return this.repo.getBoostStatus();
  }

  // ── Experience ────────────────────────────────────────────────────────────

  async addExperience(data: ExperiencePayload): Promise<CandidateProfile> {
    this.validateExperience(data);
    return this.repo.addExperience(data);
  }

  async updateExperience(id: string, data: ExperiencePayload): Promise<CandidateProfile> {
    if (!id) throw new Error("Experience ID không hợp lệ");
    this.validateExperience(data);
    return this.repo.updateExperience(id, data);
  }

  async deleteExperience(id: string): Promise<void> {
    if (!id) throw new Error("Experience ID không hợp lệ");
    return this.repo.deleteExperience(id);
  }

  // ── Education ─────────────────────────────────────────────────────────────

  async addEducation(data: EducationPayload): Promise<CandidateProfile> {
    if (!data.school?.trim()) throw new Error("Tên trường không được để trống");
    return this.repo.addEducation(data);
  }

  async updateEducation(id: string, data: EducationPayload): Promise<CandidateProfile> {
    if (!id) throw new Error("Education ID không hợp lệ");
    if (!data.school?.trim()) throw new Error("Tên trường không được để trống");
    return this.repo.updateEducation(id, data);
  }

  async deleteEducation(id: string): Promise<void> {
    if (!id) throw new Error("Education ID không hợp lệ");
    return this.repo.deleteEducation(id);
  }

  // ── CV ────────────────────────────────────────────────────────────────────

  async listCVs(): Promise<CandidateCV[]> {
    return this.repo.listCVs();
  }

  async uploadCV(data: UploadCVPayload & { setAsPrimary?: boolean }): Promise<CandidateCV> {
    if (!data.file) throw new Error("File không được để trống");
    if (data.file.size > MAX_CV_SIZE) throw new Error("CV tối đa 10MB");
    if (!ALLOWED_CV_TYPES.includes(data.file.type))
      throw new Error("Chỉ chấp nhận PDF, DOC, DOCX");
    return this.repo.uploadCV(data);
  }

  async createOnlineCV(data: CreateOnlineCVPayload): Promise<CandidateCV> {
    if (!data.title?.trim()) throw new Error("Tiêu đề CV không được để trống");
    return this.repo.createOnlineCV(data);
  }

  async setPrimaryCV(cvId: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    return this.repo.setPrimaryCV(cvId);
  }

  async deleteCV(cvId: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    return this.repo.deleteCV(cvId);
  }

  async viewCV(cvId: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    const blobUrl = await this.repo.fetchBlobUrl(cvId, "view");
    const tab = window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    if (!tab)
      throw new Error("Trình duyệt chặn popup. Vui lòng cho phép popup cho trang này.");
  }

  async downloadCV(cvId: string, fileName?: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    const blobUrl = await this.repo.fetchBlobUrl(cvId, "download");
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName ?? "cv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  }

  // ── Private validators ────────────────────────────────────────────────────

  private validateExperience(data: ExperiencePayload): void {
    if (!data.companyName?.trim()) throw new Error("Tên công ty không được để trống");
    if (!data.position?.trim())    throw new Error("Vị trí không được để trống");
    if (!data.startDate)           throw new Error("Ngày bắt đầu không được để trống");
    if (!data.current && !data.endDate)
      throw new Error("Ngày kết thúc không được để trống khi không phải việc hiện tại");
  }
}