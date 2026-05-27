// src/domain/models/Job.ts

// ── Enums ─────────────────────────────────────────────────────────────────────

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN"  ;
export type JobLevel =
  | "INTERN"
  | "JUNIOR"
  | "MIDDLE"
  | "SENIOR"
  | "LEAD"
  | "MANAGER";
export type WorkLocType = "ONSITE" | "REMOTE" | "HYBRID";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "EXPIRED" | "PENDING_REVIEW" | "REJECTED";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERN: "Thực tập",
};

export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  INTERN: "Thực tập sinh",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Quản lý",
};

export const WORK_LOC_LABELS: Record<WorkLocType, string> = {
  ONSITE: "Tại văn phòng",
  REMOTE: "Làm việc từ xa",
  HYBRID: "Kết hợp",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang tuyển",
  CLOSED: "Đã đóng",
  EXPIRED: "Hết hạn",
  PENDING_REVIEW: "Chờ duyệt",
  REJECTED: "Bị từ chối"
};

// ── Value objects ─────────────────────────────────────────────────────────────

export interface Salary {
  min: number | null;
  max: number | null;
  currency: string;
  negotiable: boolean;
}

export interface SubmitReviewResponse {
  job: JobPostDetail;
  review: {
    decision:        "APPROVED" | "REJECTED";
    severity:        "CLEAN" | "WARNING" | "VIOLATION" | "ERROR" | "CRITICAL";
    qualityScore:    number;
    overallFeedback: string | null;
    rejectionReason: string | null;
    violations: {
      type:        string;
      excerpt:     string | null;
      explanation: string | null;
      suggestion:  string | null;
    }[];
  };
}

export interface WorkLocation {
  type: WorkLocType;
  city: string | null;
  address: string | null;
}

export interface JobSkill {
  skillName: string;
  level: string;
  required: boolean;
}

// ── Domain models ─────────────────────────────────────────────────────────────

/** Dùng trong list (JobPostResponse từ backend) */
export interface JobPost {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  postedBy: string;
  slug: string;
  title: string;
  featured: boolean;
  category: string | null;
  jobType: JobType | null;
  level: JobLevel | null;
  salaryDisplay: string;
  workLocationCity: string | null;
  status: JobStatus;
  viewCount: number;
   rejectionReason?: string | null; 
  deadline: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Dùng trong detail (JobPostDetailResponse từ backend) */
export interface JobPostDetail extends JobPost {
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salaryNegotiable: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  workLocationType: WorkLocType | null;
  workLocationAddress: string | null;
  experienceYears: number | null;
  rejectionReason: string;
  vacancies: number;
  skills: JobSkill[];
}

export interface SavedJob {
  id: string;
  jobPostId: string;
  savedAt: string;
}

export interface PublishJobPayload {
  featured: boolean;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateJobPayload {
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  jobType?: JobType;
  level?: JobLevel;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryNegotiable: boolean;
  workLocationType?: WorkLocType;
  workLocationCity?: string;
  workLocationAddress?: string;
  experienceYears?: number;
  vacancies?: number;
  deadline: string; // ISO date "YYYY-MM-DD"
  skills?: JobSkill[];
}

/** Payload cho PATCH /api/v1/jobs/:id — tất cả field đều optional */
export interface UpdateJobPayload {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  jobType?: JobType;
  level?: JobLevel;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryNegotiable?: boolean;
  workLocationType?: WorkLocType;
  workLocationCity?: string;
  workLocationAddress?: string;
  experienceYears?: number;
  vacancies?: number;
  deadline?: string;
  skills?: JobSkill[];
}

// ── Search params ─────────────────────────────────────────────────────────────

export interface JobSearchParams {
  keyword?: string;
  city?: string;
  category?: string;
  jobType?: JobType;
  level?: JobLevel;
  companyId?: string;
  page?: number;
  size?: number;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── Form state (chỉ dùng ở frontend) ─────────────────────────────────────────

export interface JobPostForm {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  jobType: JobType | "";
  level: JobLevel | "";
  category: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryNegotiable: boolean;
  workLocationType: WorkLocType | "";
  workLocationCity: string;
  workLocationAddress: string;
  experienceYears: string;
  vacancies: string;
  deadline: string;
  skills: JobSkill[];
}

export const EMPTY_JOB_FORM: JobPostForm = {
  title: "",
  description: "",
  requirements: "",
  benefits: "",
  jobType: "",
  level: "",
  category: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "VND",
  salaryNegotiable: false,
  workLocationType: "",
  workLocationCity: "",
  workLocationAddress: "",
  experienceYears: "",
  vacancies: "1",
  deadline: "",
  skills: [],
};
