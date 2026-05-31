import type {
  LiveStreamSession,
  CreateSessionRequest,
  SessionStartResponse,
  JoinSessionResponse,
  SpotlightJobRequest,
  InviteToSlotRequest,
  InterviewSlot,
  StreamAnalytics,
} from "@/domain/models/LiveStream";

export interface ILiveStreamRepository {
  // ─── Employer Endpoints ─────────────────────────────────────────

  createSession(req: CreateSessionRequest): Promise<LiveStreamSession>;
  getMySessions(): Promise<LiveStreamSession[]>;
  getSession(sessionId: string): Promise<LiveStreamSession>;
  startStream(sessionId: string): Promise<SessionStartResponse>;
  endStream(sessionId: string): Promise<void>;
  spotlightJob(sessionId: string, req: SpotlightJobRequest): Promise<void>;
  inviteToSlot(sessionId: string, req: InviteToSlotRequest): Promise<InterviewSlot>;

  /** GET /api/v1/streams/{id}/analytics — Thống kê sau stream */
  getAnalytics(sessionId: string): Promise<StreamAnalytics>; // ← THÊM

  // ─── Candidate Endpoints ────────────────────────────────────────

  joinStream(sessionId: string): Promise<JoinSessionResponse>;
  getUpcomingStreams(): Promise<LiveStreamSession[]>;
  leaveStream(sessionId: string): Promise<void>;
  submitQuestion(sessionId: string, question: string): Promise<void>;
  respondToPoll(sessionId: string, pollEventId: string, optionIndex: number): Promise<void>;
}