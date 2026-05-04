// application/services/LiveStreamService.ts
import type { ILiveStreamRepository } from "@/domain/repositories/ILiveStreamRepository";
import type {
  LiveStreamSession,
  CreateSessionRequest,
  SessionStartResponse,
  JoinSessionResponse,
  SpotlightJobRequest,
  InviteToSlotRequest,
  InterviewSlot,
} from "@/domain/models/LiveStream";

export class LiveStreamService {
  constructor(private readonly repo: ILiveStreamRepository) {}

  // ─── Employer Methods ───────────

  createSession(req: CreateSessionRequest): Promise<LiveStreamSession> {
    return this.repo.createSession(req);
  }

  getMySessions(): Promise<LiveStreamSession[]> {
    return this.repo.getMySessions();
  }

  getSession(sessionId: string): Promise<LiveStreamSession> {
    return this.repo.getSession(sessionId);
  }

  startStream(sessionId: string): Promise<SessionStartResponse> {
    return this.repo.startStream(sessionId);
  }

  endStream(sessionId: string): Promise<void> {
    return this.repo.endStream(sessionId);
  }

  spotlightJob(sessionId: string, req: SpotlightJobRequest): Promise<void> {
    return this.repo.spotlightJob(sessionId, req);
  }

  inviteToSlot(
    sessionId: string,
    req: InviteToSlotRequest
  ): Promise<InterviewSlot> {
    return this.repo.inviteToSlot(sessionId, req);
  }

  // ─── Candidate Methods ──────────

  joinStream(sessionId: string): Promise<JoinSessionResponse> {
    return this.repo.joinStream(sessionId);
  }
  leaveStream(sessionId: string): Promise<void> {
    return this.repo.leaveStream(sessionId);
}

  getUpcomingStreams(): Promise<LiveStreamSession[]> {
    return this.repo.getUpcomingStreams();
  }

  submitQuestion(sessionId: string, question: string): Promise<void> {
    return this.repo.submitQuestion(sessionId, question);
  }

  respondToPoll(
    sessionId: string,
    pollEventId: string,
    optionIndex: number
  ): Promise<void> {
    return this.repo.respondToPoll(sessionId, pollEventId, optionIndex);
  }

  // ─── Common Methods ─────────────
  
  /**
   * Get current viewer count (fallback when WebSocket is not available)
   */
  async getViewerCount(sessionId: string): Promise<number> {
    try {
      const session = await this.getSession(sessionId);
      return session.viewerCount || 0;
    } catch (error) {
      console.error("Failed to get viewer count:", error);
      return 0;
    }
  }
}