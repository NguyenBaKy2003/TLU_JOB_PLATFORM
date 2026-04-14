// src/domain/models/Application.ts

export type ApplicationStatus =
  | "SUBMITTED"
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFERED"
  | "ACCEPTED"
  | "DECLINED"
  | "REJECTED"
  | "HIRED"
  | "WITHDRAWN"
  | "CANCELLED";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED:           "Đã nộp",
  PENDING:             "Chờ xét duyệt",
  REVIEWING:           "Đang xem xét",
  SHORTLISTED:         "Được chọn vào danh sách rút gọn",
  INTERVIEW_SCHEDULED: "Đã lên lịch phỏng vấn",
  INTERVIEWED:         "Đã phỏng vấn",
  OFFERED:             "Đã gửi offer",
  ACCEPTED:            "Đã chấp nhận",
  DECLINED:            "Ứng viên từ chối offer",
  REJECTED:            "Không phù hợp",
  HIRED:               "Đã tuyển dụng",
  WITHDRAWN:           "Đã rút đơn",
  CANCELLED:           "Đã huỷ",
};

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  SUBMITTED:           "bg-gray-100   text-gray-600   border-gray-200",
  PENDING:             "bg-gray-100   text-gray-600   border-gray-200",
  REVIEWING:           "bg-blue-50    text-blue-700   border-blue-200",
  SHORTLISTED:         "bg-cyan-50    text-cyan-700   border-cyan-200",
  INTERVIEW_SCHEDULED: "bg-purple-50  text-purple-700 border-purple-200",
  INTERVIEWED:         "bg-indigo-50  text-indigo-700 border-indigo-200",
  OFFERED:             "bg-amber-50   text-amber-700  border-amber-200",
  ACCEPTED:            "bg-green-50   text-green-700  border-green-200",
  HIRED:               "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED:            "bg-orange-50  text-orange-700 border-orange-200",
  REJECTED:            "bg-red-50     text-red-600    border-red-200",
  WITHDRAWN:           "bg-gray-100   text-gray-400   border-gray-200",
  CANCELLED:           "bg-gray-100   text-gray-400   border-gray-200",
};

// ── Nested DTOs ────────────────────────────────────────────────────────────────

export interface CandidateInfo {
  id:        string;
  fullName:  string;
  email?:    string | null;
  phone?:    string | null;
  avatarUrl: string | null;
}

/** Khớp với ApplicationDetailResponse.StatusLogDto của backend */
export interface ApplicationStatusLog {
  fromStatus: ApplicationStatus | null;
  toStatus:   ApplicationStatus;
  note?:      string | null;
  changedAt:  string;
}

export interface AIScore {
  score:           number;
  label:           string;
  skillMatchScore: number;
  experienceScore: number;
  educationScore:  number;
  strengths?:      string[];
  gaps?:           string[];
  summary?:        string | null;
}

// ── Domain models ──────────────────────────────────────────────────────────────

export interface Application {
  id:                 string;
  jobPostId:          string;
  candidateId:        string;
  companyId:          string;
  status:             ApplicationStatus;
  cvUrl:              string;
  coverLetter?:       string | null;
  expectedSalary?:    string | number | null;
  note?:              string | null;
  hasAIScore?:        boolean;
  aiScoreCalculated?: boolean;
  scheduledAt?:       string | null;
  interviewLocation?: string | null;
  interviewNote?:     string | null;
  appliedAt:          string;
  updatedAt?:         string;
}

export interface ApplicationWithJob extends Application {
  jobTitle:        string;
  companyName:     string;
  companyLogo:     string | null;
  jobCity:         string | null;
  jobType:         string | null;
  salaryMin?:      number | null;
  salaryMax?:      number | null;
  salaryCurrency?: string;
}

/**
 * Khớp với ApplicationDetailResponse của backend.
 * Dùng cho GET /api/v1/employer/applications/{id}
 * — có candidate, aiScore, statusHistory đầy đủ.
 */
export interface ApplicationDetail extends Application {
  candidate?:    CandidateInfo | null;
  aiScore?:      AIScore | null;
  statusHistory: ApplicationStatusLog[];
}

/**
 * Flat response từ list endpoint GET /jobs/{id}/applications.
 * candidate được populate bởi batch resolve ở backend.
 */
export interface ApplicationWithCandidate extends Application {
  candidateName:   string;
  candidateAvatar: string | null;
  candidateEmail:  string;
  candidatePhone?: string | null;
  jobTitle:        string;
  candidate?:      CandidateInfo | null;
  aiScore?:        AIScore | null;
}

// ── Payloads ───────────────────────────────────────────────────────────────────

export interface SubmitApplicationRequest {
  jobPostId:       string;
  cvUrl:           string;
  coverLetter?:    string;
  expectedSalary?: number;
}

export interface ScheduleInterviewRequest {
  scheduledAt: string;
  location:    string;
  note?:       string;
}

export interface UpdateStatusRequest {
  status: ApplicationStatus;
  note?:  string;
}

export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
  first?:        boolean;
  empty?:        boolean;
}