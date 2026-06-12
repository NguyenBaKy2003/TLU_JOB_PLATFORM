import { IAiRepository } from "@/domain/repositories/IAiRepository";
import {
  ChatMessage,
  ChatSession,
  JdOptimizationResult,
  JdGuidelineCheckResult,
  CandidateComparisonResult,
  CompetitionRateResult,
  PassProbabilityResult,
  CandidateSearchResult,
  SmartSearchCandidatesPayload,
  OptimizeJdPayload,
  CheckGuidelinesPayload,
  PageResponse,
} from "@/domain/models/Ai";

export class AiService {
  constructor(private readonly repo: IAiRepository) {}

  // ── Chatbot ──────────────────────────────────────────────────────────────

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

  // ── AI Features ──────────────────────────────────────────────────────────

  async rescoreApplication(applicationId: string): Promise<string> {
    if (!applicationId) throw new Error("Application ID không hợp lệ");
    return this.repo.rescoreApplication(applicationId);
  }

  async optimizeJd(payload: OptimizeJdPayload): Promise<JdOptimizationResult> {
    if (!payload.title?.trim()) throw new Error("Tiêu đề JD không được để trống");
    return this.repo.optimizeJd({
      title: payload.title,
      description: payload.description ?? "",
      requirements: payload.requirements ?? "",
      benefits: payload.benefits ?? "",
      level: payload.level,
      category: payload.category,
    });
  }

  // ── JD Guidelines ─────────────────────────────────────────────────────────

  async checkJdGuidelines(payload: CheckGuidelinesPayload): Promise<JdGuidelineCheckResult> {
    if (!payload.title?.trim()) throw new Error("Tiêu đề JD không được để trống");
    return this.repo.checkJdGuidelines(payload);
  }

  // ── Candidate Comparison ──────────────────────────────────────────────────

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

  // ── Competition Rate ──────────────────────────────────────────────────────

  async getCompetitionRate(jobPostId: string): Promise<CompetitionRateResult> {
    if (!jobPostId) throw new Error("Job Post ID không hợp lệ");
    return this.repo.getCompetitionRate(jobPostId);
  }

  // ── Pass Probability ──────────────────────────────────────────────────────

  async getPassProbability(jobId: string): Promise<PassProbabilityResult> {
    if (!jobId) throw new Error("Job ID không hợp lệ");
    return this.repo.getPassProbability(jobId);
  }

  // ── Candidate Search ──────────────────────────────────────────────────────

  /**
   * Tìm kiếm ứng viên bằng ngôn ngữ tự nhiên hoặc tiêu chí có cấu trúc.
   * Ít nhất một trong query / jobTitle / requirements phải có giá trị.
   */
  async smartSearchCandidates(
    payload: SmartSearchCandidatesPayload
  ): Promise<CandidateSearchResult> {
    const hasInput =
      payload.query?.trim() ||
      payload.jobTitle?.trim() ||
      payload.requirements?.trim();

    if (!hasInput)
      throw new Error("Vui lòng nhập từ khóa tìm kiếm hoặc tiêu chí vị trí");

    if (payload.maxResults !== undefined) {
      if (payload.maxResults < 1 || payload.maxResults > 20)
        throw new Error("Số kết quả phải từ 1 đến 20");
    }

    return this.repo.smartSearchCandidates(payload);
  }

  /**
   * Gợi ý ứng viên tự động cho một JD cụ thể.
   * Kết quả được cache 1 giờ phía server.
   */
  async autoSuggestCandidates(jobPostId: string): Promise<CandidateSearchResult> {
    if (!jobPostId) throw new Error("Job Post ID không hợp lệ");
    return this.repo.autoSuggestCandidates(jobPostId);
  }
}