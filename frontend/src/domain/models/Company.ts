// src/domain/models/Company.ts
// Types tương ứng với backend CompanyProfile + CompanyReview

// ── Enums ─────────────────────────────────────────────────────────────────────

export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export type CompanySize =
    "UNKNOWN"
  | "STARTUP"       // < 10
  | "SMALL"       // 10-49
  | "MEDIUM"      // 50-199
  | "LARGE"       // 200-999
  | "ENTERPRISE" // 1000+
    |"CORPORATION";

// ── Domain models ─────────────────────────────────────────────────────────────

export interface CompanyProfile {
  id:                 string;
  ownerId:            string;
  name:               string;
  slug:               string;
  description:        string | null;
  website:            string | null;
  email:              string | null;
  phone:              string | null;
  address:            string | null;
  city:               string | null;
  country:            string | null;
  industry:           string | null;
  size:               CompanySize | null;
  foundedYear:        number | null;
  logoUrl:            string | null;
  coverImageUrl:      string | null;
  verificationStatus: VerificationStatus;
  rejectionReason:    string | null;
  verifiedAt:         string | null;
  active:             boolean;
  createdAt:          string;
  updatedAt:          string;
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