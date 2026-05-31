export type JobStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED"
  | "EXPIRED"
  | "DELETED";

export interface AdminJob {
  id:          string;
  title:       string;
  companyId:   string;
  companyName: string;
  status:      JobStatus;
  level:       string | null;
  location:    string | null;
  salaryMin:   number | null;
  salaryMax:   number | null;
  currency:    string | null;
  deadline:    string | null;
  createdAt:   string;
  updatedAt:   string | null;
}

export interface AdminJobPage {
  content:       AdminJob[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminJobFilters {
  status?:   JobStatus | "";
  keyword?:  string;
  city?:     string;
  category?: string;
  page:      number;
  size:      number;
}
