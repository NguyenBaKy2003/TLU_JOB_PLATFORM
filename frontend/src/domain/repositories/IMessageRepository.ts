// src/domain/repositories/IMessageRepository.ts

import type {
  ConversationSummary,
  ConversationMessage,
  StartConversationPayload,
  SendMessagePayload,
  MessagePage,
} from "@/domain/models/Message";

export interface IMessageRepository {

  // ── Conversations ─────────────────────────────────────────────────────────

  /** GET /api/v1/messages/conversations — inbox của user hiện tại */
  getInbox(page?: number, size?: number): Promise<MessagePage>;

  /** POST /api/v1/messages/conversations — employer tạo conversation với candidate */
  startConversation(payload: StartConversationPayload): Promise<ConversationSummary>;

  // ── Messages ──────────────────────────────────────────────────────────────

  /** GET /api/v1/messages/conversations/{id} — lịch sử tin nhắn */
  getMessages(
    conversationId: string,
    page?: number,
    size?: number,
  ): Promise<ConversationMessage[]>;

  /** POST /api/v1/messages — gửi tin nhắn mới */
  sendMessage(payload: SendMessagePayload): Promise<ConversationMessage>;

  /** PATCH /api/v1/messages/conversations/{id}/read — đánh dấu đã đọc */
  markAsRead(conversationId: string): Promise<void>;
}