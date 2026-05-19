// D:\TLU_JOB_PLATFORM\frontend\src\application\services\CompanyReviewService.ts

import type { ICompanyReviewRepository } from "@/domain/repositories/ICompanyReviewRepository";
import type {
  CompanyReview,
  ReviewStats,
  CreateReviewRequest,
  UpdateReviewRequest,
  PageResponse,
  ReviewStatus,
} from "@/domain/models/CompanyReview";

export class CompanyReviewService {

  constructor(private readonly repo: ICompanyReviewRepository) {}

  // ─── Public ───

  /** Danh sách review đã duyệt của công ty */
  listReviews(
    companyId: string,
    page: number = 0,
    size: number = 10,
  ): Promise<PageResponse<CompanyReview>> {
    return this.repo.getCompanyReviews(companyId, page, size);
  }

  /** Thống kê đánh giá của công ty */
  getStats(companyId: string): Promise<ReviewStats> {
    return this.repo.getCompanyReviewStats(companyId);
  }

  // ─── Candidate ───

  /** Danh sách review của tôi */
  getMyReviews(
    page: number = 0,
    size: number = 10,
    status?: ReviewStatus,
  ): Promise<PageResponse<CompanyReview>> {
    return this.repo.getMyReviews(page, size, status);
  }

  /** Viết review mới */
  createReview(companyId: string, data: CreateReviewRequest): Promise<CompanyReview> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Đánh giá sao từ 1-5");
    }
    if (!data.content?.trim()) {
      throw new Error("Nội dung đánh giá không được để trống");
    }
    return this.repo.createReview(companyId, data);
  }

  /** Cập nhật review */
  updateReview(
    companyId: string,
    reviewId: string,
    data: UpdateReviewRequest,
  ): Promise<CompanyReview> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Đánh giá sao từ 1-5");
    }
    if (!data.content?.trim()) {
      throw new Error("Nội dung đánh giá không được để trống");
    }
    return this.repo.updateReview(companyId, reviewId, data);
  }

  /** Xóa review */
  deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.repo.deleteReview(companyId, reviewId);
  }
}