// src/application/services/CompanyService.ts

import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import type {
  CompanyProfile, CompanyReview, CompanyListParams, PageResponse,
  CreateCompanyPayload, UpdateCompanyPayload, CreateReviewPayload,
  TeamMember, CreateTeamMemberPayload, UpdateTeamMemberPayload,
  GalleryImage, CompanyDocument, CompanyDocumentType,
  CompanySize, CompanyPlanCode,
} from "@/domain/models/Company";
import type { JobPost } from "@/domain/models/Job";

export class CompanyService {

  constructor(private readonly repo: ICompanyRepository) {}

  // ── Public ────────────────────────────────────────────────────────────────

  /**
   * Danh sách / tìm kiếm công ty VERIFIED — sort plan tier (ENTERPRISE→FREE).
   * Không truyền params = trả toàn bộ.
   */
  listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>> {
    return this.repo.listVerified(params);
  }

  /**
   * Tìm kiếm đa điều kiện — wrapper tiện dùng hơn listVerified.
   * Tất cả filter đều optional.
   */
  search(opts: {
    keyword?:   string;
    city?:      string;
    size?:      CompanySize;
    planCode?:  CompanyPlanCode;
    minRating?: number;
    page?:      number;
    pageSize?:  number;
  }): Promise<PageResponse<CompanyProfile>> {
    return this.repo.listVerified({
      keyword:   opts.keyword,
      city:      opts.city,
      size_:     opts.size,
      planCode:  opts.planCode,
      minRating: opts.minRating,
      page:      opts.page ?? 0,
      pageSize:  opts.pageSize ?? 12,
    });
  }

  getById(id: string): Promise<CompanyProfile> {
    return this.repo.getById(id);
  }

  getBySlug(slug: string): Promise<CompanyProfile> {
    return this.repo.getBySlug(slug);
  }

  getJobsByCompany(companyId: string, page = 0, size = 10): Promise<PageResponse<JobPost>> {
    return this.repo.getJobsByCompany(companyId, page, size);
  }

  // ── Employer ──────────────────────────────────────────────────────────────

  getMyCompany(): Promise<CompanyProfile> {
    return this.repo.getMyCompany();
  }

  createCompany(payload: CreateCompanyPayload): Promise<CompanyProfile> {
    return this.repo.create(payload);
  }

  updateCompany(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile> {
    return this.repo.update(id, payload);
  }

  uploadLogo(file: File): Promise<CompanyProfile> {
    return this.repo.uploadLogo(file);
  }

  uploadCover(file: File): Promise<CompanyProfile> {
    return this.repo.uploadCover(file);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  listReviews(companyId: string, page = 0, size = 10): Promise<PageResponse<CompanyReview>> {
    return this.repo.listReviews(companyId, page, size);
  }

  createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview> {
    return this.repo.createReview(companyId, payload);
  }

  deleteReview(companyId: string, reviewId: string): Promise<void> {
    return this.repo.deleteReview(companyId, reviewId);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminListPending(page = 0, size = 20): Promise<PageResponse<CompanyProfile>> {
    return this.repo.adminList("UNVERIFIED", page, size);
  }

  adminListByStatus(status: string, page = 0, size = 20): Promise<PageResponse<CompanyProfile>> {
    return this.repo.adminList(status, page, size);
  }

  adminVerify(id: string): Promise<CompanyProfile>                  { return this.repo.adminVerify(id); }
  adminReject(id: string, reason: string): Promise<CompanyProfile>  { return this.repo.adminReject(id, reason); }
  adminSuspend(id: string): Promise<CompanyProfile>                 { return this.repo.adminSuspend(id); }
  adminHideReview(reviewId: string): Promise<void>                  { return this.repo.adminHideReview(reviewId); }

  // ── Team members ──────────────────────────────────────────────────────────

  listTeamMembers(companyId: string): Promise<TeamMember[]>                                          { return this.repo.listTeamMembers(companyId); }
  addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember>                               { return this.repo.addTeamMember(payload); }
  updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember>          { return this.repo.updateTeamMember(memberId, payload); }
  uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember>                          { return this.repo.uploadTeamMemberAvatar(memberId, file); }
  deleteTeamMember(memberId: string): Promise<void>                                                  { return this.repo.deleteTeamMember(memberId); }

  // ── Gallery ───────────────────────────────────────────────────────────────

  listGallery(companyId: string): Promise<GalleryImage[]>                   { return this.repo.listGallery(companyId); }
  addGalleryImage(file: File, caption?: string): Promise<GalleryImage[]>    { return this.repo.addGalleryImage(file, caption); }
  deleteGalleryImage(imageId: string): Promise<void>                        { return this.repo.deleteGalleryImage(imageId); }

  // ── Documents ─────────────────────────────────────────────────────────────

  listDocuments(): Promise<CompanyDocument[]>                                        { return this.repo.listDocuments(); }
  uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument>    { return this.repo.uploadDocument(type, file); }
  deleteDocument(documentId: string): Promise<void>                                  { return this.repo.deleteDocument(documentId); }

  canViewDocuments(company: CompanyProfile, currentUserId?: string): boolean {
    if (currentUserId && company.ownerId === currentUserId) return true;
    return false;
  }
}