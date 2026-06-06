// D:\TLU_JOB_PLATFORM\frontend\src\infrastructure\repositories\AdminReviewRepository.ts

import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminReviewRepository } from "@/domain/repositories/IAdminReviewRepository";
import type { CompanyReview, PageResponse, ReviewStatus } from "@/domain/models/CompanyReview";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

function adminCfg(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
function adminBlobConfig() {
  const token = getAdminAccessToken();
  return {
    responseType: "blob" as const,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
export class AdminReviewRepository implements IAdminReviewRepository {
  private readonly BASE = "/admin/reviews";

  async adminGetAllReviews(page = 0, size = 10, status?: ReviewStatus): Promise<PageResponse<CompanyReview>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    const res = await api.get<ApiResponse<PageResponse<CompanyReview>>>(this.BASE, adminCfg(params));
    return res.data.data;
  }

  async adminGetPendingReviews(page = 0, size = 10): Promise<PageResponse<CompanyReview>> {
    const res = await api.get<ApiResponse<PageResponse<CompanyReview>>>(`${this.BASE}/pending`, adminCfg({ page, size }));
    return res.data.data;
  }

  async adminGetReviewDetail(reviewId: string): Promise<CompanyReview> {
    const res = await api.get<ApiResponse<CompanyReview>>(`${this.BASE}/${reviewId}`, adminCfg());
    return res.data.data;
  }

  async adminApproveReview(reviewId: string): Promise<CompanyReview> {
    const res = await api.put<ApiResponse<CompanyReview>>(`${this.BASE}/${reviewId}/approve`, null, adminCfg());
    return res.data.data;
  }

  async adminRejectReview(reviewId: string, reason: string): Promise<CompanyReview> {
    const res = await api.put<ApiResponse<CompanyReview>>(`${this.BASE}/${reviewId}/reject`, { reason }, adminCfg());
    return res.data.data;
  }

  async adminHideReview(reviewId: string): Promise<void> {
    await api.patch(`${this.BASE}/${reviewId}/hide`, null, adminCfg());
  }

  async adminShowReview(reviewId: string): Promise<void> {
    await api.patch(`${this.BASE}/${reviewId}/show`, null, adminCfg());
  }

  async adminDeleteReview(reviewId: string): Promise<void> {
    await api.delete(`${this.BASE}/${reviewId}`, adminCfg());
  }

async exportExcel(status?: ReviewStatus): Promise<Blob> {
  const params: Record<string, unknown> = {};

  if (status) {
    params.status = status;
  }

  const res = await api.get<Blob>(
    `${this.BASE}/export/excel`,
    {
      ...adminBlobConfig(),
      params,
    }
  );

  return res.data;
}

async exportPdf(status?: ReviewStatus): Promise<Blob> {
  const params: Record<string, unknown> = {};

  if (status) {
    params.status = status;
  }

  const res = await api.get<Blob>(
    `${this.BASE}/export/pdf`,
    {
      ...adminBlobConfig(),
      params,
    }
  );

  return res.data;
}
}