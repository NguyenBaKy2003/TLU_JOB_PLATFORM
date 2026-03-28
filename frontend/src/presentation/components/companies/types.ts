// src/domain/models/Company.ts

export interface Company {
  id:          string;
  name:        string;
  logo:        string;
  location:    string;
  rating:      number;
  tags:        string[];   // ["Toàn cầu", "Đang tuyển dụng"]
  description: string;
  jobCount:    number;
  reviewCount: number;
  salaryCount: string;     // "103.98K"
}

export interface CompanyFilters {
  benefits:  string[];   // Phúc lợi hấp dẫn checkboxes
  gender:    string;     // "Nam" | "Nữ" | "Khác" | ""
  companySize: string;   // "1-50" | "51-200" | etc
}