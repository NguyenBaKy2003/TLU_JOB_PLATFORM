// D:\TLU_JOB_PLATFORM\frontend\src\application\services\AdminReviewService.ts

import type { IAdminReviewRepository } from "@/domain/repositories/IAdminReviewRepository";
import type { CompanyReview, PageResponse, ReviewStatus } from "@/domain/models/CompanyReview";

export class AdminReviewService {
  constructor(private readonly repo: IAdminReviewRepository) {}

  /** GET /api/v1/admin/reviews?status=&page=&size= */
  getAllReviews(page = 0, size = 10, status?: ReviewStatus): Promise<PageResponse<CompanyReview>> {
    return this.repo.adminGetAllReviews(page, size, status);
  }

  /** GET /api/v1/admin/reviews/pending */
  getPendingReviews(page = 0, size = 10): Promise<PageResponse<CompanyReview>> {
    return this.repo.adminGetPendingReviews(page, size);
  }

  /** GET /api/v1/admin/reviews/{id} */
  getReviewDetail(reviewId: string): Promise<CompanyReview> {
    return this.repo.adminGetReviewDetail(reviewId);
  }

  /** PUT /api/v1/admin/reviews/{id}/approve */
  approveReview(reviewId: string): Promise<CompanyReview> {
    return this.repo.adminApproveReview(reviewId);
  }

  /** PUT /api/v1/admin/reviews/{id}/reject */
  rejectReview(reviewId: string, reason: string): Promise<CompanyReview> {
    if (!reason?.trim()) throw new Error("Vui lòng nhập lý do từ chối");
    return this.repo.adminRejectReview(reviewId, reason);
  }

  /** PATCH /api/v1/admin/reviews/{id}/hide */
  hideReview(reviewId: string): Promise<void> {
    return this.repo.adminHideReview(reviewId);
  }

  /** PATCH /api/v1/admin/reviews/{id}/show */
  showReview(reviewId: string): Promise<void> {
    return this.repo.adminShowReview(reviewId);
  }

  /** DELETE /api/v1/admin/reviews/{id} */
  deleteReview(reviewId: string): Promise<void> {
    return this.repo.adminDeleteReview(reviewId);
  }
}