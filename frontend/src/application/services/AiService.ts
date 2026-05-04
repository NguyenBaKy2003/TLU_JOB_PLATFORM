import { IAiRepository } from "@/domain/repositories/IAiRepository";
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
  PageResponse,
} from "@/domain/models/Ai";

export class AiService {
  constructor(private readonly repo: IAiRepository) {}

  // ── Chatbot ──────

  async sendMessage(
    content: string,
    sessionId?: string | null
  ): Promise<ChatMessage & { sessionId: string }> {
    if (!content?.trim()) throw new Error("Nội dung tin nhắn không được để trống");
    if (content.length > 2000) throw new Error("Tin nhắn tối đa 2000 ký tự");
    return this.repo.sendMessage({ content: content.trim(), sessionId });
  }

  async listSessions(page = 0, size = 20): Promise<PageResponse<ChatSession>> {
    return this.repo.listSessions(page, size);
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    if (!sessionId) throw new Error("Session ID không hợp lệ");
    return this.repo.getSession(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId) throw new Error("Session ID không hợp lệ");
    return this.repo.deleteSession(sessionId);
  }

  // ── AI Features ──

  async rescoreApplication(applicationId: string): Promise<string> {
    if (!applicationId) throw new Error("Application ID không hợp lệ");
    return this.repo.rescoreApplication(applicationId);
  }

async optimizeJd(payload: OptimizeJdPayload): Promise<JdOptimizationResult> {
  if (!payload.title?.trim()) throw new Error("Tiêu đề JD không được để trống");
  return this.repo.optimizeJd({
    title: payload.title,
    description: payload.description || "",
    requirements: payload.requirements || "",
    benefits: payload.benefits || "",   
    level: payload.level,
    category: payload.category,
  });
}

  // ── NEW: JD Guidelines ──

  async checkJdGuidelines(payload: CheckGuidelinesPayload): Promise<JdGuidelineCheckResult> {
    if (!payload.title?.trim()) throw new Error("Tiêu đề JD không được để trống");
    return this.repo.checkJdGuidelines(payload);
  }

  // ── NEW: Candidate Comparison ──

  async compareCandidates(
    jobId: string, 
    applicationIds: string[]
  ): Promise<CandidateComparisonResult> {
    if (!jobId) throw new Error("Job ID không hợp lệ");
    if (!applicationIds || applicationIds.length < 2) 
      throw new Error("Cần ít nhất 2 ứng viên để so sánh");
    if (applicationIds.length > 10) 
      throw new Error("Tối đa 10 ứng viên mỗi lần so sánh");
      
    return this.repo.compareCandidates(jobId, { applicationIds });
  }

  // ── NEW: Competition Rate ──

  async getCompetitionRate(jobPostId: string): Promise<CompetitionRateResult> {
    if (!jobPostId) throw new Error("Job Post ID không hợp lệ");
    return this.repo.getCompetitionRate(jobPostId);
  }

  // ── NEW: Pass Probability ──

  async getPassProbability(jobId: string): Promise<PassProbabilityResult> {
    if (!jobId) throw new Error("Job ID không hợp lệ");
    return this.repo.getPassProbability(jobId);
  }
}