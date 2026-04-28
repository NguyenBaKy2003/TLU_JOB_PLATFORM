// src/domain/models/Company.ts
// Types tương ứng với backend CompanyProfile + CompanyReview

// ── Enums ─────────────────────────────────────────────────────────────────────

export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED" | "SUSPENDED";


export type CompanyDocumentType = 
  | "BUSINESS_LICENSE"
  | "TAX_CERTIFICATE"
  | "REGISTRATION_CERT"
  | "LEGAL_REPRESENTATIVE_ID"
  | "OPERATING_LICENSE"
  | "OTHER";

export type CompanySize =
    "UNKNOWN"
  | "STARTUP"       // < 10
  | "SMALL"       // 10-49
  | "MEDIUM"      // 50-199
  | "LARGE"       // 200-999
  | "ENTERPRISE" // 1000+
  |"CORPORATION";

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

// ── Domain models ─────────────────────────────────────────────────────────────

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
  sizeLabel?: string | null;     
  foundedYear: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  canPostJobs: boolean;           
  verifiedAt: string | null;
  createdAt: string;
  
  // Fields chỉ có khi gọi API với quyền phù hợp
  teamMembers?: TeamMember[];
  gallery?: GalleryImage[];
  documents?: CompanyDocument[];    // Chỉ admin/owner mới thấy
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
export interface CompanyReview {
  id:         string;
  companyId:  string;
  reviewerId: string;
  rating:     number;      // 1-5
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

// ── Payloads (request bodies) ─────────────────────────────────────────────────

export interface CreateCompanyPayload {
  name:        string;
  description?: string;
  website?:    string;
  email?:      string;
  phone?:      string;
  address?:    string;
  city?:       string;
  country?:    string;
  industry?:   string;
  size?:       CompanySize;
  foundedYear?: number;
}

export interface UpdateCompanyPayload {
  name?:          string;
  description?:   string;
  website?:       string;
  email?:         string;
  phone?:         string;
  address?:       string;
  city?:          string;
  country?:       string;
  industry?:      string;
  size?:          CompanySize;
  foundedYear?:   number;
  logoUrl?:       string;
  coverImageUrl?: string;
}

export interface CreateReviewPayload {
  rating:     number;
  title?:     string;
  content:    string;
  pros?:      string;
  cons?:      string;
  anonymous?: boolean;
  employed?:  boolean;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface CompanyListParams {
  page?: number;
  size?: number;
  q?:    string;   // keyword search
  city?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
}