export type ApplicationStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN"
  | "CANCELLED"
  | "PENDING";

export interface AdminApplicationCandidate {
  id:        string;
  fullName:  string;
  email:     string;
  phone:     string | null;
  avatarUrl: string | null;
}

export interface AdminApplicationJob {
  id:    string;
  title: string;
  level: string | null;
}

export interface AdminApplication {
  id:             string;
  status:         ApplicationStatus;
  appliedAt:      string;
  aiScore:        number | null;
  aiScoreLabel:   string | null;
  candidate:      AdminApplicationCandidate | null;
  candidateName:  string;
  candidateEmail: string;
  job:            AdminApplicationJob;
  companyId:      string;
  jobPostId:      string;
}

export interface AdminApplicationDetail extends AdminApplication {
  statusLogs: ApplicationStatusLog[];
}

export interface ApplicationStatusLog {
  id:         string;
  fromStatus: ApplicationStatus | null;
  toStatus:   ApplicationStatus;
  reason:     string | null;
  changedBy:  string | null;
  changedAt:  string;
}

export interface AdminApplicationPage {
  content:       AdminApplication[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminApplicationFilters {
  companyId?:  string;
  jobPostId?:  string;
  status?:     ApplicationStatus | "";
  page:        number;
  size:        number;
}

export interface OverrideStatusRequest {
  status: ApplicationStatus;
  reason: string;
}