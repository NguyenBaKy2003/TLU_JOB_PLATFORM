// ── Enums ──────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING:              "Chờ xem xét",
  REVIEWING:            "Đang xem xét",
  INTERVIEW_SCHEDULED:  "Đã lên lịch phỏng vấn",
  OFFERED:              "Đã có offer",
  ACCEPTED:             "Đã chấp nhận",
  REJECTED:             "Bị từ chối",
  WITHDRAWN:            "Đã rút đơn",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING:              "bg-yellow-50 text-yellow-700 border-yellow-200",
  REVIEWING:            "bg-blue-50 text-blue-700 border-blue-200",
  INTERVIEW_SCHEDULED:  "bg-purple-50 text-purple-700 border-purple-200",
  OFFERED:              "bg-green-50 text-green-700 border-green-200",
  ACCEPTED:             "bg-green-100 text-green-800 border-green-300",
  REJECTED:             "bg-red-50 text-red-700 border-red-200",
  WITHDRAWN:            "bg-gray-50 text-gray-500 border-gray-200",
};

// ── AI Score ───────────────────────────────────────────────────────────────────

export interface AIScore {
  score: number;        // 0 - 100
  summary: string;      // Nhận xét ngắn
  strengths: string[];
  weaknesses: string[];
}

// ── Status Log ─────────────────────────────────────────────────────────────────

export interface ApplicationStatusLog {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  changedBy: string;
  changedAt: string;
}

// ── Application ────────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  jobPostId: string;
  candidateId: string;
  companyId: string;

  // Nội dung
  cvUrl: string;
  coverLetter: string | null;
  expectedSalary: string | null;

  // Trạng thái
  status: ApplicationStatus;
  rejectionReason: string | null;

  // Phỏng vấn
  interviewScheduledAt: string | null;
  interviewLocation: string | null;
  interviewNote: string | null;

  // AI
  aiScore: AIScore | null;
  aiScoreCalculated: boolean;

  // Metadata
  appliedAt: string;
  updatedAt: string | null;
}

// ── Application với thông tin join ────────────────────────────────────────────

export interface ApplicationWithJob extends Application {
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  companyLogo: string | null;
}

export interface ApplicationWithCandidate extends Application {
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string | null;
}

// ── Requests ───────────────────────────────────────────────────────────────────

export interface SubmitApplicationRequest {
  jobPostId: string;
  cvUrl: string;
  coverLetter?: string;
  expectedSalary?: string;
}

export interface ScheduleInterviewRequest {
  scheduledAt: string;   // ISO datetime
  location: string;
  note?: string;
}

export interface UpdateStatusRequest {
  status: ApplicationStatus;
  note?: string;
}

// ── Page response ──────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}