import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import {
  CandidateProfile, CandidateCV, JobSearchStatus,
  UpdateProfilePayload, ExperiencePayload, EducationPayload,
  UploadCVPayload, CreateOnlineCVPayload,
  BoostResult, BoostStatus,
  ApplicableCV,
} from "@/domain/models/Candidate";
import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export class CandidateRepository implements ICandidateRepository {

  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(): Promise<CandidateProfile> {
    const res = await api.get<ApiResponse<CandidateProfile>>("/candidate/profile/me");
    return res.data.data;
  }

  async updateProfile(data: UpdateProfilePayload): Promise<CandidateProfile> {
    const res = await api.put<ApiResponse<CandidateProfile>>("/candidate/profile/me", data);
    return res.data.data;
  }

  async updateAvatar(file: File): Promise<CandidateProfile> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.patch<ApiResponse<CandidateProfile>>(
      "/candidate/profile/me/avatar", form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  }

  async updateJobSearchStatus(status: JobSearchStatus): Promise<void> {
    await api.patch("/candidate/profile/me/job-search-status", null, { params: { status } });
  }

  // ── Boost ─────────────────────────────────────────────────────────────────

  async boostCv(): Promise<BoostResult> {
    const res = await api.post<ApiResponse<BoostResult>>("/candidate/profile/boost");
    return res.data.data;
  }

  async getBoostStatus(): Promise<BoostStatus> {
    const res = await api.get<ApiResponse<BoostStatus>>("/candidate/profile/boost/status");
    return res.data.data;
  }

  // ── Experience ────────────────────────────────────────────────────────────

  async addExperience(data: ExperiencePayload): Promise<CandidateProfile> {
    const res = await api.post<ApiResponse<CandidateProfile>>(
      "/candidate/profile/me/experiences", data);
    return res.data.data;
  }

  async updateExperience(id: string, data: ExperiencePayload): Promise<CandidateProfile> {
    const res = await api.put<ApiResponse<CandidateProfile>>(
      `/candidate/profile/me/experiences/${id}`, data);
    return res.data.data;
  }

  async deleteExperience(id: string): Promise<void> {
    await api.delete(`/candidate/profile/me/experiences/${id}`);
  }

  // ── Education ─────────────────────────────────────────────────────────────

  async addEducation(data: EducationPayload): Promise<CandidateProfile> {
    const res = await api.post<ApiResponse<CandidateProfile>>(
      "/candidate/profile/me/educations", data);
    return res.data.data;
  }

  async updateEducation(id: string, data: EducationPayload): Promise<CandidateProfile> {
    const res = await api.put<ApiResponse<CandidateProfile>>(
      `/candidate/profile/me/educations/${id}`, data);
    return res.data.data;
  }

  async deleteEducation(id: string): Promise<void> {
    await api.delete(`/candidate/profile/me/educations/${id}`);
  }

  // ── CV ────────────────────────────────────────────────────────────────────

  async listCVs(): Promise<CandidateCV[]> {
    const res = await api.get<ApiResponse<CandidateCV[]>>("/candidate/cv");
    return res.data.data;
  }

  async uploadCV({ file, title, setAsPrimary }: UploadCVPayload & { setAsPrimary?: boolean }): Promise<CandidateCV> {
    const form = new FormData();
    form.append("file", file);
    form.append("data", new Blob(
      [JSON.stringify({ title, setAsPrimary })],
      { type: "application/json" }
    ));
    const res = await api.post<ApiResponse<CandidateCV>>("/candidate/cv/upload", form, {
      headers: { "Content-Type": undefined },
    });
    return res.data.data;
  }

  async createOnlineCV(data: CreateOnlineCVPayload): Promise<CandidateCV> {
    const res = await api.post<ApiResponse<CandidateCV>>("/candidate/cv/online", data);
    return res.data.data;
  }

  async setPrimaryCV(cvId: string): Promise<void> {
    await api.patch(`/candidate/cv/${cvId}/primary`);
  }

  async deleteCV(cvId: string): Promise<void> {
    await api.delete(`/candidate/cv/${cvId}`);
  }

  async listApplicableCVs(): Promise<ApplicableCV[]> {
  const res = await api.get<ApiResponse<ApplicableCV[]>>("/candidate/cv/applicable");
  return res.data.data;
}

  async fetchBlobUrl(cvId: string, mode: "view" | "download"): Promise<string> {
    const res = await api.get(`/candidate/cv/${cvId}/${mode}`, {
      responseType: "blob",
      maxRedirects: 5,
    });
    return URL.createObjectURL(res.data as Blob);
  }
}