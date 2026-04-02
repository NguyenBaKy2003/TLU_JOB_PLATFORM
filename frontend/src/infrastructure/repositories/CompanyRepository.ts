// src/infrastructure/repositories/CompanyRepository.ts

import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import type {
  CompanyProfile,
  CompanyReview,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CreateReviewPayload,
  CompanyListParams,
  PageResponse,
} from "@/domain/models/Company";
import api from "@/lib/axios";

// Response wrapper từ backend: { success, data, message }
interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class CompanyRepository implements ICompanyRepository {


  // ── Helpers ────────────────────────────────────────────────────────────────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── Public ─────────────────────────────────────────────────────────────────

  async listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>> {
    return this.get(`/companies`, params as Record<string, unknown>);
  }

  async getById(id: string): Promise<CompanyProfile> {
    return this.get(`/companies/${id}`);
  }

  async getBySlug(slug: string): Promise<CompanyProfile> {
    return this.get(`/companies/slug/${slug}`);
  }

  // ── Employer ───────────────────────────────────────────────────────────────

  async getMyCompany(): Promise<CompanyProfile> {
    return this.get(`/companies/my`);
  }

  async create(payload: CreateCompanyPayload): Promise<CompanyProfile> {
    return this.post(`/companies`, payload);
  }

  async update(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile> {
    return this.patch(`/companies/${id}`, payload);
  }

  async uploadLogo(id: string, file: File): Promise<CompanyProfile> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ApiResponse<CompanyProfile>>(
      `/companies/${id}/logo`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  }

  async uploadCover(id: string, file: File): Promise<CompanyProfile> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ApiResponse<CompanyProfile>>(
      `/companies/${id}/cover`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async listReviews(
    companyId: string,
    page = 0,
    size = 10,
  ): Promise<PageResponse<CompanyReview>> {
    return this.get(`/companies/${companyId}/reviews`, { page, size });
  }

  async createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview> {
    return this.post(`/companies/${companyId}/reviews`, payload);
  }

  async deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.del(`/companies/${companyId}/reviews/${reviewId}`);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  async adminList(
    status = "UNVERIFIED",
    page = 0,
    size = 20,
  ): Promise<PageResponse<CompanyProfile>> {
    return this.get(`/admin/companies`, { status, page, size });
  }

  async adminVerify(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/verify`);
  }

  async adminReject(id: string, reason: string): Promise<CompanyProfile> {
    const res = await api.post<ApiResponse<CompanyProfile>>(
      `/admin/companies/${id}/reject`,
      null,
      { params: { reason } },
    );
    return res.data.data;
  }

  async adminSuspend(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/suspend`);
  }

  async adminHideReview(reviewId: string): Promise<void> {
    await api.patch(`/admin/reviews/${reviewId}/hide`);
  }
}