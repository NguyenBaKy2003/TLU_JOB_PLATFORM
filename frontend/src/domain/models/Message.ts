// src/domain/models/Message.ts

// ── Enums ──

export type MessageType        = "TEXT" | "FILE" | "IMAGE" | "AUDIO" | "EMOJI";
export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "BLOCKED";

// ── Shared types ──────────

export interface Participant {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

// ── Domain models (match backend 100%) ─────────

// Message trong conversation
export interface ConversationMessage {
  id:             string;
  conversationId: string;
  senderId:       string;
  content:        string;
  type:           MessageType;
  read:           boolean;
  readAt:         string | null;
  createdAt:      string;

  // Frontend-only extras
  fromMe?:   boolean;
  fileName?: string;
  fileSize?: string;
  duration?: string;
}

// Summary conversation (LIST)
export interface ConversationSummary {
  id: string;

  employer:  Participant;
  candidate: Participant;

  jobPostId: string | null;
  status:    ConversationStatus;

  unreadCount: number;

  // optional (backend có thể chưa trả)
  lastMessagePreview?: string | null;
  lastMessageAt?:      string | null;

  // optional UI
  jobTitle?: string | null;
  online?:   boolean;
}

// ── Payloads ──────────────

export interface StartConversationPayload {
  candidateId: string;
  jobPostId?:  string;
}

export interface SendMessagePayload {
  conversationId: string;
  content:        string;
  type:           MessageType;
}

// ── Pagination ────────────

export interface MessagePage {
  conversations: ConversationSummary[];
  totalUnread:   number;
}