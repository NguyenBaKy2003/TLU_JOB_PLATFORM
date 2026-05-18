import type { IAISearchRepository } from "@/domain/repositories/IAISearchRepository";
import type {
  AutocompleteResult,
  RecommendationBundle,
} from "@/domain/models/AISearch";

export class AISearchService {
  constructor(private readonly repo: IAISearchRepository) {}

  /** Không cần auth — cá nhân hóa nếu có token, anonymous nếu không */
  async getAutocomplete(query: string): Promise<AutocompleteResult> {
    if (!query?.trim()) throw new Error("Từ khóa không được để trống");
    return this.repo.getAutocomplete(query.trim());
  }

  /** Cần auth — trả null nếu chưa đăng nhập thay vì throw */
  async getRecommendations(isAuthenticated: boolean): Promise<RecommendationBundle | null> {
    if (!isAuthenticated) return null;
    return this.repo.getRecommendations();
  }

  /** Cần auth — silent skip nếu chưa đăng nhập */
  async trackSearch(keyword: string, isAuthenticated: boolean): Promise<void> {
    if (!isAuthenticated || !keyword?.trim()) return;
    return this.repo.trackSearch(keyword.trim());
  }

  /** Cần auth — silent skip nếu chưa đăng nhập */
  async trackJobView(
    jobPostId: string,
    dwellSeconds: number,
    isAuthenticated: boolean,
  ): Promise<void> {
    if (!isAuthenticated || !jobPostId || dwellSeconds < 0) return;
    return this.repo.trackJobView(jobPostId, dwellSeconds);
  }
}

let aiSearchService: AISearchService | null = null;

export function getAISearchService(repo: IAISearchRepository): AISearchService {
  if (!aiSearchService) {
    aiSearchService = new AISearchService(repo);
  }
  return aiSearchService;
}