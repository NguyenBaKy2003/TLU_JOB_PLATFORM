// D:\TLU_JOB_PLATFORM\frontend\src\infrastructure\repositories\EmployerAnalyticsRepository.ts

import api from "@/lib/axios";
import { IEmployerAnalyticsRepository } from "@/domain/repositories/IEmployerAnalyticsRepository";
import {
  ApplicationFunnel,
  ApplicationTrend,
  EmployerDashboard,
  JobPerformance,
} from "@/domain/models/EmployerAnalytics";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

const BASE = "/employer/analytics";

export class EmployerAnalyticsRepository implements IEmployerAnalyticsRepository {
  async getDashboard(): Promise<EmployerDashboard> {
    const res = await api.get<ApiResponse<EmployerDashboard>>(`${BASE}/dashboard`);
    return res.data.data;
  }

  async getJobPerformance(): Promise<JobPerformance> {
    const res = await api.get<ApiResponse<JobPerformance>>(`${BASE}/jobs/performance`);
    return res.data.data;
  }

  async getCompanyFunnel(): Promise<ApplicationFunnel> {
    const res = await api.get<ApiResponse<ApplicationFunnel>>(`${BASE}/applications/funnel`);
    return res.data.data;
  }

  async getJobFunnel(jobPostId: string): Promise<ApplicationFunnel> {
    const res = await api.get<ApiResponse<ApplicationFunnel>>(
      `${BASE}/applications/funnel/${jobPostId}`
    );
    return res.data.data;
  }

  async getApplicationTrend(months: number): Promise<ApplicationTrend> {
    const res = await api.get<ApiResponse<ApplicationTrend>>(`${BASE}/trend`, {
      params: { months },
    });
    return res.data.data;
  }
}