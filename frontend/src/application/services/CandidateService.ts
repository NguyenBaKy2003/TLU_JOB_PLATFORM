import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import {
  CandidateProfile,
  CandidateCV,
  JobSearchStatus,
} from "@/domain/models/Candidate";

export interface UpdateProfilePayload {
  headline?:       string;
  summary?:        string;
  phone?:          string;
  location?:       string;
  dateOfBirth?:    string;
  gender?:         string;
  expectedSalary?: number;
  currency?:       string;
  skills?:         { name: string; level: string; yearsOfExp: number }[];
}

export interface UploadCVPayload {
  file:  File;
  title: string;
}

export class CandidateService {
  constructor(private readonly repo: ICandidateRepository) {}

  // ── Profile ───────────────────────────────────────────────────

  async getProfile(): Promise<CandidateProfile> {
    return this.repo.getProfile();
  }

  async updateProfile(data: UpdateProfilePayload): Promise<CandidateProfile> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Không có thông tin nào để cập nhật");
    }
    return this.repo.updateProfile(data);
  }

  async updateJobSearchStatus(status: JobSearchStatus): Promise<void> {
    if (!status) throw new Error("Trạng thái tìm việc không hợp lệ");
    return this.repo.updateJobSearchStatus(status);
  }

  // ── CV ────────────────────────────────────────────────────────

  async listCVs(): Promise<CandidateCV[]> {
    return this.repo.listCVs();
  }

  async uploadCV(data: UploadCVPayload): Promise<CandidateCV> {
    if (!data.file) throw new Error("File không được để trống");
    if (!data.title?.trim()) throw new Error("Tiêu đề CV không được để trống");
    return this.repo.uploadCV(data);
  }

  async setPrimaryCV(cvId: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    return this.repo.setPrimaryCV(cvId);
  }

  async deleteCV(cvId: string): Promise<void> {
    if (!cvId) throw new Error("CV ID không hợp lệ");
    return this.repo.deleteCV(cvId);
  }
}