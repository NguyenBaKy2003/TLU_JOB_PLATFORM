
import type {
  AutocompleteResult,
  RecommendationBundle,
} from '../models/AISearch';

export interface IAISearchRepository {
  getRecommendations(): Promise<RecommendationBundle>;
  getAutocomplete(query: string): Promise<AutocompleteResult>;
  trackSearch(keyword: string): Promise<void>;
  trackJobView(jobPostId: string, dwellSeconds: number): Promise<void>;
}