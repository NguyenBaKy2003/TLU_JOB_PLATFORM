// src/application/services/CompanyService.ts

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

export class CompanyService {

  constructor(private readonly repo: ICompanyRepository) {}

  // ── Public ────────────────────────────────────────────────────────────────

  /** Danh sách công ty đã xác thực — dùng trên trang /companies */
  listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>> {
    return this.repo.listVerified(params);
  }

  /** Chi tiết công ty theo ID — dùng trên trang /companies/[id] */
  getById(id: string): Promise<CompanyProfile> {
    return this.repo.getById(id);
  }

  /** Chi tiết công ty theo slug — dùng khi navigate từ URL đẹp */
  getBySlug(slug: string): Promise<CompanyProfile> {
    return this.repo.getBySlug(slug);
  }

  // ── Employer ──────────────────────────────────────────────────────────────

  /** Hồ sơ công ty của employer đang đăng nhập */
  getMyCompany(): Promise<CompanyProfile> {
    return this.repo.getMyCompany();
  }

  /** Tạo hồ sơ công ty mới (sau khi đăng ký employer) */
  createCompany(payload: CreateCompanyPayload): Promise<CompanyProfile> {
    return this.repo.create(payload);
  }

  /** Cập nhật thông tin công ty */
  updateCompany(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile> {
    return this.repo.update(id, payload);
  }

  /**
   * Upload logo công ty.
   * Backend xác định công ty qua JWT token — không cần truyền id.
   */
  uploadLogo(file: File): Promise<CompanyProfile> {
    return this.repo.uploadLogo(file);
  }

  /**
   * Upload ảnh bìa công ty.
   * Backend xác định công ty qua JWT token — không cần truyền id.
   */
  uploadCover(file: File): Promise<CompanyProfile> {
    return this.repo.uploadCover(file);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  /** Danh sách review của công ty — dùng trên tab "Tổng quan" */
  listReviews(
    companyId: string,
    page = 0,
    size = 10,
  ): Promise<PageResponse<CompanyReview>> {
    return this.repo.listReviews(companyId, page, size);
  }

  /** Viết review cho công ty */
  createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview> {
    return this.repo.createReview(companyId, payload);
  }

  /** Xóa review (chủ review hoặc admin) */
  deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.repo.deleteReview(companyId, reviewId);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  /** [ADMIN] Danh sách công ty chờ duyệt */
  adminListPending(page = 0, size = 20): Promise<PageResponse<CompanyProfile>> {
    return this.repo.adminList("UNVERIFIED", page, size);
  }

  /** [ADMIN] Danh sách theo trạng thái bất kỳ */
  adminListByStatus(
    status: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<CompanyProfile>> {
    return this.repo.adminList(status, page, size);
  }

  /** [ADMIN] Duyệt xác thực công ty */
  adminVerify(id: string): Promise<CompanyProfile> {
    return this.repo.adminVerify(id);
  }

  /** [ADMIN] Từ chối xác thực */
  adminReject(id: string, reason: string): Promise<CompanyProfile> {
    return this.repo.adminReject(id, reason);
  }

  /** [ADMIN] Khoá công ty */
  adminSuspend(id: string): Promise<CompanyProfile> {
    return this.repo.adminSuspend(id);
  }

  /** [ADMIN] Ẩn review vi phạm */
  adminHideReview(reviewId: string): Promise<void> {
    return this.repo.adminHideReview(reviewId);
  }
 // ── Team Members ─────────────────────────────────────────────────────────

  listTeamMembers(companyId: string): Promise<TeamMember[]> {
    return this.repo.listTeamMembers(companyId);
  }

  addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember> {
    return this.repo.addTeamMember(payload);
  }

  updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember> {
    return this.repo.updateTeamMember(memberId, payload);
  }

  uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember> {
    return this.repo.uploadTeamMemberAvatar(memberId, file);
  }

  deleteTeamMember(memberId: string): Promise<void> {
    return this.repo.deleteTeamMember(memberId);
  }

  // ── Gallery ───────────────────────────────────────────────────────────────

  listGallery(companyId: string): Promise<GalleryImage[]> {
    return this.repo.listGallery(companyId);
  }

addGalleryImage(file: File, caption?: string): Promise<GalleryImage[]> {
    return this.repo.addGalleryImage(file, caption);
}

  deleteGalleryImage(imageId: string): Promise<void> {
    return this.repo.deleteGalleryImage(imageId);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  listDocuments(): Promise<CompanyDocument[]> {
    return this.repo.listDocuments();
  }

  uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument> {
    return this.repo.uploadDocument(type, file);
  }

  deleteDocument(documentId: string): Promise<void> {
    return this.repo.deleteDocument(documentId);
  }

  // ── Helper: Kiểm tra xem user có thể thấy documents không ────────────────

  /**
   * Kiểm tra xem current user có thể xem documents của công ty không
   * Dựa trên verification status hoặc role
   */
  canViewDocuments(company: CompanyProfile, currentUserId?: string): boolean {
    // Admin xem được tất cả
    
    // Owner xem được của chính mình
    if (currentUserId && company.ownerId === currentUserId) return true;
    
    // Public chỉ xem được nếu verified (không có documents)
    return false;
  }


}