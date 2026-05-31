export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export interface AdminCompany {
  id:                 string;
  name:               string;
  email:              string;
  logoUrl:            string | null;
  website:            string | null;
  industry:           string | null;
  city:               string | null;
  size:               string | null;
  verificationStatus: VerificationStatus;
  rejectionReason:    string | null;
  isActive:           boolean;
  createdAt:          string;
  updatedAt:          string | null;
}

export interface AdminCompanyPage {
  content:       AdminCompany[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminCompanyFilters {
  status?:    VerificationStatus | "";
  keyword?:   string;
  city?:      string;
  size?:      string;
  planCode?:  string;
  minRating?: number | "";
  page:       number;
  pageSize:   number;
}