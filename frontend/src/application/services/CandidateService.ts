import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import {
  CandidateProfile,
  CandidateCV,
  JobSearchStatus,
} from "@/domain/models/Candidate";

// ─── Nested payload types (mirror Java DTO exactly) ───────────────────────────

export interface SkillPayload {
  name:       string;
  level:      string;
  yearsOfExp: number;
}

export interface LanguagePayload {
  name:  string;
  level: string;    // A1 | A2 | B1 | B2 | C1 | C2 | NATIVE
}

export interface SocialLinkPayload {
  platform: string;  // LINKEDIN | GITHUB | DRIBBBLE | ...
  url:      string;
}

/** Backend accepts a single desiredJob object — NOT an array */
export interface DesiredJobPayload {
  industry?:      string;
  minSalary?:     number;
  currency?:      string;
  contractTypes?: string[];  // FULL_TIME | PART_TIME | REMOTE | INTERNSHIP
  levels?:        string[];  // FRESHER | JUNIOR | SENIOR | MANAGER | DIRECTOR
}

// ─── Main payload ─────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  firstName?:      string;
  lastName?:       string;
  headline?:       string;
  summary?:        string;
  phone?:          string;
  location?:       string;
  dateOfBirth?:    string;   // ISO "YYYY-MM-DD"
  gender?:         string;
  maritalStatus?:  string;
  expectedSalary?: number;
  currency?:       string;
  skills?:         SkillPayload[];
  languages?:      LanguagePayload[];
  socialLinks?:    SocialLinkPayload[];
  desiredJob?:     DesiredJobPayload;  // singular — matches Java field name
  benefits?:       string[];
  // NOTE: experiences managed via a separate API endpoint
}

export interface UploadCVPayload {
  file:  File;
  title: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CandidateService {
  constructor(private readonly repo: ICandidateRepository) {}

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