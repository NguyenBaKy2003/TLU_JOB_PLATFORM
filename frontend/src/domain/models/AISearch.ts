export interface AutocompleteSuggestion {
  query: string;
  reason: string;
  relevanceScore: number;
  type: "RECENT" | "TRENDING" | "AI_SUGGESTED";
}

export interface AutocompleteResult {
  suggestions: AutocompleteSuggestion[];
}

// ── Recommendations ──────────────────────────────────────────────

export interface RecommendationJob {
  jobPostId: string;
  title: string;        // mapped từ jobTitle
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: string;
  matchScore: number;   // mapped từ matchScore
  reason: string;       // mapped từ matchReason
  isNew?: boolean;
  urgencySignal?: string;
}

export interface RecommendationCompany {
  companyId?: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  openJobs: number;     // mapped từ openPositions.length
  openPositions: string[];
  matchScore: number;   // mapped từ fitScore
  reason: string;       // mapped từ fitReason
}

export interface RecommendationBundle {
  jobs: RecommendationJob[];
  companies: RecommendationCompany[];
  generatedAt: string;
  // metadata từ backend
  careerStage?: string;
  searchPatternSummary?: string;
  personalitySummary?: string;
}