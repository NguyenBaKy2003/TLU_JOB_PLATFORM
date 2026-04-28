// src/domain/repositories/ICompanyRepository.ts

import type {
  CompanyProfile,
  CompanyReview,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CreateReviewPayload,
  CompanyListParams,
  PageResponse,
   TeamMember,
  GalleryImage,
  CompanyDocument,
  CreateTeamMemberPayload,
  UpdateTeamMemberPayload,
  CompanyDocumentType,
} from "@/domain/models/Company";

export interface ICompanyRepository {

  // ── Public ────────────────────────────────────────────────────────────────

  /** Danh sách công ty đã xác thực (có phân trang) */
  listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>>;

  /** Chi tiết công ty theo ID */
  getById(id: string): Promise<CompanyProfile>;

  /** Chi tiết công ty theo slug */
  getBySlug(slug: string): Promise<CompanyProfile>;

  // ── Employer ──────────────────────────────────────────────────────────────

  /** Hồ sơ công ty của employer đang đăng nhập */
  getMyCompany(): Promise<CompanyProfile>;

  /** Tạo hồ sơ công ty */
  create(payload: CreateCompanyPayload): Promise<CompanyProfile>;

  /** Cập nhật hồ sơ công ty (PATCH — chỉ gửi fields thay đổi) */
  update(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile>;

  /**
   * Upload logo công ty.
   * Backend xác định công ty qua JWT token — không cần truyền id.
   */
  uploadLogo(file: File): Promise<CompanyProfile>;

  /**
   * Upload ảnh bìa công ty.
   * Backend xác định công ty qua JWT token — không cần truyền id.
   */
  uploadCover(file: File): Promise<CompanyProfile>;

  // ── Reviews ───────────────────────────────────────────────────────────────

  /** Danh sách review của công ty */
  listReviews(companyId: string, page?: number, size?: number): Promise<PageResponse<CompanyReview>>;

  /** Viết review */
  createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview>;

  /** Xóa review */
  deleteReview(companyId: string, reviewId: string): Promise<void>;

  // ── Admin ─────────────────────────────────────────────────────────────────

  /** [ADMIN] Danh sách công ty theo trạng thái */
  adminList(status: string, page?: number, size?: number): Promise<PageResponse<CompanyProfile>>;

  /** [ADMIN] Duyệt xác thực */
  adminVerify(id: string): Promise<CompanyProfile>;

  /** [ADMIN] Từ chối xác thực */
  adminReject(id: string, reason: string): Promise<CompanyProfile>;

  /** [ADMIN] Khoá công ty */
  adminSuspend(id: string): Promise<CompanyProfile>;

  /** [ADMIN] Ẩn review */
  adminHideReview(reviewId: string): Promise<void>;



  /** Danh sách thành viên đội ngũ (public - chỉ thấy visible=true) */
  listTeamMembers(companyId: string): Promise<TeamMember[]>;

  /** Thêm thành viên đội ngũ */
  addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember>;

  /** Cập nhật thành viên đội ngũ */
  updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember>;

  /** Upload avatar cho thành viên */
  uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember>;

  /** Xoá thành viên đội ngũ */
  deleteTeamMember(memberId: string): Promise<void>;

  // ── Gallery ───────────────────────────────────────────────────────────────

  /** Danh sách ảnh gallery */
  listGallery(companyId: string): Promise<GalleryImage[]>;

  /** Thêm ảnh vào gallery */
  addGalleryImage(file: File, caption?: string): Promise<GalleryImage[]>;

  /** Xoá ảnh gallery */
  deleteGalleryImage(imageId: string): Promise<void>;

  // ── Documents ─────────────────────────────────────────────────────────────

  /** Danh sách tài liệu (chỉ owner/admin) */
  listDocuments(): Promise<CompanyDocument[]>;

  /** Upload tài liệu xác thực */
  uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument>;

  /** Xoá tài liệu (nếu cần) */
  deleteDocument(documentId: string): Promise<void>;
}