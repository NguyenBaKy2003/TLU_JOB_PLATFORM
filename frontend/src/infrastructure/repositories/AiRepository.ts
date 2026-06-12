import api from "@/lib/axios";
import { IAiRepository } from "@/domain/repositories/IAiRepository";
import {
  ChatMessage,
  ChatSession,
  JdOptimizationResult,
  JdGuidelineCheckResult,
  CandidateComparisonResult,
  CompetitionRateResult,
  PassProbabilityResult,
  CandidateSearchResult,
  SmartSearchCandidatesPayload,
  OptimizeJdPayload,
  CheckGuidelinesPayload,
  CompareCandidatesPayload,
  PageResponse,
  SendMessagePayload,
  InviteCandidatePayload,
  InviteCandidateResponse,
} from "@/domain/models/Ai";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors?: Record<string, string[]>;
}

export class AiRepository implements IAiRepository {

  // ── Chatbot ──────────────────────────────────────────────────────────────

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage & { sessionId: string }> {
    const res = await api.post<ApiResponse<ChatMessage & { sessionId: string }>>(
      "/chatbot/messages", payload
    );
    return res.data.data;
  }

  async listSessions(page = 0, size = 20): Promise<PageResponse<ChatSession>> {
    const res = await api.get<ApiResponse<PageResponse<ChatSession>>>(
      "/chatbot/sessions", { params: { page, size } }
    );
    return res.data.data;
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const res = await api.get<ApiResponse<ChatSession>>(
      `/chatbot/sessions/${sessionId}`
    );
    return res.data.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/chatbot/sessions/${sessionId}`);
  }

  // ── AI Features ──────────────────────────────────────────────────────────

  async rescoreApplication(applicationId: string): Promise<string> {
    const res = await api.post<ApiResponse<string>>(
      `/ai/applications/${applicationId}/rescore`
    );
    return res.data.message ?? "Đang tính điểm AI...";
  }

  async optimizeJd(payload: OptimizeJdPayload): Promise<JdOptimizationResult> {
    const res = await api.post<ApiResponse<JdOptimizationResult>>(
      "/ai/optimize-jd",
      {
        title: payload.title,
        description: payload.description ?? "",
        requirements: payload.requirements ?? "",
        benefits: payload.benefits ?? "",
        level: payload.level ?? "",
        category: payload.category ?? "",
      }
    );
    return res.data.data;
  }

  // ── JD Guidelines ─────────────────────────────────────────────────────────

  async checkJdGuidelines(payload: CheckGuidelinesPayload): Promise<JdGuidelineCheckResult> {
    try {
      const res = await api.post<ApiResponse<JdGuidelineCheckResult>>(
        "/ai/check-jd-guidelines", payload
      );
      return res.data.data;
    } catch (error: any) {
      // API trả 422 khi có VIOLATION nhưng vẫn kèm data
      if (error?.response?.status === 422 && error?.response?.data?.data) {
        return error.response.data.data;
      }
      throw error;
    }
  }

  // ── Candidate Comparison ──────────────────────────────────────────────────

  async compareCandidates(
    jobId: string,
    payload: CompareCandidatesPayload
  ): Promise<CandidateComparisonResult> {
    const res = await api.post<ApiResponse<CandidateComparisonResult>>(
      `/ai/jobs/${jobId}/compare-candidates`, payload
    );
    return res.data.data;
  }

  // ── Competition Rate ──────────────────────────────────────────────────────

  async getCompetitionRate(jobPostId: string): Promise<CompetitionRateResult> {
    const res = await api.get<ApiResponse<CompetitionRateResult>>(
      `/job-posts/${jobPostId}/competition-rate`
    );
    return res.data.data;
  }

  // ── Pass Probability ──────────────────────────────────────────────────────

  async getPassProbability(jobId: string): Promise<PassProbabilityResult> {
    const res = await api.get<ApiResponse<PassProbabilityResult>>(
      `/job-posts/${jobId}/pass-probability`
    );
    return res.data.data;
  }

  // ── Candidate Search ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/ai/candidates/search
   * Tìm kiếm ứng viên bằng ngôn ngữ tự nhiên hoặc tiêu chí có cấu trúc.
   */
  async smartSearchCandidates(
    payload: SmartSearchCandidatesPayload
  ): Promise<CandidateSearchResult> {
    const res = await api.post<ApiResponse<CandidateSearchResult>>(
      "/ai/candidates/search",
      {
        query: payload.query ?? "",
        jobTitle: payload.jobTitle ?? "",
        requirements: payload.requirements ?? "",
        level: payload.level ?? "",
        location: payload.location ?? "",
        requiredSkills: payload.requiredSkills ?? [],
        maxResults: payload.maxResults ?? 10,
      }
    );
    return res.data.data;
  }

  /**
   * GET /api/v1/ai/jobs/{jobPostId}/candidate-suggestions
   * Gợi ý ứng viên tự động dựa trên JD (kết quả cache 1 giờ phía server).
   */
  async autoSuggestCandidates(jobPostId: string): Promise<CandidateSearchResult> {
    const res = await api.get<ApiResponse<CandidateSearchResult>>(
      `/ai/jobs/${jobPostId}/candidate-suggestions`
    );
    return res.data.data;
  }


  async inviteCandidate(
    jobPostId: string,
    payload: InviteCandidatePayload
  ): Promise<InviteCandidateResponse> {
    const res = await api.post<ApiResponse<InviteCandidateResponse>>(
      `/jobs/${jobPostId}/invite-candidate`,
      payload
    );
    return res.data.data;
  }
}