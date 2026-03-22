import {
  CandidateProfile,
  CandidateCV,
  JobSearchStatus,
  UpdateProfilePayload,
  ExperiencePayload,
  EducationPayload,
  UploadCVPayload,
  CreateOnlineCVPayload,
} from "@/domain/models/Candidate";

export interface ICandidateRepository {
  // ── Profile ───────────────────────────────────────────────────
  getProfile(): Promise<CandidateProfile>;
  updateProfile(data: UpdateProfilePayload): Promise<CandidateProfile>;
  updateAvatar(file: File): Promise<CandidateProfile>;
  updateJobSearchStatus(status: JobSearchStatus): Promise<void>;

  // ── Work experience ───────────────────────────────────────────
  addExperience(data: ExperiencePayload): Promise<CandidateProfile>;
  updateExperience(id: string, data: ExperiencePayload): Promise<CandidateProfile>;
  deleteExperience(id: string): Promise<void>;

  // ── Education ─────────────────────────────────────────────────
  addEducation(data: EducationPayload): Promise<CandidateProfile>;
  updateEducation(id: string, data: EducationPayload): Promise<CandidateProfile>;
  deleteEducation(id: string): Promise<void>;

  // ── CV ────────────────────────────────────────────────────────
  listCVs(): Promise<CandidateCV[]>;
  uploadCV(data: UploadCVPayload): Promise<CandidateCV>;
  createOnlineCV(data: CreateOnlineCVPayload): Promise<CandidateCV>;
  setPrimaryCV(cvId: string): Promise<void>;
  deleteCV(cvId: string): Promise<void>;
  fetchBlobUrl(cvId: string, mode: "view" | "download"): Promise<string>;
}