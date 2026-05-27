// ─── Chat Models ──────────

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

// ─── AI Score Models ──────

export interface AiScore {
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  educationScore: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

// ─── JD Optimization Models ──────

export interface JdOptimizationResult {
  improvedTitle: string;
  improvedDescription: string;
  improvedRequirements: string;
  improvedBenefits: string;
  suggestions: string[];
  qualityScore: number;
}

// ─── JD Guideline Check Models ──────

export type Severity = "PASS" | "CLEAN" | "WARNING" | "VIOLATION"|"CRITICAL" |"ERROR";

export interface GuidelineIssue {
  category: string;
  description: string;
  suggestion: string;
  severity: Severity;
}

export interface JdGuidelineCheckResult {
  passed: boolean;
  severity: Severity;
  violations: GuidelineViolation[];
  cleanedVersion: string;
  overallFeedback: string;
  qualityScore: number;
}

export interface GuidelineViolation {
  type: string;
  excerpt: string;
  explanation: string;
  suggestion: string;
}

export interface CheckGuidelinesPayload {
  jobPostId?: string;
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
}

// ─── Candidate Comparison Models ──────

export interface RankedCandidate {
  rank: number;
  applicationId: string;
  candidateName: string;
  totalScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  uniqueStrengths: string[];
  relativeWeaknesses: string[];
  verdict: string;
}

export interface CandidateComparisonResult {
  ranking: RankedCandidate[];
  topRecommendation: string;
  comparisonSummary: string;
  recruitmentAdvice: string;
}

export interface CompareCandidatesPayload {
  applicationIds: string[];
}

// ─── Competition Rate Models ──────

export interface CompetitionBreakdown {
  applicantRatioScore: number;
  poolQualityScore: number;
  jobPopularityScore: number;
  urgencyScore: number;
  entryBarrierScore: number;
}

export interface CompetitionRateResult {
  competitionScore: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  trend: "STABLE" | "RISING" | "FALLING";
  totalApplicants: number;
  averageAIScore: number;
  applicationToHiringRatio: number;
  hiringQuota: number;
  breakdown: CompetitionBreakdown;
  candidateAdvice: string;
  employerInsight: string;
}

// ─── Pass Probability Models ──────

export interface PassProbabilityResult {
  candidateId: string;
  jobPostId: string;
  probability: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  factors: PassFactor[];
  overallAssessment: string;
}

export interface PassFactor {
  name: string;
  score: number;
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  description: string;
}

// ─── Request Payloads ─────

export interface SendMessagePayload {
  sessionId?: string | null;
  content: string;
}

export interface OptimizeJdPayload {
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
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