export type ApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CANCELLED'
  | 'PENDING';

// ─── Nested objects (từ list response) ───────────

export interface AdminApplicationCandidate {
  id:        string;
  fullName:  string;
  email:     string;
  boosted:   boolean;
  // thêm ở detail
  phone?:     string | null;
  avatarUrl?: string | null;
}

export interface AdminApplicationJob {
  id:               string;
  title:            string;
  slug:             string;
  jobType:          string | null;
  level:            string | null;
  workLocationCity: string | null;
}

export interface AdminApplicationCompany {
  id:       string;
  name:     string;
  logoUrl:  string | null;
  industry: string | null;
  website:  string | null;
  size:     string | null;
  city:     string | null;
}

// ─── List item ────────

export interface AdminApplication {
  id:           string;
  jobPostId:    string;
  candidateId:  string;
  companyId:    string;
  status:       ApplicationStatus;
  cvUrl:        string | null;
  hasAIScore:   boolean;
  aiScore:      number | null;
  aiScoreLabel: string | null;
  appliedAt:    string;
  candidate:    AdminApplicationCandidate | null;
  job:          AdminApplicationJob | null;
  company:      AdminApplicationCompany | null;
}

/** Helper — tránh optional chaining lặp lại trong template */
export const getCandidateName  = (a: AdminApplication) => a.candidate?.fullName  ?? '—';
export const getCandidateEmail = (a: AdminApplication) => a.candidate?.email     ?? '—';

// ─── Status log ───────

export interface ApplicationStatusLog {
  id:         string;
  fromStatus: ApplicationStatus | null;
  toStatus:   ApplicationStatus;
  reason:     string | null;
  changedBy:  string | null;
  changedAt:  string;
}

// ─── Detail item (từ /{id}) ───────────────────────

export interface AdminApplicationDetail extends AdminApplication {
  coverLetter: string | null;
  statusLogs:  ApplicationStatusLog[];
}

// ─── Pagination & filters ─────────────────────────

export interface AdminApplicationPage {
  content:       AdminApplication[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminApplicationFilters {
  companyId?: string;
  jobPostId?: string;
  status?:    ApplicationStatus | '';
  keyword?:   string;
  page:       number;
  size:       number;
}

export interface OverrideStatusRequest {
  status: ApplicationStatus;
  reason: string;
}