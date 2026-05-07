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
  OptimizeJdPayload,
  CheckGuidelinesPayload,
  CompareCandidatesPayload,
  PageResponse,
  SendMessagePayload,
} from "@/domain/models/Ai";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors?: Record<string, string[]>;
}

export class AiRepository implements IAiRepository {

  // ── Chatbot ──────

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

  // ── AI Features ──

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
      description: payload.description || "",
      requirements: payload.requirements || "",
      benefits: payload.benefits || "",      
      level: payload.level || "",
      category: payload.category || "",
    }
  );
  return res.data.data;
}

  // ── NEW: JD Guidelines ──

async checkJdGuidelines(payload: CheckGuidelinesPayload): Promise<JdGuidelineCheckResult> {
  try {
    const res = await api.post<ApiResponse<JdGuidelineCheckResult>>(
      "/ai/check-jd-guidelines", payload
    );
    return res.data.data;
  } catch (error: any) {
    // Nếu API trả về 422 với data (VIOLATION nhưng vẫn có data)
    if (error?.response?.status === 422 && error?.response?.data?.data) {
      return error.response.data.data; 
    }
    throw error;
  }
}

  // ── NEW: Candidate Comparison ──

  async compareCandidates(jobId: string, payload: CompareCandidatesPayload): Promise<CandidateComparisonResult> {
    const res = await api.post<ApiResponse<CandidateComparisonResult>>(
      `/ai/jobs/${jobId}/compare-candidates`, payload
    );
    return res.data.data;
  }

  // ── NEW: Competition Rate ──

  async getCompetitionRate(jobPostId: string): Promise<CompetitionRateResult> {
    const res = await api.get<ApiResponse<CompetitionRateResult>>(
      `/job-posts/${jobPostId}/competition-rate`
    );
    return res.data.data;
  }

  // ── NEW: Pass Probability ──

  async getPassProbability(jobId: string): Promise<PassProbabilityResult> {
    const res = await api.get<ApiResponse<PassProbabilityResult>>(
      `/job-posts/${jobId}/pass-probability`
    );
    return res.data.data;
  }
}