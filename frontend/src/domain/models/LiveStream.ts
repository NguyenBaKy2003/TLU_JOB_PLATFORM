export type SessionType = "JOB_FAIR" | "INTERVIEW";
export type SessionStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
export type AiSummaryStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";
export type SlotStatus = "OPEN" | "ASSIGNED" | "DONE";

export interface InterviewSlot {
  slotId: string;
  startTime: string;
  durationMinutes: number;
  candidateId: string | null;
  status: SlotStatus;
}
export interface StreamAnalytics {
  sessionId:         string;
  peakViewerCount:   number;
  totalViewerCount:  number;
  totalWatchSeconds: number;
  applyClickCount:   number;
  cvViewCount:       number;
  pollResponseCount: number;
  qaQuestionCount:   number;
}
export interface LiveStreamSession {
  id: string;
  companyId: string;
  hostUserId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  sessionType: SessionType;
  status: SessionStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  maxViewers: number;
  viewerCount: number;
  quotaConsumed: boolean;
  interviewSlots: InterviewSlot[];
}

export interface CreateSessionRequest {
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledAt: string;
  interviewSlots?: Array<{
    startTime: string;
    durationMinutes: number;
  }>;
}

export interface SessionStartResponse {
  hostToken: string;
  livekitUrl: string;
}

export interface JoinSessionResponse {
  viewerToken: string;
  livekitUrl: string;
  currentViewerCount: number;
  canPublish: boolean;
}

export interface SpotlightJobRequest {
  jobPostId: string;
}

export interface InviteToSlotRequest {
  candidateId: string;
  slotId: string;
}