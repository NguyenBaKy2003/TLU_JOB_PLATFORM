// src/domain/models/Company.ts

export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export type CompanyDocumentType =
  | "BUSINESS_LICENSE"
  | "TAX_CERTIFICATE"
  | "REGISTRATION_CERT"
  | "LEGAL_REPRESENTATIVE_ID"
  | "OPERATING_LICENSE"
  | "OTHER";

export type CompanySize =
  | "UNKNOWN"
  | "STARTUP"
  | "SMALL"
  | "MEDIUM"
  | "LARGE"
  | "ENTERPRISE"
  | "CORPORATION";

export type CompanyPlanCode =
  | "FREE_COMPANY"
  | "STARTER"
  | "BUSINESS"
  | "ENTERPRISE";

export interface TeamMember {
  id: string;
  fullName: string;
  jobTitle: string;
  bio: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  displayOrder: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
}

export interface CompanyDocument {
  id: string;
  type: CompanyDocumentType;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface CompanyProfile {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  size: CompanySize | null;
  sizeLabel: string | null;
  foundedYear: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  canPostJobs: boolean;
  verifiedAt: string | null;
  createdAt: string;
  activeJobCount: number | null;
  averageRating: number | null;
  reviewCount: number | null;
  planCode: CompanyPlanCode | null;
  teamMembers?: TeamMember[];
  gallery?: GalleryImage[];
  documents?: CompanyDocument[];
}

export function isPaidPlan(planCode: CompanyPlanCode | null | undefined): boolean {
  return planCode === "STARTER" || planCode === "BUSINESS" || planCode === "ENTERPRISE";
}

export const PLAN_BADGE_CONFIG: Record<
  Exclude<CompanyPlanCode, "FREE_COMPANY">,
  { label: string; bg: string; text: string; border: string }
> = {
  STARTER:    { label: "Starter",    bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200"   },
  BUSINESS:   { label: "Business",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  ENTERPRISE: { label: "Enterprise", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

/** Mapping CompanySize enum → label hiển thị */
export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  UNKNOWN:     "Chưa xác định",
  STARTUP:     "Startup (< 10)",
  SMALL:       "Nhỏ (10–49)",
  MEDIUM:      "Vừa (50–199)",
  LARGE:       "Lớn (200–999)",
  ENTERPRISE:  "Doanh nghiệp (1000+)",
  CORPORATION: "Tập đoàn",
};

export interface CreateCompanyPayload {
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size?: CompanySize;
  foundedYear?: number;
}

export interface UpdateCompanyPayload {
  name?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size?: CompanySize;
  foundedYear?: number;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface CreateTeamMemberPayload {
  fullName: string;
  jobTitle: string;
  bio?: string;
  linkedinUrl?: string;
  displayOrder?: number;
}

export interface UpdateTeamMemberPayload {
  fullName?: string;
  jobTitle?: string;
  bio?: string;
  linkedinUrl?: string;
  displayOrder?: number;
}

export interface AddGalleryImagePayload {
  file: File;
  caption?: string;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  content: string;
  pros?: string;
  cons?: string;
  anonymous?: boolean;
  employed?: boolean;
}

/**
 * Params cho GET /api/v1/companies — tất cả optional.
 * Không truyền gì = trả toàn bộ VERIFIED sort theo plan tier.
 */
export interface CompanyListParams {
  page?:      number;
  size?:      number;
  keyword?:   string;           // tìm tên / mô tả / ngành
  city?:      string;           // lọc thành phố
  size_?:     CompanySize;      // lọc quy mô (đổi tên để tránh trùng với page size)
  planCode?:  CompanyPlanCode;  // lọc plan
  minRating?: number;           // đánh giá tối thiểu 1–5
  pageSize?:  number;           // alias cho size (dùng trong controller BE)
}

export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
}

export interface CompanyReview {
  id:         string;
  companyId:  string;
  reviewerId: string;
  rating:     number;
  title:      string | null;
  content:    string;
  pros:       string | null;
  cons:       string | null;
  anonymous:  boolean;
  visible:    boolean;
  employed:   boolean;
  createdAt:  string;
  updatedAt:  string;
}