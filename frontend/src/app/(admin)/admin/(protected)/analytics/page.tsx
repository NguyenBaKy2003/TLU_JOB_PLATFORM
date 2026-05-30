"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";

Chart.register(
  LineController,
  BarController,
  DoughnutController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const analyticsService = new AdminAnalyticsService(new AdminAnalyticsRepository());

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatMonthLabel(label: string): string {
  if (label.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = label.split("-");
    return `T${parseInt(month)}/${year.slice(2)}`;
  }
  return label;
}

// ─── Page ──────────────────────────────────────────────────────────────────

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

      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Người dùng" value={dashboard.totalUsers.toLocaleString()} icon={<Users className="h-6 w-6" />} color="blue">
          <StatDetail label="Ứng viên" value={dashboard.totalCandidates.toLocaleString()} />
          <StatDetail label="Nhà tuyển dụng" value={dashboard.totalEmployers.toLocaleString()} />
          <StatDetail label="Mới tháng này" value={dashboard.newUsersThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.userGrowthRate} />
        </StatCard>

        <StatCard title="Công ty" value={dashboard.totalCompanies.toLocaleString()} icon={<Building2 className="h-6 w-6" />} color="green">
          <StatDetail label="Đã xác thực" value={dashboard.verifiedCompanies.toLocaleString()} />
          <StatDetail label="Chờ xác thực" value={dashboard.pendingVerification.toLocaleString()} />
        </StatCard>

        <StatCard title="Công việc" value={dashboard.totalJobs.toLocaleString()} icon={<Briefcase className="h-6 w-6" />} color="purple">
          <StatDetail label="Đang tuyển" value={dashboard.activeJobs.toLocaleString()} />
          <StatDetail label="Mới tháng này" value={dashboard.jobsThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.jobGrowthRate} />
        </StatCard>

        <StatCard title="Đơn ứng tuyển" value={dashboard.totalApplications.toLocaleString()} icon={<FileText className="h-6 w-6" />} color="orange">
          <StatDetail label="Tháng này" value={dashboard.applicationsThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.applicationGrowthRate} />
        </StatCard>
      </div>

      {/* Row 2 — secondary KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Doanh thu tháng này" value={`$${dashboard.revenueThisMonth?.toLocaleString() || "0"}`} icon={<DollarSign className="h-6 w-6" />} color="yellow">
          <StatDetail label="Tháng trước" value={`$${dashboard.revenueLastMonth?.toLocaleString() || "0"}`} />
          <GrowthRate rate={dashboard.revenueGrowthRate} />
        </StatCard>

        <StatCard title="Livestream" value={dashboard.totalStreamSessions.toLocaleString()} icon={<Radio className="h-6 w-6" />} color="red">
          <StatDetail label="Sessions tháng này" value={dashboard.streamSessionsThisMonth.toLocaleString()} />
          <StatDetail label="Tổng viewers" value={dashboard.totalStreamViewers.toLocaleString()} />
          <StatDetail label="Ứng tuyển từ stream" value={dashboard.appliesFromStream.toLocaleString()} />
        </StatCard>

        <StatCard
          title="Kiểm duyệt"
          value={(dashboard.pendingCompanyVerifications + dashboard.pendingJobApprovals + dashboard.flaggedJobs).toLocaleString()}
          icon={<ShieldAlert className="h-6 w-6" />}
          color="red"
        >
          <StatDetail label="Công ty chờ duyệt" value={dashboard.pendingCompanyVerifications.toLocaleString()} highlight={dashboard.pendingCompanyVerifications > 0} />
          <StatDetail label="Jobs chờ duyệt" value={dashboard.pendingJobApprovals.toLocaleString()} highlight={dashboard.pendingJobApprovals > 0} />
          <StatDetail label="Jobs bị flag" value={dashboard.flaggedJobs.toLocaleString()} highlight={dashboard.flaggedJobs > 0} />
        </StatCard>
      </div>

      {/* Row 3 — charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Tăng trưởng người dùng">
          <UserGrowthChart />
        </ChartCard>
        <ChartCard title="Doanh thu">
          <RevenueChart />
        </ChartCard>
      </div>

      {/* Row 4 — top companies */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Top công ty">
          <TopCompaniesChart />
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Stat sub-components ───────────────────────────────────────────────────

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
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
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
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

function GrowthRate({ rate }: { rate: number }) {
  const isPositive = rate >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className ?? ""}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Chart Components ──────────────────────────────────────────────────────

function ChartLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

function UserGrowthChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getUserGrowth(12)
      .then((data: TimeSeriesResponse) => {
        if (!canvasRef.current || !data?.data?.length) return;

        chartRef.current?.destroy();

        const labels = data.data.map((d) => formatMonthLabel(d.label));
        const values = data.data.map((d) => d.value);

        const chartData: ChartData<"line"> = {
          labels,
          datasets: [
            {
              label: "Người dùng mới",
              data: values,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.12)",
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
            },
          ],
        };

        const options: ChartOptions<"line"> = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: "#9ca3af", maxRotation: 45 },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            y: {
              ticks: {
                font: { size: 11 },
                color: "#9ca3af",
                callback: (v) => Number(v).toLocaleString(),
              },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
          },
        };

        chartRef.current = new Chart(canvasRef.current, { type: "line", data: chartData, options });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  if (loading) return <ChartLoader />;

  return (
    <div className="relative w-full h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}

function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getRevenueReport(12)
      .then((data: TimeSeriesResponse) => {
        if (!canvasRef.current || !data?.data?.length) return;

        chartRef.current?.destroy();

        const labels = data.data.map((d) => formatMonthLabel(d.label));
        const values = data.data.map((d) => d.value);

        const chartData: ChartData<"bar"> = {
          labels,
          datasets: [
            {
              label: "Doanh thu ($)",
              data: values,
              backgroundColor: "rgba(34,197,94,0.75)",
              borderColor: "#16a34a",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        };

        const options: ChartOptions<"bar"> = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `$${Number(ctx.parsed.y).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: "#9ca3af", maxRotation: 45 },
              grid: { display: false },
            },
            y: {
              ticks: {
                font: { size: 11 },
                color: "#9ca3af",
                callback: (v) => `$${Number(v).toLocaleString()}`,
              },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
          },
        };

        chartRef.current = new Chart(canvasRef.current, { type: "bar", data: chartData, options });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  if (loading) return <ChartLoader />;

  return (
    <div className="relative w-full h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}

function TopCompaniesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getTopCompanies(10)
      .then((data: TopCompaniesResponse) => {
        if (!canvasRef.current || !data?.companies?.length) return;

        chartRef.current?.destroy();

        const companies = data.companies.slice(0, 10);
        const labels = companies.map((c) => c.companyName);

        const COLORS = [
          "rgba(59,130,246,0.8)",
          "rgba(34,197,94,0.8)",
          "rgba(168,85,247,0.8)",
          "rgba(249,115,22,0.8)",
          "rgba(20,184,166,0.8)",
          "rgba(236,72,153,0.8)",
          "rgba(234,179,8,0.8)",
          "rgba(239,68,68,0.8)",
          "rgba(99,102,241,0.8)",
          "rgba(14,165,233,0.8)",
        ];

        const chartData: ChartData<"bar"> = {
          labels,
          datasets: [
            {
              label: "Đơn ứng tuyển",
              data: companies.map((c) => c.totalApplications),
              backgroundColor: companies.map((_, i) => COLORS[i % COLORS.length]),
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: "Đã tuyển",
              data: companies.map((c) => c.totalHired),
              backgroundColor: companies.map((_, i) => COLORS[i % COLORS.length].replace("0.8", "0.35")),
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        };

        const options: ChartOptions<"bar"> = {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { font: { size: 11 }, color: "#6b7280", boxWidth: 12, padding: 16 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => Number(v).toLocaleString() },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            y: {
              ticks: { font: { size: 12 }, color: "#374151" },
              grid: { display: false },
            },
          },
        };

        chartRef.current = new Chart(canvasRef.current, { type: "bar", data: chartData, options });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  if (loading) return <ChartLoader />;

  return (
    <div className="relative w-full" style={{ height: "420px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}