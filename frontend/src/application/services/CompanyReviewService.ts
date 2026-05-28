// D:\TLU_JOB_PLATFORM\frontend\src\application\services\CompanyReviewService.ts

import type { ICompanyReviewRepository } from "@/domain/repositories/ICompanyReviewRepository";
import type {
  CompanyReview,
  ReviewStats,
  CreateReviewRequest,
  UpdateReviewRequest,
  PageResponse,
  MyReviewsResponse,
  GetMyReviewsParams,
} from "@/domain/models/CompanyReview";

export class CompanyReviewService {

  constructor(private readonly repo: ICompanyReviewRepository) {}

  // ─── Public ──────────────────────────────────────────────────────────────

  listReviews(
    companyId: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<CompanyReview>> {
    return this.repo.getCompanyReviews(companyId, page, size);
  }

  getStats(companyId: string): Promise<ReviewStats> {
    return this.repo.getCompanyReviewStats(companyId);
  }

  // ─── Candidate ───────────────────────────────────────────────────────────

  getMyReviews(params: GetMyReviewsParams = {}): Promise<MyReviewsResponse> {
    return this.repo.getMyReviews(params);
  }

  createReview(companyId: string, data: CreateReviewRequest): Promise<CompanyReview> {
    if (data.rating < 1 || data.rating > 5) throw new Error("Đánh giá sao từ 1-5");
    if (!data.content?.trim()) throw new Error("Nội dung đánh giá không được để trống");
    return this.repo.createReview(companyId, data);
  }

  updateReview(
    companyId: string,
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<CompanyReview> {
    if (data.rating < 1 || data.rating > 5) throw new Error("Đánh giá sao từ 1-5");
    if (!data.content?.trim()) throw new Error("Nội dung đánh giá không được để trống");
    return this.repo.updateReview(companyId, reviewId, data);
  }

  deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.repo.deleteReview(companyId, reviewId);
  }

  // ─── Employer ────────────────────────────────────────────────────────────

  approveReview(reviewId: string): Promise<CompanyReview> {
    return this.repo.approveReview(reviewId);
  }

  rejectReview(reviewId: string, reason: string): Promise<CompanyReview> {
    if (!reason?.trim()) throw new Error("Lý do từ chối không được để trống");
    return this.repo.rejectReview(reviewId, reason);
  }
}