
export interface AdminDashboardStats {
  // Users
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;

  // Companies
  totalCompanies: number;
  verifiedCompanies: number;
  pendingVerification: number;

  // Jobs
  totalJobs: number;
  activeJobs: number;
  jobsThisMonth: number;
  jobGrowthRate: number;

  // Applications
  totalApplications: number;
  applicationsThisMonth: number;
  applicationGrowthRate: number;

  // Revenue
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthRate: number;

  // Livestream
  totalStreamSessions: number;
  streamSessionsThisMonth: number;
  totalStreamViewers: number;
  appliesFromStream: number;

  // Moderation
  pendingCompanyVerifications: number;
  pendingJobApprovals: number;
  flaggedJobs: number;

  generatedAt: string;
}

export interface ApplicationFunnelStats {
  companyId: string;
  jobPostId: string | null;
  submitted: number;
  screening: number;
  interviewing: number;
  offered: number;
  hired: number;
  rejected: number;
  withdrawn: number;
  overallConversionRate: number;
  screeningPassRate: number;
}

export interface EmployerDashboardStats {
  companyId: string;
  activeJobs: number;
  draftJobs: number;
  totalJobsAllTime: number;
  jobsExpiringSoon: number;
  totalApplications: number;
  newApplicationsToday: number;
  pendingReview: number;
  quotaUsed: number;
  quotaTotal: number;
  streamQuotaUsed: number;
  streamQuotaTotal: number;
  totalStreamSessions: number;
  totalStreamViewers: number;
  appliesFromStream: number;
}

export interface JobPerformanceStats {
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

export interface JobPerformanceResponse {
  jobs: JobPerformanceStats[];
  total: number;
}

export interface TopCompanyStats {
  rank: number;
  companyId: string;
  companyName: string;
  logoUrl: string;
  totalJobs: number;
  totalApplications: number;
  totalHired: number;
  totalRevenue: number;
  streamSessions: number;
}

export interface TopCompaniesResponse {
  companies: TopCompanyStats[];
  total: number;
}

export interface TimeSeriesDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesResponse {
  dataPoints: TimeSeriesDataPoint[];
  total?: number;
  average?: number;
}