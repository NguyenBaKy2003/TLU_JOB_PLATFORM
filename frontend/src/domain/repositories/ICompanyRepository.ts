// src/domain/repositories/ICompanyRepository.ts

import type {
  CompanyProfile,
  CompanyReview,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CreateReviewPayload,
  CompanyListParams,
  PageResponse,
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

  /** Upload logo */
  uploadLogo(id: string, file: File): Promise<CompanyProfile>;

  /** Upload cover image */
  uploadCover(id: string, file: File): Promise<CompanyProfile>;

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
}