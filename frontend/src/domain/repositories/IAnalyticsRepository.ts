
import {
  AdminDashboardStats,
  ApplicationFunnelStats,
  EmployerDashboardStats,
  JobPerformanceResponse,
  TopCompaniesResponse,
  TimeSeriesResponse
} from '../models/Analytics';

export interface IAnalyticsRepository {
  // Admin endpoints
  getAdminDashboard(): Promise<AdminDashboardStats>;
  getUserGrowth(months?: number): Promise<TimeSeriesResponse>;
  getRevenueReport(months?: number): Promise<TimeSeriesResponse>;
  getTopCompanies(limit?: number): Promise<TopCompaniesResponse>;
  getLivestreamStats(months?: number): Promise<TimeSeriesResponse>;

  // Employer endpoints
  getEmployerDashboard(companyId: string): Promise<EmployerDashboardStats>;
  getApplicationFunnel(companyId: string, jobPostId?: string): Promise<ApplicationFunnelStats>;
  getJobPerformance(companyId: string): Promise<JobPerformanceResponse>;
}