// D:\TLU_JOB_PLATFORM\frontend\src\app\(admin)\admin\(protected)\analytics\page.tsx

"use client";

import { useEffect, useState } from "react";
import { AdminAnalyticsService } from "@/application/services/AdminAnalytics";
import { AdminAnalyticsRepository } from "@/infrastructure/repositories/AdminAnalyticsRepository";
import type {
  AdminDashboardStats,
  TimeSeriesResponse,
  TopCompaniesResponse,
} from "@/domain/models/Analytics";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  DollarSign,
  Radio,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

// Khởi tạo service
const analyticsService = new AdminAnalyticsService(new AdminAnalyticsRepository());

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg mb-4">{error || "Không có dữ liệu"}</div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Cập nhật lúc: {new Date(dashboard.generatedAt).toLocaleString("vi-VN")}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <StatCard
          title="Người dùng"
          value={dashboard.totalUsers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        >
          <StatDetail
            label="Ứng viên"
            value={dashboard.totalCandidates.toLocaleString()}
          />
          <StatDetail
            label="Nhà tuyển dụng"
            value={dashboard.totalEmployers.toLocaleString()}
          />
          <StatDetail
            label="Mới tháng này"
            value={dashboard.newUsersThisMonth.toLocaleString()}
          />
          <GrowthRate rate={dashboard.userGrowthRate} />
        </StatCard>

        {/* Companies Card */}
        <StatCard
          title="Công ty"
          value={dashboard.totalCompanies.toLocaleString()}
          icon={<Building2 className="h-6 w-6" />}
          color="green"
        >
          <StatDetail
            label="Đã xác thực"
            value={dashboard.verifiedCompanies.toLocaleString()}
          />
          <StatDetail
            label="Chờ xác thực"
            value={dashboard.pendingVerification.toLocaleString()}
          />
        </StatCard>

        {/* Jobs Card */}
        <StatCard
          title="Công việc"
          value={dashboard.totalJobs.toLocaleString()}
          icon={<Briefcase className="h-6 w-6" />}
          color="purple"
        >
          <StatDetail
            label="Đang tuyển"
            value={dashboard.activeJobs.toLocaleString()}
          />
          <StatDetail
            label="Mới tháng này"
            value={dashboard.jobsThisMonth.toLocaleString()}
          />
          <GrowthRate rate={dashboard.jobGrowthRate} />
        </StatCard>

        {/* Applications Card */}
        <StatCard
          title="Đơn ứng tuyển"
          value={dashboard.totalApplications.toLocaleString()}
          icon={<FileText className="h-6 w-6" />}
          color="orange"
        >
          <StatDetail
            label="Tháng này"
            value={dashboard.applicationsThisMonth.toLocaleString()}
          />
          <GrowthRate rate={dashboard.applicationGrowthRate} />
        </StatCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <StatCard
          title="Doanh thu tháng này"
          value={`$${dashboard.revenueThisMonth?.toLocaleString() || "0"}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="yellow"
        >
          <StatDetail
            label="Tháng trước"
            value={`$${dashboard.revenueLastMonth?.toLocaleString() || "0"}`}
          />
          <GrowthRate rate={dashboard.revenueGrowthRate} />
        </StatCard>

        {/* Livestream Card */}
        <StatCard
          title="Livestream"
          value={dashboard.totalStreamSessions.toLocaleString()}
          icon={<Radio className="h-6 w-6" />}
          color="red"
        >
          <StatDetail
            label="Sessions tháng này"
            value={dashboard.streamSessionsThisMonth.toLocaleString()}
          />
          <StatDetail
            label="Tổng viewers"
            value={dashboard.totalStreamViewers.toLocaleString()}
          />
          <StatDetail
            label="Ứng tuyển từ stream"
            value={dashboard.appliesFromStream.toLocaleString()}
          />
        </StatCard>

        {/* Moderation Card */}
        <StatCard
          title="Kiểm duyệt"
          value={(
            dashboard.pendingCompanyVerifications +
            dashboard.pendingJobApprovals +
            dashboard.flaggedJobs
          ).toLocaleString()}
          icon={<ShieldAlert className="h-6 w-6" />}
          color="red"
        >
          <StatDetail
            label="Công ty chờ duyệt"
            value={dashboard.pendingCompanyVerifications.toLocaleString()}
            highlight={dashboard.pendingCompanyVerifications > 0}
          />
          <StatDetail
            label="Jobs chờ duyệt"
            value={dashboard.pendingJobApprovals.toLocaleString()}
            highlight={dashboard.pendingJobApprovals > 0}
          />
          <StatDetail
            label="Jobs bị flag"
            value={dashboard.flaggedJobs.toLocaleString()}
            highlight={dashboard.flaggedJobs > 0}
          />
        </StatCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <ChartCard title="Tăng trưởng người dùng">
          <UserGrowthChart />
        </ChartCard>

        {/* Revenue Chart */}
        <ChartCard title="Doanh thu">
          <RevenueChart />
        </ChartCard>

        {/* Top Companies */}
        <ChartCard title="Top công ty" className="lg:col-span-2">
          <TopCompaniesTable />
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Sub-components ───

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "yellow" | "red";
  children: React.ReactNode;
}

function StatCard({ title, value, icon, color, children }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-4">{value}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface StatDetailProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatDetail({ label, value, highlight }: StatDetailProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[16px] text-gray-500">{label}</span>
      <span
        className={`text-[16px] font-medium ${
          highlight
            ? "text-red-600 bg-red-50 px-2 py-0.5 rounded"
            : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function GrowthRate({ rate }: { rate: number }) {
  const isPositive = rate >= 0;
  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>{Math.abs(rate).toFixed(1)}%</span>
      <span className="text-gray-400">so với tháng trước</span>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Chart Components ───

function UserGrowthChart() {
  const [data, setData] = useState<TimeSeriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getUserGrowth(12)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ChartLoader />;
  }

  // Kiểm tra data.data thay vì data.dataPoints
  if (!data || !data.data?.length) {
    return <div className="text-gray-400 text-center py-8">Chưa có dữ liệu</div>;
  }

  const maxValue = Math.max(...data.data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.data.map((point, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-[16px] text-gray-500 w-24">{formatMonthLabel(point.label)}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6">
            <div
              className="bg-blue-500 h-6 rounded-full flex items-center justify-end px-2 transition-all"
              style={{
                width: `${maxValue > 0 ? (point.value / maxValue) * 100 : 0}%`,
              }}
            >
              <span className="text-xs text-white font-medium">
                {point.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart() {
  const [data, setData] = useState<TimeSeriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getRevenueReport(12)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ChartLoader />;
  }

  if (!data || !data.data?.length) {
    return <div className="text-gray-400 text-center py-8">Chưa có dữ liệu</div>;
  }

  const maxValue = Math.max(...data.data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.data.map((point, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-[16px] text-gray-500 w-24">{formatMonthLabel(point.label)}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6">
            <div
              className="bg-green-500 h-6 rounded-full flex items-center justify-end px-2 transition-all"
              style={{
                width: `${maxValue > 0 ? (point.value / maxValue) * 100 : 0}%`,
              }}
            >
              <span className="text-xs text-white font-medium">
                ${point.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMonthLabel(label: string): string {
  if (label.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = label.split("-");
    return `T${parseInt(month)}/${year}`;
  }
  return label;
}

function TopCompaniesTable() {
  const [data, setData] = useState<TopCompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getTopCompanies(10)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ChartLoader />;
  }

  if (!data || !data.companies?.length) {
    return <div className="text-gray-400 text-center py-8">Chưa có dữ liệu</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-[16px] font-medium text-gray-500">#</th>
            <th className="text-left py-3 px-4 text-[16px] font-medium text-gray-500">Công ty</th>
            <th className="text-right py-3 px-4 text-[16px] font-medium text-gray-500">Jobs</th>
            <th className="text-right py-3 px-4 text-[16px] font-medium text-gray-500">Đơn ứng tuyển</th>
            <th className="text-right py-3 px-4 text-[16px] font-medium text-gray-500">Đã tuyển</th>
            <th className="text-right py-3 px-4 text-[16px] font-medium text-gray-500">Doanh thu</th>
            <th className="text-right py-3 px-4 text-[16px] font-medium text-gray-500">Streams</th>
          </tr>
        </thead>
        <tbody>
          {data.companies.map((company) => (
            <tr key={company.companyId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[16px] font-bold
                  ${company.rank <= 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}
                >
                  {company.rank}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.companyName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium text-gray-900">{company.companyName}</span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-[16px]">{company.totalJobs.toLocaleString()}</td>
              <td className="text-right py-3 px-4 text-[16px]">
                {company.totalApplications.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-[16px]">{company.totalHired.toLocaleString()}</td>
              <td className="text-right py-3 px-4 text-[16px] font-medium">
                ${company.totalRevenue?.toLocaleString() || "0"}
              </td>
              <td className="text-right py-3 px-4 text-[16px]">
                {company.streamSessions.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}