"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  EmployerAnalyticsService,
  DashboardViewModel,
  FunnelChartData,
  JobPerformanceTableRow,
  TrendChartPoint,
} from "@/application/services/EmployerAnalyticsService";

const analyticsService = new EmployerAnalyticsService();

const FUNNEL_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: "bg-emerald-50", text: "text-emerald-700" },
  PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700" },
  CLOSED:    { bg: "bg-gray-100",   text: "text-gray-500"   },
  DRAFT:     { bg: "bg-amber-50",   text: "text-amber-700"  },
};

const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

function StatCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string | number; sub?: string; accent?: string; icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-500">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${accent ?? "text-gray-900"}`}>{value}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function QuotaBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct  = total > 0 ? Math.round((used / total) * 100) : 0;
  const warn = pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px]">
        <span className="text-gray-600">{label}</span>
        <span className={warn ? "text-red-500 font-semibold" : "text-gray-500"}>{used}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${warn ? "bg-red-400" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className ?? ""}`} />;
}

const CustomFunnelTooltip = ({
  active, payload,
}: {
  active?: boolean; payload?: { payload: FunnelChartData }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800">{d.label}</p>
      <p className="text-indigo-600 font-bold text-lg">{d.value.toLocaleString()}</p>
      <p className="text-gray-400">{d.percent}% so với tổng</p>
      {d.dropRate > 0 && (
        <p className="text-red-400 text-xs mt-0.5">−{d.dropRate}% so với bước trước</p>
      )}
    </div>
  );
};

const CustomTrendTooltip = ({
  active, payload, label,
}: {
  active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name === "applications" ? "Ứng tuyển" : "Lượt xem"}</span>
          <span className="font-bold text-gray-800 ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [vm,      setVm]      = useState<DashboardViewModel | null>(null);
  const [funnel,  setFunnel]  = useState<FunnelChartData[]>([]);
  const [jobs,    setJobs]    = useState<JobPerformanceTableRow[]>([]);
  const [trend,   setTrend]   = useState<TrendChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"company" | "jobs">("company");
  const [mounted,   setMounted]   = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { vm: vmData, funnel: funnelData, jobs: jobsData, trend: trendData } =
        await analyticsService.fetchAll();
      setVm(vmData);
      setFunnel(funnelData);
      setJobs(jobsData);
      setTrend(trendData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
    const timer = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  if (loading && !vm) {
    return (
      <div className="space-y-6 pb-10">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Thống kê</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={loadData} className="text-[13px] text-red-500 underline underline-offset-2">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!vm) return null;

  const d = vm.dashboard;
  const conversionRate    = funnel[funnel.length - 1]?.percent ?? 0;
  const screeningPassRate = funnel[1]?.percent ?? 0;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">Hiệu quả đăng tuyển của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
          <span className="text-[12px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            Cập nhật mỗi 2 phút
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tin đang tuyển"  value={d.activeJobs}                     sub={`${d.jobsExpiringSoon} sắp hết hạn`}                                               icon="📋" />
        <StatCard label="Tổng ứng viên"   value={d.totalApplications.toLocaleString()} sub={`+${d.newApplicationsToday} hôm nay`} accent="text-indigo-600"               icon="👥" />
        <StatCard label="Đơn ứng tuyển chờ xét duyệt"   value={d.pendingReview}                  sub="cần xem lại"                                                                       icon="⏳" />
        <StatCard label="Từ livestream"   value={d.appliesFromStream}               sub={`${d.totalStreamSessions} phiên · ${d.totalStreamViewers.toLocaleString()} xem`} icon="🎥" />
      </div>

      {/* Quota + overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="text-[13px] font-semibold text-gray-700">Hạn mức đăng tuyển</p>
          <QuotaBar label="Job post"              used={d.quotaUsed}       total={d.quotaTotal}       />
          <QuotaBar label="Livestream tuyển dụng" used={d.streamQuotaUsed} total={d.streamQuotaTotal} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-[13px] font-semibold text-gray-700 mb-4">Tổng quan tin tuyển dụng</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Đang hoạt động", val: d.activeJobs,      color: "text-emerald-600" },
              { label: "Bản nháp",       val: d.draftJobs,        color: "text-amber-500"  },
              { label: "Tổng lịch sử",   val: d.totalJobsAllTime, color: "text-indigo-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl py-3">
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-800">Xu hướng ứng tuyển & lượt xem</p>
            <p className="text-[12px] text-gray-400">12 tháng gần nhất</p>
          </div>
          <div className="flex gap-4 text-[12px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-500 rounded-full inline-block" />
              Ứng tuyển
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full inline-block" />
              Lượt xem
            </span>
          </div>
        </div>

        {mounted && trend.length === 0 && (
          <p className="text-center text-[13px] text-gray-400 py-8">Chưa có dữ liệu xu hướng</p>
        )}

        {mounted && trend.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradView" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34d399" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Area type="monotone" dataKey="views"        stroke="#34d399" strokeWidth={2}   fill="url(#gradView)" dot={false} />
              <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradApp)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Funnel / Jobs tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["company", "jobs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/40"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "company" ? "Phễu ứng tuyển toàn công ty" : "Hiệu suất từng tin"}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* ── Funnel tab */}
          {activeTab === "company" && mounted && (
            <div className="space-y-5">
              {funnel.length === 0 && (
                <p className="text-center text-[13px] text-gray-400 py-8">Chưa có dữ liệu phễu</p>
              )}

              {funnel.length > 0 && (
                <>
                  <p className="text-[12px] text-gray-400">
                    Tổng hợp tất cả job posts · Conversion rate:{" "}
                    <strong className="text-indigo-600">{conversionRate}%</strong>
                    {" "}· Screening pass rate:{" "}
                    <strong className="text-indigo-600">{screeningPassRate}%</strong>
                  </p>

                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomFunnelTooltip />} cursor={{ fill: "#f5f3ff" }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                        {funnel.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i] ?? "#e0e7ff"} />)}
                        <LabelList
                          dataKey="percent"
                          position="right"
                          formatter={(v: number) => `${v}%`}
                          style={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {funnel.map((s, i) => (
                      <div key={s.stage} className="flex items-center gap-1 shrink-0">
                        <div
                          className="text-center px-4 py-2.5 rounded-xl border"
                          style={{
                            borderColor: (FUNNEL_COLORS[i] ?? "#e0e7ff") + "60",
                            background:  (FUNNEL_COLORS[i] ?? "#e0e7ff") + "12",
                          }}
                        >
                          <p className="text-[11px] text-gray-500">{s.label}</p>
                          <p className="text-lg font-bold" style={{ color: FUNNEL_COLORS[i] ?? "#6366f1" }}>
                            {s.value.toLocaleString()}
                          </p>
                        </div>
                        {i < funnel.length - 1 && <span className="text-gray-300 text-lg">›</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Jobs tab */}
          {activeTab === "jobs" && (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="text-left  py-2 pr-4 font-medium">Tin tuyển dụng</th>
                    <th className="text-right py-2 px-3 font-medium">Lượt xem</th>
                    <th className="text-right py-2 px-3 font-medium">Ứng viên</th>
                    <th className="text-right py-2 px-3 font-medium">Đã tuyển</th>
                    <th className="text-right py-2 px-3 font-medium">Conv.%</th>
                    <th className="text-right py-2 pl-3 font-medium">Hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((j) => {
                    const st = STATUS_COLOR[j.status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
                    const deadlineWarn = j.daysLeft !== null && j.daysLeft <= 7;
                    return (
                      <tr key={j.jobPostId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.bg} ${st.text}`}>
                              {j.status}
                            </span>
                            <span className="font-medium text-gray-800 truncate max-w-[160px]">{j.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600">{j.viewCount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-gray-800 font-medium">{j.totalApplications}</td>
                        <td className="py-3 px-3 text-right text-emerald-600 font-semibold">{j.hired}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-bold ${j.conversionRate >= 5 ? "text-indigo-600" : "text-gray-500"}`}>
                            {j.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {j.daysLeft === null ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className={`font-medium ${deadlineWarn ? "text-red-500" : "text-gray-500"}`}>
                              {deadlineWarn ? "⚠ " : ""}{j.daysLeft}d
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 text-[13px]">
                        Chưa có dữ liệu hiệu suất
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {mounted && jobs.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-700 mb-4">So sánh lượt xem theo tin</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={jobs} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) => v.split(" ").slice(0, 2).join(" ")}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: number) => [v.toLocaleString(), "Lượt xem"]}
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }}
                      />
                      <Bar dataKey="viewCount" radius={[5, 5, 0, 0]} fill="#6366f1" opacity={0.85} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}