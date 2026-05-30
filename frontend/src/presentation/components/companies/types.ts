// src/presentation/components/companies/types.ts

export interface CompanyFilters {
  benefits:    string[];
  gender:      string;
  companySize: string;
}

/**
 * View model dùng trong CompanyCard — đã được flatten từ CompanyProfile.
 * Thêm planCode để render PlanBadge.
 */
export interface Company {
  id:          string;
  name:        string;
  slug:        string;
  logoUrl:     string | null;
  industry:    string | null;
  size:        string | null;
  location:    string | null;
  description: string | null;
  rating:      number;
  reviewCount: number;
  jobCount:    number;
  foundedYear: number | null;
  isVerified:  boolean;
  isOnline:    boolean;
  tags:        string[];
  /** Plan tier — null = FREE, không hiển thị badge */
  planCode:    string | null;
}