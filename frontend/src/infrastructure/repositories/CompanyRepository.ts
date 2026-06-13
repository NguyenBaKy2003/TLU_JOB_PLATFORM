// src/infrastructure/repositories/CompanyRepository.ts

import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import type {
  CompanyProfile, CompanyReview, CompanyListParams, PageResponse,
  CreateCompanyPayload, UpdateCompanyPayload, CreateReviewPayload,
  TeamMember, CreateTeamMemberPayload, UpdateTeamMemberPayload,
  GalleryImage, CompanyDocument, CompanyDocumentType,
} from "@/domain/models/Company";
import type { JobPost } from "@/domain/models/Job";
import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class CompanyRepository implements ICompanyRepository {

  // ── Helpers ───────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body ?? null, { params });
    return res.data.data;
  }

  private async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patchMultipart<T>(url: string, file: File, fieldName = "file"): Promise<T> {
    const form = new FormData();
    form.append(fieldName, file);
    const res = await api.patch<ApiResponse<T>>(url, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── Public ────────

  /**
   * GET /api/v1/companies
   * Map CompanyListParams → query params mà backend SearchCompaniesUseCase nhận.
   * Backend param name: keyword, city, size (quy mô), planCode, minRating, page, pageSize.
   */
  async listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>> {
    const query: Record<string, unknown> = {};
    if (params?.page      != null) query.page      = params.page;
    if (params?.pageSize  != null) query.pageSize  = params.pageSize;
    if (params?.size      != null) query.pageSize  = params.size;   // alias
    if (params?.keyword)           query.keyword   = params.keyword;
    if (params?.city)              query.city      = params.city;
    if (params?.size_)             query.size      = params.size_;  // CompanySize enum
    if (params?.planCode)          query.planCode  = params.planCode;
    if (params?.minRating != null) query.minRating = params.minRating;
    return this.get(`/companies`, query);
  }

  async getById(id: string): Promise<CompanyProfile> {
    return this.get(`/companies/${id}`);
  }

  async getBySlug(slug: string): Promise<CompanyProfile> {
    return this.get(`/companies/slug/${slug}`);
  }

  async getJobsByCompany(companyId: string, page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.get(`/companies/${companyId}/jobs`, { page, size });
  }

  // ── Employer ──────

  async getMyCompany(): Promise<CompanyProfile> {
    return this.get(`/companies/my`);
  }

  async create(payload: CreateCompanyPayload): Promise<CompanyProfile> {
    return this.post(`/companies`, payload);
  }

  async update(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile> {
    return this.patch(`/companies/${id}`, payload);
  }

  async uploadLogo(file: File): Promise<CompanyProfile> {
    return this.patchMultipart(`/companies/logo`, file);
  }

  async uploadCover(file: File): Promise<CompanyProfile> {
    return this.patchMultipart(`/companies/cover`, file);
  }

  // ── Reviews ───────

  async listReviews(companyId: string, page = 0, size = 10): Promise<PageResponse<CompanyReview>> {
    return this.get(`/companies/${companyId}/reviews`, { page, size });
  }

  async createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview> {
    return this.post(`/companies/${companyId}/reviews`, payload);
  }

  async deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.del(`/companies/${companyId}/reviews/${reviewId}`);
  }

  // ── Admin ─────────

  async adminList(status = "UNVERIFIED", page = 0, size = 20): Promise<PageResponse<CompanyProfile>> {
    return this.get(`/admin/companies`, { status, page, size });
  }

  async adminVerify(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/verify`);
  }

  async adminReject(id: string, reason: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/reject`, undefined, { reason });
  }

  async adminSuspend(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/suspend`);
  }

  async adminHideReview(reviewId: string): Promise<void> {
    await api.patch(`/admin/reviews/${reviewId}/hide`);
  }

  // ── Team members ──

  async listTeamMembers(companyId: string): Promise<TeamMember[]> {
    const company = await this.getById(companyId);
    return company.teamMembers ?? [];
  }

  async addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember> {
    return this.post(`/companies/team`, payload);
  }

  async updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember> {
    return this.patch(`/companies/team/${memberId}`, payload);
  }

  async uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember> {
    return this.patchMultipart(`/companies/team/${memberId}/avatar`, file);
  }

  async deleteTeamMember(memberId: string): Promise<void> {
    return this.del(`/companies/team/${memberId}`);
  }

  // ── Gallery ───────

  async listGallery(companyId: string): Promise<GalleryImage[]> {
    return this.get(`/companies/${companyId}/gallery`);
  }

  async addGalleryImage(file: File, caption?: string): Promise<GalleryImage[]> {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    const res = await api.post<ApiResponse<GalleryImage[]>>(`/companies/gallery`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async deleteGalleryImage(imageId: string): Promise<void> {
    return this.del(`/companies/gallery/${imageId}`);
  }

  // ── Documents ─────

  async listDocuments(): Promise<CompanyDocument[]> {
    return this.get(`/companies/documents`);
  }

  async uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument> {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    const res = await api.post<ApiResponse<CompanyDocument>>(`/companies/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    return this.del(`/companies/documents/${documentId}`);
  }
}