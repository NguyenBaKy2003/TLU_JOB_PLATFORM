// src/domain/models/Company.ts

export interface Company {
  id:                 string;
  name:               string;
  industry:           string | null;
  location:           string | null;       // city
  description:        string | null;
  logoUrl:            string | null;
  size:               string | null;       // sizeLabel
  isVerified:         boolean;
  jobCount:           number;              // activeJobCount
  rating:             number;              // averageRating
  reviewCount:        number;
  foundedYear:        number | null;
  website:            string | null;
}

export interface CompanyFilters {
  benefits:  string[];   // Phúc lợi hấp dẫn checkboxes
  gender:    string;     // "Nam" | "Nữ" | "Khác" | ""
  companySize: string;   // "1-50" | "51-200" | etc
}