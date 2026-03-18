import { ICandidateRepository }         from "@/domain/repositories/ICandidateRepository";
import { UpdateProfilePayload,
         UploadCVPayload }               from "@/application/services/CandidateService";
import { CandidateProfile,
         CandidateCV,
         JobSearchStatus }               from "@/domain/models/Candidate";
import api                              from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string | null;
}

export class CandidateRepository implements ICandidateRepository {

  // ── Profile ───────────────────────────────────────────────────

  async getProfile(): Promise<CandidateProfile> {
    const res = await api.get<ApiResponse<CandidateProfile>>(
      "/candidate/profile/me"
    );
    return res.data.data;
  }

  async updateProfile(data: UpdateProfilePayload): Promise<CandidateProfile> {
    const res = await api.put<ApiResponse<CandidateProfile>>(
      "/candidate/profile/me",
      data
    );
    return res.data.data;
  }

  async updateJobSearchStatus(status: JobSearchStatus): Promise<void> {
    await api.patch("/candidate/profile/me/job-search-status", null, {
      params: { status },
    });
  }

  // ── CV ────────────────────────────────────────────────────────

  async listCVs(): Promise<CandidateCV[]> {
    const res = await api.get<ApiResponse<CandidateCV[]>>("/candidate/cv");
    return res.data.data;
  }

  async uploadCV({ file, title }: UploadCVPayload): Promise<CandidateCV> {
    const form = new FormData();
    form.append("file", file);
    form.append(
      "data",
      new Blob([JSON.stringify({ title })], { type: "application/json" })
    );

    const res = await api.post<ApiResponse<CandidateCV>>(
      "/candidate/cv/upload",
      form,
      { headers: { "Content-Type": undefined } }
    );
    return res.data.data;
  }

  async setPrimaryCV(cvId: string): Promise<void> {
    await api.patch(`/candidate/cv/${cvId}/primary`);
  }

  async deleteCV(cvId: string): Promise<void> {
    await api.delete(`/candidate/cv/${cvId}`);
  }
}