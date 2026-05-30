// D:\TLU_JOB_PLATFORM\frontend\src\domain\repositories\IEmployerAnalyticsRepository.ts

import {
  ApplicationFunnel,
  ApplicationTrend,
  EmployerDashboard,
  JobPerformance,
} from "../models/EmployerAnalytics";

export interface IEmployerAnalyticsRepository {
  getDashboard(): Promise<EmployerDashboard>;
  getJobPerformance(): Promise<JobPerformance>;
  getCompanyFunnel(): Promise<ApplicationFunnel>;
  getJobFunnel(jobPostId: string): Promise<ApplicationFunnel>;
  getApplicationTrend(months: number): Promise<ApplicationTrend>;
}