import api from "@/lib/axios";
import type { IAISearchRepository } from "@/domain/repositories/IAISearchRepository";
import type {
  AutocompleteResult,
  RecommendationBundle,
} from "@/domain/models/AISearch";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// ── Raw API shapes ───────────────────

interface RawJob {
  jobPostId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: string;
  matchScore: number;
  matchReason: string;
  isNew?: boolean;
  urgencySignal?: string;
}

interface RawCompany {
  companyId?: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  fitScore: number;
  fitReason: string;
  openPositions: string[];
  openJobs?: number;         
}

interface RawRecommendationData {
  jobs: {
    jobs: RawJob[];
    careerStage?: string;
    searchPatternSummary?: string;
    inferredGoals?: string[];
  };
  companies: {
    companies: RawCompany[];
    personalitySummary?: string;
  };
}

// ── Repository ───────────────────────

export class AISearchRepository implements IAISearchRepository {
  private readonly BASE = "/ai";

  async getRecommendations(): Promise<RecommendationBundle> {
    const res = await api.get<ApiResponse<RawRecommendationData>>(
      `${this.BASE}/recommendations`,
    );

    const raw = res.data.data;

    return {
      jobs: (raw.jobs?.jobs ?? []).map((j) => ({
        jobPostId:      j.jobPostId,
        title:          j.jobTitle,
        companyName:    j.companyName,
        companyLogoUrl: j.companyLogoUrl,
        location:       j.location,
        salary:         j.salary,
        matchScore:     j.matchScore,
        reason:         j.matchReason,
        isNew:          j.isNew,
        urgencySignal:  j.urgencySignal,
      })),
      companies: (raw.companies?.companies ?? []).map((c) => ({
        companyId:     c.companyId,
        companyName:   c.companyName,
        logoUrl:       c.logoUrl,
        industry:      c.industry,
        openJobs:      c.openJobs ?? c.openPositions?.length ?? 0,  
        openPositions: c.openPositions ?? [],
        matchScore:    c.fitScore,
        reason:        c.fitReason,
      })),
      generatedAt:         new Date().toISOString(),
      careerStage:         raw.jobs?.careerStage,
      searchPatternSummary: raw.jobs?.searchPatternSummary,
      personalitySummary:  raw.companies?.personalitySummary,
    };
  }

  async getAutocomplete(query: string): Promise<AutocompleteResult> {
    const res = await api.get<ApiResponse<AutocompleteResult>>(
      `${this.BASE}/autocomplete`,
      { params: { q: query } },
    );
    return res.data.data;
  }

  async trackSearch(keyword: string): Promise<void> {
    await api.post(`${this.BASE}/track/search`, null, {
      params: { keyword },
    });
  }

  async trackJobView(jobPostId: string, dwellSeconds: number): Promise<void> {
    await api.post(`${this.BASE}/track/job-view`, null, {
      params: { jobPostId, dwellSeconds },
    });
  }
}