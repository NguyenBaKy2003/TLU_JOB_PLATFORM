export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export interface AdminCompany {
  id:                 string;
  name:               string;
  email:              string;
  logoUrl:            string | null;
  website:            string | null;
  industry:           string | null;
  city:               string | null;
  verificationStatus: VerificationStatus;
  rejectionReason:    string | null;
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
  status?: VerificationStatus | "";
  page:    number;
  size:    number;
}