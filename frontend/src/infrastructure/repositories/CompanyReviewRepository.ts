// D:\TLU_JOB_PLATFORM\frontend\src\infrastructure\repositories\CompanyReviewRepository.ts

import api from "@/lib/axios";
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export class CompanyReviewRepository implements ICompanyReviewRepository {

  // ─── Public endpoints ────────────────────────────────────────────────────

  async getCompanyReviews(
    companyId: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<CompanyReview>> {
    const res = await api.get<ApiResponse<PageResponse<CompanyReview>>>(
      `/companies/${companyId}/reviews`,
      { params: { page, size } }
    );
    return res.data.data;
  }

  async getCompanyReviewStats(companyId: string): Promise<ReviewStats> {
    const res = await api.get<ApiResponse<ReviewStats>>(
      `/companies/${companyId}/reviews/stats`
    );
    return res.data.data;
  }

  // ─── Candidate endpoints ─────────────────────────────────────────────────

  async createReview(
    companyId: string,
    data: CreateReviewRequest
  ): Promise<CompanyReview> {
    const res = await api.post<ApiResponse<CompanyReview>>(
      `/companies/${companyId}/reviews`,
      data
    );
    return res.data.data;
  }

  async updateReview(
    companyId: string,
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<CompanyReview> {
    const res = await api.put<ApiResponse<CompanyReview>>(
      `/companies/${companyId}/reviews/${reviewId}`,
      data
    );
    return res.data.data;
  }

  async deleteReview(companyId: string, reviewId: string): Promise<void> {
    await api.delete(`/companies/${companyId}/reviews/${reviewId}`);
  }

  async getMyReviews(params: GetMyReviewsParams = {}): Promise<MyReviewsResponse> {
    const { page = 0, size = 12, status, keyword, createdAtFrom, createdAtTo } = params;

    const queryParams: Record<string, unknown> = { page, size };
    if (status)        queryParams.status        = status;
    if (keyword)       queryParams.keyword       = keyword;
    if (createdAtFrom) queryParams.createdAtFrom = createdAtFrom;
    if (createdAtTo)   queryParams.createdAtTo   = createdAtTo;

    const res = await api.get<ApiResponse<MyReviewsResponse>>(
      "/my-reviews",
      { params: queryParams }
    );
    return res.data.data;
  }

  // ─── Employer endpoints ──────────────────────────────────────────────────

  async approveReview(reviewId: string): Promise<CompanyReview> {
    const res = await api.put<ApiResponse<CompanyReview>>(
      `/company/reviews/${reviewId}/approve`
    );
    return res.data.data;
  }

  async rejectReview(reviewId: string, reason: string): Promise<CompanyReview> {
    const res = await api.put<ApiResponse<CompanyReview>>(
      `/company/reviews/${reviewId}/reject`,
      { reason }
    );
    return res.data.data;
  }
}