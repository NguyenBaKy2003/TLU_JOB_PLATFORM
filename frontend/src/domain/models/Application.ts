// src/domain/models/Application.ts

export type ApplicationStatus =
  | "SUBMITTED"          // ✅ backend trả về SUBMITTED, không phải PENDING
  | "PENDING"            // giữ lại để tương thích nếu có nơi khác dùng
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_DONE"
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED:            "Đã nộp",           // ✅ thêm mới
  PENDING:              "Chờ xét duyệt",
  REVIEWING:            "Đang xem xét",
  INTERVIEW_SCHEDULED:  "Đã lên lịch phỏng vấn",
  INTERVIEW_DONE:       "Đã phỏng vấn",
  OFFERED:              "Đã gửi offer",
  ACCEPTED:             "Đã chấp nhận",
  REJECTED:             "Không phù hợp",
  WITHDRAWN:            "Đã rút đơn",
};

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  SUBMITTED:           "bg-gray-100  text-gray-600   border-gray-200",  // ✅ thêm mới
  PENDING:             "bg-gray-100  text-gray-600   border-gray-200",
  REVIEWING:           "bg-blue-50   text-blue-700   border-blue-200",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
  INTERVIEW_DONE:      "bg-indigo-50 text-indigo-700 border-indigo-200",
  OFFERED:             "bg-amber-50  text-amber-700  border-amber-200",
  ACCEPTED:            "bg-green-50  text-green-700  border-green-200",
  REJECTED:            "bg-red-50    text-red-600    border-red-200",
  WITHDRAWN:           "bg-gray-100  text-gray-400   border-gray-200",
};

// ── Domain models ─────────────────────────────────────────────────────────────

export interface Application {
  id:              string;
  jobPostId:       string;
  candidateId:     string;
  companyId:       string;
  status:          ApplicationStatus;
  cvUrl:           string;
  coverLetter?:    string | null;
  expectedSalary?: number | null;
  note?:           string | null;
  aiScore?:        number | null;
  aiScoreLabel?:   string | null;   // ✅ backend trả về "Phù hợp", "Tiềm năng"...
  hasAIScore?:     boolean;         // ✅ backend trả về hasAIScore
  scheduledAt?:    string | null;
  interviewLocation?: string | null;
  interviewNote?:  string | null;
  appliedAt:       string;
  updatedAt?:      string;
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

export interface ApplicationWithCandidate extends Application {
  candidateName:   string;
  candidateAvatar: string | null;
  candidateEmail:  string;
  candidatePhone?: string | null;
  jobTitle:        string;
}

export interface ApplicationStatusLog {
  id:        string;
  status:    ApplicationStatus;
  note?:     string | null;
  changedAt: string;
  changedBy: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

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