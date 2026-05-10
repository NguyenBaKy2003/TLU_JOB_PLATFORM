// D:\TLU_JOB_PLATFORM\frontend\src\application\services\AdminAnalytics.ts

import type { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";
import type {
  AdminDashboardStats,
  ApplicationFunnelStats,
  EmployerDashboardStats,
  JobPerformanceResponse,
  TopCompaniesResponse,
  TimeSeriesResponse,
} from "@/domain/models/Analytics";

export class AdminAnalyticsService {
  constructor(private readonly repo: IAnalyticsRepository) {}

  // ─── Admin Dashboard ───

  /** GET /api/v1/admin/analytics/dashboard */
  getDashboard(): Promise<AdminDashboardStats> {
    return this.repo.getAdminDashboard();
  }

  // ─── User Growth ───

  /** GET /api/v1/admin/analytics/users/growth?months= */
  getUserGrowth(months: number = 12): Promise<TimeSeriesResponse> {
    if (months <= 0) throw new Error("months phải lớn hơn 0");
    return this.repo.getUserGrowth(months);
  }

  // ─── Revenue Report ───

  /** GET /api/v1/admin/analytics/revenue?months= */
  getRevenueReport(months: number = 12): Promise<TimeSeriesResponse> {
    if (months <= 0) throw new Error("months phải lớn hơn 0");
    return this.repo.getRevenueReport(months);
  }

  // ─── Top Companies ───

  /** GET /api/v1/admin/analytics/companies/top?limit= */
  getTopCompanies(limit: number = 10): Promise<TopCompaniesResponse> {
    if (limit <= 0) throw new Error("limit phải lớn hơn 0");
    return this.repo.getTopCompanies(limit);
  }

  // ─── Livestream Platform Stats ───

  /** GET /api/v1/admin/analytics/livestream?months= */
  getLivestreamStats(months: number = 6): Promise<TimeSeriesResponse> {
    if (months <= 0) throw new Error("months phải lớn hơn 0");
    return this.repo.getLivestreamStats(months);
  }

  // ─── Employer Dashboard ───

  /** GET /api/v1/employer/analytics/dashboard/{companyId} */
  getEmployerDashboard(companyId: string): Promise<EmployerDashboardStats> {
    if (!companyId) throw new Error("companyId là bắt buộc");
    return this.repo.getEmployerDashboard(companyId);
  }

  // ─── Application Funnel ───

  /** GET /api/v1/employer/analytics/funnel/{companyId}?jobPostId= */
  getApplicationFunnel(
    companyId: string,
    jobPostId?: string,
  ): Promise<ApplicationFunnelStats> {
    if (!companyId) throw new Error("companyId là bắt buộc");
    return this.repo.getApplicationFunnel(companyId, jobPostId);
  }

  // ─── Job Performance ───

  /** GET /api/v1/employer/analytics/jobs/{companyId} */
  getJobPerformance(companyId: string): Promise<JobPerformanceResponse> {
    if (!companyId) throw new Error("companyId là bắt buộc");
    return this.repo.getJobPerformance(companyId);
  }
}