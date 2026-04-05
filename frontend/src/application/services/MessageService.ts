// src/application/services/MessageService.ts

import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type {
  ConversationSummary,
  ConversationMessage,
  MessageType,
  MessagePage,
} from "@/domain/models/Message";

export class MessageService {

  constructor(private readonly repo: IMessageRepository) {}

  // ── Conversations ─────────────────────────────────────────────────────────

  /** Inbox — danh sách conversations (cả candidate lẫn employer dùng chung) */
  getInbox(page = 0, size = 20): Promise<MessagePage> {
    return this.repo.getInbox(page, size);
  }

  /**
   * Employer tạo conversation với candidate về một job post.
   * Candidate không cần gọi endpoint này — chỉ employer mới initiate.
   */
  startConversation(
    candidateId: string,
    jobPostId?: string,
  ): Promise<ConversationSummary> {
    return this.repo.startConversation({ candidateId, jobPostId });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  /** Lấy message thread của một conversation */
  getMessages(
    conversationId: string,
    page = 0,
    size = 50,
  ): Promise<ConversationMessage[]> {
    return this.repo.getMessages(conversationId, page, size);
  }

  /** Gửi text message */
  sendText(conversationId: string, content: string): Promise<ConversationMessage> {
    return this.repo.sendMessage({
      conversationId,
      content,
      type: "TEXT",
    });
  }

  /** Gửi emoji */
  sendEmoji(conversationId: string, emoji: string): Promise<ConversationMessage> {
    return this.repo.sendMessage({
      conversationId,
      content: emoji,
      type: "EMOJI",
    });
  }

  /** Gửi message với type tùy chỉnh (file, audio...) */
  sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = "TEXT",
  ): Promise<ConversationMessage> {
    return this.repo.sendMessage({ conversationId, content, type });
  }

  /** Đánh dấu đã đọc — gọi khi user mở conversation */
  markAsRead(conversationId: string): Promise<void> {
    return this.repo.markAsRead(conversationId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Enrich messages với fromMe flag dựa trên currentUserId.
   * Dùng sau khi nhận response từ API.
   */
  enrichMessages(
    messages: ConversationMessage[],
    currentUserId: string,
  ): ConversationMessage[] {
    return messages.map(m => ({ ...m, fromMe: m.senderId === currentUserId }));
  }
}