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
  TeamMember,
  CreateTeamMemberPayload,
  UpdateTeamMemberPayload,
  GalleryImage,
  CompanyDocument,
  CompanyDocumentType,
} from "@/domain/models/Company";
import api from "@/lib/axios";

// Response wrapper từ backend: { success, data, message }
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class CompanyRepository implements ICompanyRepository {

  // ── Helpers ────────────────────────────────────────────────────────────────

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

  // ── Public ─────────────────────────────────────────────────────────────────

  /** GET /api/v1/companies — Danh sách công ty đã xác thực */
  async listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>> {
    return this.get(`/companies`, params as Record<string, unknown>);
  }

  /** GET /api/v1/companies/{id} — Chi tiết công ty theo ID */
  async getById(id: string): Promise<CompanyProfile> {
    return this.get(`/companies/${id}`);
  }

  /** GET /api/v1/companies/slug/{slug} — Chi tiết công ty theo slug */
  async getBySlug(slug: string): Promise<CompanyProfile> {
    return this.get(`/companies/slug/${slug}`);
  }

  // ── Employer ───────────────────────────────────────────────────────────────

  /** GET /api/v1/companies/my — Hồ sơ công ty của tôi (EMPLOYER) */
  async getMyCompany(): Promise<CompanyProfile> {
    return this.get(`/companies/my`);
  }

  /** POST /api/v1/companies — Tạo hồ sơ công ty (EMPLOYER) */
  async create(payload: CreateCompanyPayload): Promise<CompanyProfile> {
    return this.post(`/companies`, payload);
  }

  /** PATCH /api/v1/companies/{id} — Cập nhật hồ sơ công ty (EMPLOYER/ADMIN) */
  async update(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile> {
    return this.patch(`/companies/${id}`, payload);
  }

  /**
   * PATCH /api/v1/companies/logo — Cập nhật logo (EMPLOYER)
   * Backend xác định công ty qua JWT token, không cần truyền id.
   */
  async uploadLogo(file: File): Promise<CompanyProfile> {
    return this.patchMultipart(`/companies/logo`, file);
  }

  /**
   * PATCH /api/v1/companies/cover — Cập nhật ảnh bìa (EMPLOYER)
   * Backend xác định công ty qua JWT token, không cần truyền id.
   */
  async uploadCover(file: File): Promise<CompanyProfile> {
    return this.patchMultipart(`/companies/cover`, file);
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  /** GET /api/v1/companies/{companyId}/reviews — Danh sách review (public) */
  async listReviews(
    companyId: string,
    page = 0,
    size = 10,
  ): Promise<PageResponse<CompanyReview>> {
    return this.get(`/companies/${companyId}/reviews`, { page, size });
  }

  /** POST /api/v1/companies/{companyId}/reviews — Viết review (CANDIDATE) */
  async createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview> {
    return this.post(`/companies/${companyId}/reviews`, payload);
  }

  /** DELETE /api/v1/companies/{companyId}/reviews/{reviewId} — Xóa review (owner/ADMIN) */
  async deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.del(`/companies/${companyId}/reviews/${reviewId}`);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin/companies?status=... — Danh sách theo trạng thái (ADMIN) */
  async adminList(
    status = "UNVERIFIED",
    page = 0,
    size = 20,
  ): Promise<PageResponse<CompanyProfile>> {
    return this.get(`/admin/companies`, { status, page, size });
  }

  /** POST /api/v1/admin/companies/{id}/verify — Duyệt xác thực (ADMIN) */
  async adminVerify(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/verify`);
  }

  /**
   * POST /api/v1/admin/companies/{id}/reject?reason=... — Từ chối xác thực (ADMIN)
   * Backend nhận `reason` qua @RequestParam, không phải request body.
   */
  async adminReject(id: string, reason: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/reject`, undefined, { reason });
  }

  /** POST /api/v1/admin/companies/{id}/suspend — Khoá công ty (ADMIN) */
  async adminSuspend(id: string): Promise<CompanyProfile> {
    return this.post(`/admin/companies/${id}/suspend`);
  }

  /** PATCH /api/v1/admin/reviews/{reviewId}/hide — Ẩn review vi phạm (ADMIN) */
  async adminHideReview(reviewId: string): Promise<void> {
    await api.patch(`/admin/reviews/${reviewId}/hide`);
  }


  async listTeamMembers(companyId: string): Promise<TeamMember[]> {
      const company = await this.getById(companyId);
      return company.teamMembers ?? [];
  }

  async addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember> {
    // POST /api/v1/companies/team
    return this.post(`/companies/team`, payload);
  }

  async updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember> {
    // PATCH /api/v1/companies/team/{memberId}
    return this.patch(`/companies/team/${memberId}`, payload);
  }

  async uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember> {
    // PATCH /api/v1/companies/team/{memberId}/avatar
    return this.patchMultipart(`/companies/team/${memberId}/avatar`, file);
  }

  async deleteTeamMember(memberId: string): Promise<void> {
    // DELETE /api/v1/companies/team/{memberId}
    return this.del(`/companies/team/${memberId}`);
  }

  // ── Gallery ───────────────────────────────────────────────────────────────

  async listGallery(companyId: string): Promise<GalleryImage[]> {
    // GET /api/v1/companies/{companyId}/gallery
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
    // DELETE /api/v1/companies/gallery/{imageId}
    return this.del(`/companies/gallery/${imageId}`);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  async listDocuments(): Promise<CompanyDocument[]> {
    // GET /api/v1/companies/documents
    return this.get(`/companies/documents`);
  }

  async uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument> {
    // POST /api/v1/companies/documents
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    
    const res = await api.post<ApiResponse<CompanyDocument>>(`/companies/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    // DELETE /api/v1/companies/documents/{documentId} (nếu backend có)
    return this.del(`/companies/documents/${documentId}`);
  }

}