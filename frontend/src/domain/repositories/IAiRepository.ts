import {
  ChatMessage,
  ChatSession,
  JdOptimizationResult,
  OptimizeJdPayload,
  PageResponse,
  SendMessagePayload,
} from "@/domain/models/Ai";

export interface IAiRepository {
  // ── Chatbot ───────────────────────────────────────────────────
  sendMessage(payload: SendMessagePayload): Promise<ChatMessage & { sessionId: string }>;
  listSessions(page?: number, size?: number): Promise<PageResponse<ChatSession>>;
  getSession(sessionId: string): Promise<ChatSession>;
  deleteSession(sessionId: string): Promise<void>;

  // ── AI Features ───────────────────────────────────────────────
  rescoreApplication(applicationId: string): Promise<string>;
  optimizeJd(payload: OptimizeJdPayload): Promise<JdOptimizationResult>;
}