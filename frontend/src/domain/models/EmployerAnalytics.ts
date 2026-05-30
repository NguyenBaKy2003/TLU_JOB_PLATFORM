// D:\TLU_JOB_PLATFORM\frontend\src\domain\models\EmployerAnalytics.ts

export interface EmployerDashboard {
  companyId: string;

  // Jobs
  activeJobs: number;
  draftJobs: number;
  totalJobsAllTime: number;
  jobsExpiringSoon: number;

  // Applications
  totalApplications: number;
  newApplicationsToday: number;
  pendingReview: number;

  // Quota
  quotaUsed: number;
  quotaTotal: number;
  streamQuotaUsed: number;
  streamQuotaTotal: number;

  // Livestream
  totalStreamSessions: number;
  totalStreamViewers: number;
  appliesFromStream: number;
}

export interface ApplicationFunnel {
  companyId: string;
  jobPostId: string | null;

  // Funnel stages — mapping từ ApplicationStatus enum
  submitted: number;
  reviewing: number;      // REVIEWING + SHORTLISTED
  interviewing: number;   // INTERVIEW_SCHEDULED + INTERVIEWED
  offered: number;        // OFFERED + ACCEPTED
  hired: number;

  // Terminal / exit
  rejected: number;
  withdrawn: number;
  declined: number;       // ứng viên từ chối offer
  cancelled: number;

  // Computed rates (làm tròn 1 chữ số thập phân)
  overallConversionRate: number;
  screeningPassRate: number;
  interviewRate: number;
  offerRate: number;
}

export interface JobPerformanceItem {
  jobPostId: string;
  title: string;
  status: string;
  viewCount: number;
  totalApplications: number;
  screening: number;
  interviewing: number;
  offered: number;
  hired: number;
  conversionRate: number;
  deadline: string;
}

export interface JobPerformance {
  jobs: JobPerformanceItem[];
  total: number;
}

/** Một điểm dữ liệu trong biểu đồ xu hướng theo tháng */
export interface ApplicationTrendPoint {
  /** Định dạng "YYYY-MM" từ backend, ví dụ "2025-06" */
  label: string;
  applications: number;
  views: number;
}

export interface ApplicationTrend {
  data: ApplicationTrendPoint[];
}

export type FunnelStage = "submitted" | "screening" | "interviewing" | "offered" | "hired";