import {
  ChatMessage,
  ChatSession,
  JdOptimizationResult,
  JdGuidelineCheckResult,
  CandidateComparisonResult,
  CompetitionRateResult,
  PassProbabilityResult,
  OptimizeJdPayload,
  CheckGuidelinesPayload,
  CompareCandidatesPayload,
  CandidateSearchResult,
  SmartSearchCandidatesPayload,
  PageResponse,
  SendMessagePayload,
} from "@/domain/models/Ai";

export interface IAiRepository {
  // ── Chatbot ──────
  sendMessage(payload: SendMessagePayload): Promise<ChatMessage & { sessionId: string }>;
  listSessions(page?: number, size?: number): Promise<PageResponse<ChatSession>>;
  getSession(sessionId: string): Promise<ChatSession>;
  deleteSession(sessionId: string): Promise<void>;

  // ── AI Features ──
  rescoreApplication(applicationId: string): Promise<string>;
  optimizeJd(payload: OptimizeJdPayload): Promise<JdOptimizationResult>;

  // ── JD Guidelines ──
  checkJdGuidelines(payload: CheckGuidelinesPayload): Promise<JdGuidelineCheckResult>;

  // ── Candidate Comparison ──
  compareCandidates(jobId: string, payload: CompareCandidatesPayload): Promise<CandidateComparisonResult>;

  // ── Competition Rate ──
  getCompetitionRate(jobPostId: string): Promise<CompetitionRateResult>;

  // ── Pass Probability ──
  getPassProbability(jobId: string): Promise<PassProbabilityResult>;

  // ── Candidate Search ──
  smartSearchCandidates(payload: SmartSearchCandidatesPayload): Promise<CandidateSearchResult>;
  autoSuggestCandidates(jobPostId: string): Promise<CandidateSearchResult>;
}