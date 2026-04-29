import api from "@/lib/axios";
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class LiveStreamRepository implements ILiveStreamRepository {
  private readonly BASE = "/streams";

  // ─── Employer Endpoints ───────────────────────────────────────

  async createSession(req: CreateSessionRequest): Promise<LiveStreamSession> {
    const res = await api.post<ApiResponse<LiveStreamSession>>(this.BASE, req);
    return res.data.data;
  }

  async getMySessions(): Promise<LiveStreamSession[]> {
    const res = await api.get<ApiResponse<LiveStreamSession[]>>(this.BASE);
    return res.data.data;
  }

  async getSession(sessionId: string): Promise<LiveStreamSession> {
    const res = await api.get<ApiResponse<LiveStreamSession>>(
      `${this.BASE}/${sessionId}`
    );
    return res.data.data;
  }

  async startStream(sessionId: string): Promise<SessionStartResponse> {
    const res = await api.post<ApiResponse<SessionStartResponse>>(
      `${this.BASE}/${sessionId}/start`
    );
    return res.data.data;
  }

  async endStream(sessionId: string): Promise<void> {
    await api.post(`${this.BASE}/${sessionId}/end`);
  }

  async spotlightJob(
    sessionId: string,
    req: SpotlightJobRequest
  ): Promise<void> {
    await api.post(`${this.BASE}/${sessionId}/spotlight`, req);
  }

  async inviteToSlot(
    sessionId: string,
    req: InviteToSlotRequest
  ): Promise<InterviewSlot> {
    const res = await api.post<ApiResponse<InterviewSlot>>(
      `${this.BASE}/${sessionId}/invite-slot`,
      req
    );
    return res.data.data;
  }

  // ─── Candidate Endpoints ──────────────────────────────────────

  async joinStream(sessionId: string): Promise<JoinSessionResponse> {
    const res = await api.post<ApiResponse<JoinSessionResponse>>(
      `${this.BASE}/${sessionId}/join`
    );
    return res.data.data;
  }

  async getUpcomingStreams(): Promise<LiveStreamSession[]> {
    const res = await api.get<ApiResponse<LiveStreamSession[]>>(
      `${this.BASE}/upcoming`
    );
    return res.data.data;
  }

  async submitQuestion(sessionId: string, question: string): Promise<void> {
    await api.post(`${this.BASE}/${sessionId}/questions`, { question });
  }

  async respondToPoll(
    sessionId: string,
    pollEventId: string,
    optionIndex: number
  ): Promise<void> {
    await api.post(
      `${this.BASE}/${sessionId}/polls/${pollEventId}/respond`,
      { optionIndex }
    );
  }
}