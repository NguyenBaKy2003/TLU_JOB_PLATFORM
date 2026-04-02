// src/application/services/CompanyService.ts

import type { ICompanyRepository }     from "@/domain/repositories/ICompanyRepository";
import type {
  CompanyProfile,
  CompanyReview,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CreateReviewPayload,
  CompanyListParams,
  PageResponse,
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

  /** Upload logo công ty */
  uploadLogo(id: string, file: File): Promise<CompanyProfile> {
    return this.repo.uploadLogo(id, file);
  }

  /** Upload ảnh bìa */
  uploadCover(id: string, file: File): Promise<CompanyProfile> {
    return this.repo.uploadCover(id, file);
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
}