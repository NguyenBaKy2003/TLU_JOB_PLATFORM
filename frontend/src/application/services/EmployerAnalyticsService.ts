// D:\TLU_JOB_PLATFORM\frontend\src\application\services\EmployerAnalyticsService.ts

import { IEmployerAnalyticsRepository } from "@/domain/repositories/IEmployerAnalyticsRepository";
import {
  ApplicationFunnel,
  FunnelStage,
  JobPerformance,
} from "@/domain/models/EmployerAnalytics";
import { EmployerAnalyticsRepository } from "@/infrastructure/repositories/EmployerAnalyticsRepository";

// ─── View-model types ─

export interface DashboardViewModel {
  dashboard: import("@/domain/models/EmployerAnalytics").EmployerDashboard;
  quotaPercent: number;
  streamQuotaPercent: number;
}

export interface FunnelChartData {
  stage: FunnelStage;
  label: string;
  value: number;
  /** % so với submitted (base = 100) */
  percent: number;
  /** % drop so với bước liền trước */
  dropRate: number;
}

export interface JobPerformanceTableRow {
  jobPostId: string;
  title: string;
  status: string;
  viewCount: number;
  totalApplications: number;
  hired: number;
  conversionRate: number;
  deadline: string;
  /** null nếu không có deadline hoặc job đã đóng */
  daysLeft: number | null;
}

/**
 * Điểm dữ liệu trend đã được format label cho UI.
 * label từ backend: "2025-06" → format thành "T6/25"
 */
export interface TrendChartPoint {
  label: string;
  applications: number;
  views: number;
}

// ─── Service ──────────

export class EmployerAnalyticsService {
  constructor(
    private readonly repo: IEmployerAnalyticsRepository = new EmployerAnalyticsRepository()
  ) {}

  // ── Dashboard
  async getDashboardViewModel(): Promise<DashboardViewModel> {
    const dashboard = await this.repo.getDashboard();
    return {
      dashboard,
      quotaPercent:
        dashboard.quotaTotal > 0
          ? Math.round((dashboard.quotaUsed / dashboard.quotaTotal) * 100)
          : 0,
      streamQuotaPercent:
        dashboard.streamQuotaTotal > 0
          ? Math.round((dashboard.streamQuotaUsed / dashboard.streamQuotaTotal) * 100)
          : 0,
    };
  }

  // ── Trend chart
  async getApplicationTrend(months = 12): Promise<TrendChartPoint[]> {
    const trend = await this.repo.getApplicationTrend(months);
    return trend.data.map((p) => ({
      label:        this._formatMonthLabel(p.label),
      applications: p.applications,
      views:        p.views,
    }));
  }

  // ── Funnel toàn công ty
  async getCompanyFunnelChart(): Promise<FunnelChartData[]> {
    const funnel = await this.repo.getCompanyFunnel();
    return this._buildFunnelChart(funnel);
  }

  // ── Funnel theo job post cụ thể
  async getJobFunnelChart(jobPostId: string): Promise<FunnelChartData[]> {
    const funnel = await this.repo.getJobFunnel(jobPostId);
    return this._buildFunnelChart(funnel);
  }

  // ── Job performance table
  async getJobPerformanceTable(): Promise<JobPerformanceTableRow[]> {
    const perf: JobPerformance = await this.repo.getJobPerformance();
    return perf.jobs.map((j) => {
      let daysLeft: number | null = null;
      if (j.deadline) {
        const diff = new Date(j.deadline).getTime() - Date.now();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
      return {
        jobPostId:         j.jobPostId,
        title:             j.title,
        status:            j.status,
        viewCount:         j.viewCount,
        totalApplications: j.totalApplications,
        hired:             j.hired,
        conversionRate:    j.conversionRate,
        deadline:          j.deadline,
        daysLeft,
      };
    });
  }

  // ── Fetch tất cả data cùng lúc — dùng cho page load
  async fetchAll(): Promise<{
    vm:     DashboardViewModel;
    funnel: FunnelChartData[];
    jobs:   JobPerformanceTableRow[];
    trend:  TrendChartPoint[];
  }> {
    const [vm, funnel, jobs, trend] = await Promise.all([
      this.getDashboardViewModel(),
      this.getCompanyFunnelChart(),
      this.getJobPerformanceTable(),
      this.getApplicationTrend(12),
    ]);
    return { vm, funnel, jobs, trend };
  }

  // ── Private helpers ───────────────────────────

  /** "2025-06" → "T6/25" */
  private _formatMonthLabel(raw: string): string {
    const match = raw.match(/^(\d{4})-(\d{2})$/);
    if (!match) return raw;
    const [, year, month] = match;
    return `T${parseInt(month)}/${year.slice(2)}`;
  }

  private _buildFunnelChart(funnel: ApplicationFunnel): FunnelChartData[] {
    const stages: { stage: FunnelStage; label: string; value: number }[] = [
      { stage: "submitted",    label: "Nộp hồ sơ",   value: funnel.submitted    },
      { stage: "screening",    label: "Sàng lọc",     value: funnel.reviewing    },
      { stage: "interviewing", label: "Phỏng vấn",    value: funnel.interviewing },
      { stage: "offered",      label: "Đề nghị",      value: funnel.offered      },
      { stage: "hired",        label: "Tuyển dụng",   value: funnel.hired        },
    ];
    const base = funnel.submitted || 1;
    return stages.map((s, i) => {
      const prev = i === 0 ? base : (stages[i - 1].value || 1);
      return {
        ...s,
        percent:  Math.round((s.value / base) * 100),
        dropRate: i === 0 ? 0 : Math.round(((prev - s.value) / prev) * 100),
      };
    });
  }
}