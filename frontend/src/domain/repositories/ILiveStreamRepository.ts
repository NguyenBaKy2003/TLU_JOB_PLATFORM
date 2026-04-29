import type {
  LiveStreamSession,
  CreateSessionRequest,
  SessionStartResponse,
  JoinSessionResponse,
  SpotlightJobRequest,
  InviteToSlotRequest,
  InterviewSlot,
} from "@/domain/models/LiveStream";

export interface ILiveStreamRepository {
  // ─── Employer Endpoints ───────────────────────────────────────

  /** POST /api/v1/streams — Tạo phiên stream mới */
  createSession(req: CreateSessionRequest): Promise<LiveStreamSession>;

  /** GET /api/v1/streams — Danh sách phiên của employer */
  getMySessions(): Promise<LiveStreamSession[]>;

  /** GET /api/v1/streams/{id} — Chi tiết phiên */
  getSession(sessionId: string): Promise<LiveStreamSession>;

  /** POST /api/v1/streams/{id}/start — Bắt đầu stream, lấy host token */
  startStream(sessionId: string): Promise<SessionStartResponse>;

  /** POST /api/v1/streams/{id}/end — Kết thúc stream */
  endStream(sessionId: string): Promise<void>;

  /** POST /api/v1/streams/{id}/spotlight — Ghim job post */
  spotlightJob(sessionId: string, req: SpotlightJobRequest): Promise<void>;

  /** POST /api/v1/streams/{id}/invite-slot — Mời candidate vào slot */
  inviteToSlot(sessionId: string, req: InviteToSlotRequest): Promise<InterviewSlot>;

  // ─── Candidate Endpoints ──────────────────────────────────────

  /** POST /api/v1/streams/{id}/join — Candidate lấy viewer token để vào xem */
  joinStream(sessionId: string): Promise<JoinSessionResponse>;

  /** GET /api/v1/streams/upcoming — Danh sách phiên sắp diễn ra (public) */
  getUpcomingStreams(): Promise<LiveStreamSession[]>;

  /** POST /api/v1/streams/{id}/questions — Gửi câu hỏi Q&A */
  submitQuestion(sessionId: string, question: string): Promise<void>;

  /** POST /api/v1/streams/{id}/polls/{pollId}/respond — Trả lời poll */
  respondToPoll(sessionId: string, pollEventId: string, optionIndex: number): Promise<void>;
}