// src/domain/models/Message.ts

// ── Enums ─────────────────────────────────────────────────────────────────────

export type MessageType         = "TEXT" | "FILE" | "IMAGE" | "AUDIO" | "EMOJI";
export type ConversationStatus  = "ACTIVE" | "ARCHIVED" | "BLOCKED";

// ── Domain models (map với backend response) ──────────────────────────────────

export interface ConversationMessage {
  id:             string;
  conversationId: string;
  senderId:       string;
  content:        string;
  type:           MessageType;
  read:           boolean;
  readAt:         string | null;
  createdAt:      string;
  // Frontend-only extras (được enrich từ context)
  fromMe?:        boolean;
  fileName?:      string;
  fileSize?:      string;
  duration?:      string;
}

export interface ConversationSummary {
  id:                 string;
  participantA:       string;  // employerId
  participantB:       string;  // candidateId
  jobPostId:          string | null;
  status:             ConversationStatus;
  lastMessagePreview: string | null;
  lastMessageAt:      string | null;
  unreadCountA:       number;
  unreadCountB:       number;
  createdAt:          string;
  updatedAt:          string;

  // Được enrich từ backend ConversationResponse
  otherParticipantId:   string;
  otherParticipantName: string;
  otherParticipantAvatar?: string | null;
  jobTitle?:            string | null;
  unreadCount:          number;  // unread của current user
  online?:              boolean;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface StartConversationPayload {
  candidateId: string;
  jobPostId?:  string;
}

export interface SendMessagePayload {
  conversationId: string;
  content:        string;
  type:           MessageType;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface MessagePage {
  conversations: ConversationSummary[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}