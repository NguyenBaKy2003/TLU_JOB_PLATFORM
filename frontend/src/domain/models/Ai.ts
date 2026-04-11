// ─── Chat Models ──────────────────────────────────────────────────────────────

export type MessageRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  messages?: ChatMessage[];
}

// ─── AI Score Models ──────────────────────────────────────────────────────────

export interface AiScore {
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  educationScore: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

// ─── JD Optimization Models ───────────────────────────────────────────────────

export interface JdOptimizationResult {
  improvedTitle: string;
  improvedDescription: string;
  improvedRequirements: string;
  suggestions: string[];
  qualityScore: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface SendMessagePayload {
  sessionId?: string | null;
  content: string;
}

export interface OptimizeJdPayload {
  title: string;
  description?: string;
  requirements?: string;
  level?: string;
  category?: string;
}
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}