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
import type { JobPost } from "@/domain/models/Job";

export interface ICompanyRepository {

  // ── Public ────────────

  listVerified(params?: CompanyListParams): Promise<PageResponse<CompanyProfile>>;
  getById(id: string): Promise<CompanyProfile>;
  getBySlug(slug: string): Promise<CompanyProfile>;

  /** GET /api/v1/companies/{id}/jobs — chỉ PUBLISHED, phân trang */
  getJobsByCompany(
    companyId: string,
    page?: number,
    size?: number,
  ): Promise<PageResponse<JobPost>>;   // ← fix: PageResponse<JobPost>, không phải JobPost

  // ── Employer ──────────

  getMyCompany(): Promise<CompanyProfile>;
  create(payload: CreateCompanyPayload): Promise<CompanyProfile>;
  update(id: string, payload: UpdateCompanyPayload): Promise<CompanyProfile>;
  uploadLogo(file: File): Promise<CompanyProfile>;
  uploadCover(file: File): Promise<CompanyProfile>;

  // ── Reviews ───────────

  listReviews(companyId: string, page?: number, size?: number): Promise<PageResponse<CompanyReview>>;
  createReview(companyId: string, payload: CreateReviewPayload): Promise<CompanyReview>;
  deleteReview(companyId: string, reviewId: string): Promise<void>;

  // ── Admin ─────────────

  adminList(status: string, page?: number, size?: number): Promise<PageResponse<CompanyProfile>>;
  adminVerify(id: string): Promise<CompanyProfile>;
  adminReject(id: string, reason: string): Promise<CompanyProfile>;
  adminSuspend(id: string): Promise<CompanyProfile>;
  adminHideReview(reviewId: string): Promise<void>;

  // ── Team members ──────

  listTeamMembers(companyId: string): Promise<TeamMember[]>;
  addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember>;
  updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload): Promise<TeamMember>;
  uploadTeamMemberAvatar(memberId: string, file: File): Promise<TeamMember>;
  deleteTeamMember(memberId: string): Promise<void>;

  // ── Gallery ───────────

  listGallery(companyId: string): Promise<GalleryImage[]>;
  addGalleryImage(file: File, caption?: string): Promise<GalleryImage[]>;
  deleteGalleryImage(imageId: string): Promise<void>;

  // ── Documents ─────────

  listDocuments(): Promise<CompanyDocument[]>;
  uploadDocument(type: CompanyDocumentType, file: File): Promise<CompanyDocument>;
  deleteDocument(documentId: string): Promise<void>;
}