
import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";
import type {
  AdminDashboardStats,
  ApplicationFunnelStats,
  EmployerDashboardStats,
  JobPerformanceResponse,
  TopCompaniesResponse,
  TimeSeriesResponse,
} from "@/domain/models/Analytics";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export class AdminAnalyticsRepository implements IAnalyticsRepository {
  private readonly BASE = "/admin/analytics";

  /** GET /api/v1/admin/analytics/dashboard */
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    const res = await api.get<ApiResponse<AdminDashboardStats>>(
      `${this.BASE}/dashboard`,
      adminConfig(),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/analytics/users/growth?months=12 */
  async getUserGrowth(months: number = 12): Promise<TimeSeriesResponse> {
    const res = await api.get<ApiResponse<TimeSeriesResponse>>(
      `${this.BASE}/users/growth`,
      adminConfig({ months }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/analytics/revenue?months=12 */
  async getRevenueReport(months: number = 12): Promise<TimeSeriesResponse> {
    const res = await api.get<ApiResponse<TimeSeriesResponse>>(
      `${this.BASE}/revenue`,
      adminConfig({ months }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/analytics/companies/top?limit=10 */
  async getTopCompanies(limit: number = 10): Promise<TopCompaniesResponse> {
    const res = await api.get<ApiResponse<TopCompaniesResponse>>(
      `${this.BASE}/companies/top`,
      adminConfig({ limit }),
    );
    return res.data.data;
  }

  /** GET /api/v1/admin/analytics/livestream?months=6 */
  async getLivestreamStats(months: number = 6): Promise<TimeSeriesResponse> {
    const res = await api.get<ApiResponse<TimeSeriesResponse>>(
      `${this.BASE}/livestream`,
      adminConfig({ months }),
    );
    return res.data.data;
  }

  // ─── Employer endpoints (dùng sau khi có EmployerAnalyticsController) ───

  /** GET /api/v1/employer/analytics/dashboard/{companyId} */
  async getEmployerDashboard(companyId: string): Promise<EmployerDashboardStats> {
    const res = await api.get<ApiResponse<EmployerDashboardStats>>(
      `/api/v1/employer/analytics/dashboard/${companyId}`,
      adminConfig(),
    );
    return res.data.data;
  }

  /** GET /api/v1/employer/analytics/funnel/{companyId}?jobPostId= */
  async getApplicationFunnel(
    companyId: string,
    jobPostId?: string,
  ): Promise<ApplicationFunnelStats> {
    const res = await api.get<ApiResponse<ApplicationFunnelStats>>(
      `/api/v1/employer/analytics/funnel/${companyId}`,
      adminConfig(jobPostId ? { jobPostId } : {}),
    );
    return res.data.data;
  }

  /** GET /api/v1/employer/analytics/jobs/{companyId} */
  async getJobPerformance(companyId: string): Promise<JobPerformanceResponse> {
    const res = await api.get<ApiResponse<JobPerformanceResponse>>(
      `/api/v1/employer/analytics/jobs/${companyId}`,
      adminConfig(),
    );
    return res.data.data;
  }
}