import api from "@/lib/axios";
import { IAiRepository } from "@/domain/repositories/IAiRepository";
import {
  ChatMessage,
  ChatSession,
  JdOptimizationResult,
  OptimizeJdPayload,
  PageResponse,
  SendMessagePayload,
} from "@/domain/models/Ai";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
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
      "/ai/optimize-jd", payload
    );
    return res.data.data;
  }
}