// D:\TLU_JOB_PLATFORM\frontend\src\domain\repositories\IAdminReviewRepository.ts

import type { CompanyReview, PageResponse, ReviewStatus } from "../models/CompanyReview";

export interface IAdminReviewRepository {
  adminGetAllReviews(page: number, size: number, status?: ReviewStatus): Promise<PageResponse<CompanyReview>>;
  adminGetPendingReviews(page: number, size: number): Promise<PageResponse<CompanyReview>>;
  adminGetReviewDetail(reviewId: string): Promise<CompanyReview>;
  adminApproveReview(reviewId: string): Promise<CompanyReview>;
  adminRejectReview(reviewId: string, reason: string): Promise<CompanyReview>;
  adminHideReview(reviewId: string): Promise<void>;
  adminShowReview(reviewId: string): Promise<void>;
  adminDeleteReview(reviewId: string): Promise<void>;
}