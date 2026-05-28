// D:\TLU_JOB_PLATFORM\frontend\src\domain\repositories\ICompanyReviewRepository.ts

import type {
  CompanyReview,
  ReviewStats,
  CreateReviewRequest,
  UpdateReviewRequest,
  PageResponse,
  MyReviewsResponse,
  GetMyReviewsParams,
} from '../models/CompanyReview';

export interface ICompanyReviewRepository {
  // Public endpoints
  getCompanyReviews(companyId: string, page?: number, size?: number): Promise<PageResponse<CompanyReview>>;
  getCompanyReviewStats(companyId: string): Promise<ReviewStats>;

  // Candidate endpoints
  createReview(companyId: string, data: CreateReviewRequest): Promise<CompanyReview>;
  updateReview(companyId: string, reviewId: string, data: UpdateReviewRequest): Promise<CompanyReview>;
  deleteReview(companyId: string, reviewId: string): Promise<void>;
  getMyReviews(params?: GetMyReviewsParams): Promise<MyReviewsResponse>;

  // Employer endpoints
  approveReview(reviewId: string): Promise<CompanyReview>;
  rejectReview(reviewId: string, reason: string): Promise<CompanyReview>;
}