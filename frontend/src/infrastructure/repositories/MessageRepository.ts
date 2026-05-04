// src/infrastructure/repositories/MessageRepository.ts

import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type {
  ConversationSummary,
  ConversationMessage,
  StartConversationPayload,
  SendMessagePayload,
  MessagePage,
} from "@/domain/models/Message";
import api from "@/lib/axios";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class MessageRepository implements IMessageRepository {

  private readonly BASE = "/messages";

  // ── Helpers ────────────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patch(url: string): Promise<void> {
    await api.patch(url);
  }

  // ── Conversations ──────

  async getInbox(page = 0, size = 20): Promise<MessagePage> {
    // Backend trả về GetConversationsUseCase.Result
    // { conversations: ConversationResponse[], page, size, totalElements, totalPages }
    return this.get(`${this.BASE}/conversations`, { page, size });
  }

  async startConversation(payload: StartConversationPayload): Promise<ConversationSummary> {
    return this.post(`${this.BASE}/conversations`, payload);
  }

  // ── Messages ───────────

  async getMessages(
    conversationId: string,
    page = 0,
    size = 50,
  ): Promise<ConversationMessage[]> {
    // Backend trả về List<MessageResponse> trực tiếp (không paginated)
    return this.get<ConversationMessage[]>(
      `${this.BASE}/conversations/${conversationId}`,
      { page, size },
    );
  }

  async sendMessage(payload: SendMessagePayload): Promise<ConversationMessage> {
    return this.post(`${this.BASE}`, payload);
  }

  async markAsRead(conversationId: string): Promise<void> {
    return this.patch(`${this.BASE}/conversations/${conversationId}/read`);
  }
}