"use client";
import { useEffect }       from "react";
import { useRouter }       from "next/navigation";
import { useAdminAuth }    from "@/application/contexts/AdminAuthContext";
import { AdminDashboard }  from "@/presentation/components/admin-dashboard";

export default function AdminDashboardPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const router                      = useRouter();

  useEffect(() => {
    if (adminLoading) return;
    if (!adminUser || adminUser.role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [adminUser, adminLoading, router]);

  if (adminLoading || !adminUser || adminUser.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-600
            border-t-transparent animate-spin" />
          <p className="text-[16px] text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Cập nhật lúc: {new Date(dashboard.generatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500
            border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* ── Row 1: KPI chính ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard title="Người dùng" value={dashboard.totalUsers.toLocaleString()} icon={<Users className="h-5 w-5" />} color="blue">
          <StatDetail label="Ứng viên"        value={dashboard.totalCandidates.toLocaleString()} />
          <StatDetail label="Nhà tuyển dụng"  value={dashboard.totalEmployers.toLocaleString()} />
          <StatDetail label="Mới tháng này"   value={dashboard.newUsersThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.userGrowthRate} />
        </StatCard>

        <StatCard title="Công ty" value={dashboard.totalCompanies.toLocaleString()} icon={<Building2 className="h-5 w-5" />} color="green">
          <StatDetail label="Đã xác thực" value={dashboard.verifiedCompanies.toLocaleString()} />
          <StatDetail label="Chờ xác thực" value={dashboard.pendingVerification.toLocaleString()} highlight={dashboard.pendingVerification > 0} />
        </StatCard>

        <StatCard title="Công việc" value={dashboard.totalJobs.toLocaleString()} icon={<Briefcase className="h-5 w-5" />} color="purple">
          <StatDetail label="Đang tuyển"   value={dashboard.activeJobs.toLocaleString()} />
          <StatDetail label="Mới tháng này" value={dashboard.jobsThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.jobGrowthRate} />
        </StatCard>

        <StatCard title="Đơn ứng tuyển" value={dashboard.totalApplications.toLocaleString()} icon={<FileText className="h-5 w-5" />} color="orange">
          <StatDetail label="Tháng này" value={dashboard.applicationsThisMonth.toLocaleString()} />
          <GrowthRate rate={dashboard.applicationGrowthRate} />
        </StatCard>
      </div>

      {/* ── Row 2: KPI phụ ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard title="Doanh thu tháng này" value={`$${dashboard.revenueThisMonth?.toLocaleString() || "0"}`} icon={<DollarSign className="h-5 w-5" />} color="yellow">
          <StatDetail label="Tháng trước" value={`$${dashboard.revenueLastMonth?.toLocaleString() || "0"}`} />
          <GrowthRate rate={dashboard.revenueGrowthRate} />
        </StatCard>

        <StatCard title="Livestream" value={dashboard.totalStreamSessions.toLocaleString()} icon={<Radio className="h-5 w-5" />} color="red">
          <StatDetail label="Sessions tháng này"  value={dashboard.streamSessionsThisMonth.toLocaleString()} />
          <StatDetail label="Tổng viewers"         value={dashboard.totalStreamViewers.toLocaleString()} />
          <StatDetail label="Ứng tuyển từ stream" value={dashboard.appliesFromStream.toLocaleString()} />
        </StatCard>

        <StatCard
          title="Kiểm duyệt"
          value={(dashboard.pendingCompanyVerifications + dashboard.pendingJobApprovals + dashboard.flaggedJobs).toLocaleString()}
          icon={<ShieldAlert className="h-5 w-5" />}
          color="red"
        >
          <StatDetail label="Công ty chờ duyệt" value={dashboard.pendingCompanyVerifications.toLocaleString()} highlight={dashboard.pendingCompanyVerifications > 0} />
          <StatDetail label="Jobs chờ duyệt"    value={dashboard.pendingJobApprovals.toLocaleString()}         highlight={dashboard.pendingJobApprovals > 0} />
          <StatDetail label="Jobs bị flag"       value={dashboard.flaggedJobs.toLocaleString()}                 highlight={dashboard.flaggedJobs > 0} />
        </StatCard>
      </div>

      {/* ── Row 3: Cần xử lý ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <PendingJobsCard   jobs={pendingJobs}           total={dashboard.pendingJobApprovals} />
        <PendingCompaniesCard companies={pendingCompanies} total={dashboard.pendingCompanyVerifications} /> {/* AdminCompany[] */}
      </div>

      {/* ── Row 4: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Tăng trưởng người dùng"><UserGrowthChart /></ChartCard>
        <ChartCard title="Doanh thu"><RevenueChart /></ChartCard>
      </div>

      <ChartCard title="Top công ty tuyển dụng">
        <TopCompaniesChart />
      </ChartCard>
    </div>
  );
}

// ─── Pending Jobs Card ─────────────────────────────────────────────────────

function PendingJobsCard({ jobs, total }: { jobs: AdminJob[]; total: number }) {
  return (
    <ActionCard
      title="Jobs chờ duyệt"
      total={total}
      icon={<Briefcase size={16} className="text-purple-500" />}
      badgeColor="bg-purple-100 text-purple-700"
      viewAllHref="/admin/jobs?status=PENDING_REVIEW"
      empty={jobs.length === 0}
      emptyLabel="Không có job nào chờ duyệt"
    >
      {jobs.map((job) => (
        <div key={job.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Briefcase size={14} className="text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{job.companyName}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={10} /> {timeAgo(job.createdAt)}
            </span>
            <Link
              href={`/admin/jobs/${job.id}`}
              className="text-[11px] text-purple-600 hover:underline font-medium"
            >
              Xem →
            </Link>
          </div>
        </div>
      ))}
    </ActionCard>
  );
}

// ─── Pending Companies Card ────────────────────────────────────────────────

function PendingCompaniesCard({ companies, total }: { companies: AdminCompany[]; total: number }) {
  return (
    <ActionCard
      title="Công ty chờ xác thực"
      total={total}
      icon={<Building2 size={16} className="text-green-500" />}
      badgeColor="bg-green-100 text-green-700"
      viewAllHref="/admin/companies?status=UNVERIFIED"
      empty={companies.length === 0}
      emptyLabel="Không có công ty nào chờ xác thực"
    >
      {companies.map((company) => (
        <div key={company.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            {company.logoUrl
              ? <img src={company.logoUrl} alt={company.companyName ?? company.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Building2 size={14} className="text-gray-400" />
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {company.companyName ?? company.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {company.city ?? company.location ?? "—"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={10} /> {timeAgo(company.createdAt)}
            </span>
            <Link
              href={`/admin/companies/${company.id}`}
              className="text-[11px] text-green-600 hover:underline font-medium"
            >
              Xem →
            </Link>
          </div>
        </div>
      ))}
    </ActionCard>
  );
}

// ─── ActionCard shell ──────────────────────────────────────────────────────

function ActionCard({
  title, total, icon, badgeColor,
  viewAllHref, empty, emptyLabel, children,
}: {
  title:       string;
  total:       number;
  icon:        React.ReactNode;
  badgeColor:  string;
  viewAllHref: string;
  empty:       boolean;
  emptyLabel:  string;
  children:    React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {total > 0 && (
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${badgeColor}`}>
              {total}
            </span>
          )}
        </div>
        <Link href={viewAllHref} className="flex items-center gap-0.5 text-xs text-blue-500 hover:underline">
          Xem tất cả <ChevronRight size={12} />
        </Link>
      </div>

      {empty ? (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-sm">{emptyLabel}</span>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

// ─── Stat sub-components ───────────────────────────────────────────────────

type StatColor = "blue" | "green" | "purple" | "orange" | "yellow" | "red";

function StatCard({ title, value, icon, color, children }: {
  title:    string;
  value:    string;
  icon:     React.ReactNode;
  color:    StatColor;
  children: React.ReactNode;
}) {
  const colorClasses: Record<StatColor, string> = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red:    "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-3">{value}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function StatDetail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

function GrowthRate({ rate }: { rate: number }) {
  const pos = rate >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${pos ? "text-green-600" : "text-red-500"}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{Math.abs(rate).toFixed(1)}%</span>
      <span className="text-gray-400 font-normal">so với tháng trước</span>
    </div>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className ?? ""}`}>
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Chart Components ──────────────────────────────────────────────────────

function ChartLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
    </div>
  );
}

function UserGrowthChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getUserGrowth(12)
      .then((data: TimeSeriesResponse) => {
        if (!canvasRef.current || !data?.data?.length) return;
        chartRef.current?.destroy();
        const labels = data.data.map((d) => formatMonthLabel(d.label));
        const values = data.data.map((d) => d.value);
        chartRef.current = new Chart(canvasRef.current, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "Người dùng mới",
              data: values,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.10)",
              fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2,
            }],
          } satisfies ChartData<"line">,
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
            scales: {
              x: { ticks: { font: { size: 11 }, color: "#9ca3af", maxRotation: 45 }, grid: { color: "rgba(0,0,0,0.04)" } },
              y: { ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => Number(v).toLocaleString() }, grid: { color: "rgba(0,0,0,0.04)" } },
            },
          } satisfies ChartOptions<"line">,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => { chartRef.current?.destroy(); };
  }, []);

  if (loading) return <ChartLoader />;
  return <div className="relative w-full h-56"><canvas ref={canvasRef} /></div>;
}

function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getRevenueReport(12)
      .then((data: TimeSeriesResponse) => {
        if (!canvasRef.current || !data?.data?.length) return;
        chartRef.current?.destroy();
        const labels = data.data.map((d) => formatMonthLabel(d.label));
        const values = data.data.map((d) => d.value);
        chartRef.current = new Chart(canvasRef.current, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Doanh thu ($)", data: values,
              backgroundColor: "rgba(34,197,94,0.72)",
              borderColor: "#16a34a", borderWidth: 1, borderRadius: 4,
            }],
          } satisfies ChartData<"bar">,
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `$${Number(ctx.parsed.y).toLocaleString()}` } },
            },
            scales: {
              x: { ticks: { font: { size: 11 }, color: "#9ca3af", maxRotation: 45 }, grid: { display: false } },
              y: { ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => `$${Number(v).toLocaleString()}` }, grid: { color: "rgba(0,0,0,0.04)" } },
            },
          } satisfies ChartOptions<"bar">,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => { chartRef.current?.destroy(); };
  }, []);

  if (loading) return <ChartLoader />;
  return <div className="relative w-full h-56"><canvas ref={canvasRef} /></div>;
}

function TopCompaniesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getTopCompanies(10)
      .then((data: TopCompaniesResponse) => {
        if (!canvasRef.current || !data?.companies?.length) return;
        chartRef.current?.destroy();
        const companies = data.companies.slice(0, 10);
        const COLORS = [
          "rgba(59,130,246,0.8)","rgba(34,197,94,0.8)","rgba(168,85,247,0.8)",
          "rgba(249,115,22,0.8)","rgba(20,184,166,0.8)","rgba(236,72,153,0.8)",
          "rgba(234,179,8,0.8)","rgba(239,68,68,0.8)","rgba(99,102,241,0.8)","rgba(14,165,233,0.8)",
        ];
        chartRef.current = new Chart(canvasRef.current, {
          type: "bar",
          data: {
            labels: companies.map((c) => c.companyName),
            datasets: [
              {
                label: "Đơn ứng tuyển",
                data: companies.map((c) => c.totalApplications),
                backgroundColor: companies.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 4, borderSkipped: false,
              },
              {
                label: "Đã tuyển",
                data: companies.map((c) => c.totalHired),
                backgroundColor: companies.map((_, i) => COLORS[i % COLORS.length].replace("0.8", "0.3")),
                borderRadius: 4, borderSkipped: false,
              },
            ],
          } satisfies ChartData<"bar">,
          options: {
            indexAxis: "y",
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "top", labels: { font: { size: 11 }, color: "#6b7280", boxWidth: 12, padding: 16 } },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              x: { ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => Number(v).toLocaleString() }, grid: { color: "rgba(0,0,0,0.04)" } },
              y: { ticks: { font: { size: 12 }, color: "#374151" }, grid: { display: false } },
            },
          } satisfies ChartOptions<"bar">,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => { chartRef.current?.destroy(); };
  }, []);

  if (loading) return <ChartLoader />;
  return <div className="relative w-full" style={{ height: 420 }}><canvas ref={canvasRef} /></div>;
}