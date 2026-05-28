"use client";
import { useState, useEffect, useCallback } from "react";
import Link                                  from "next/link";
import { useRouter }                         from "next/navigation";
import {
  Briefcase, MapPin, Clock, Calendar,
  Sparkles, ChevronRight, Building2,
  FileText, CheckCircle, Users,
} from "lucide-react";
import { ApplicationStatusBadge }           from "@/presentation/components/applications/ApplicationStatusBadge";
import { CandidateFilterBar }               from "@/presentation/components/candidate/CandidateFilterBar";
import type { CandidateFilterParams }       from "@/presentation/components/candidate/CandidateFilterBar";
import { ApplicationService }               from "@/application/services/ApplicationService";
import { ApplicationRepository }            from "@/infrastructure/repositories/ApplicationRepository";
import { LoadingSpinner }                   from "@/presentation/components/common";
import { Pagination }                       from "@/presentation/components/common/Pagination";
import type {
  ApplicationWithJob,
  ApplicationStatus,
  MyApplicationsParams,
} from "@/domain/models/Application";
import { extractErrorMessage }              from "@/lib/extractErrorMessage";
import { useToast }                         from "@/presentation/components/ui/toast";

const service = new ApplicationService(new ApplicationRepository());

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"       },
  { value: "SUBMITTED",           label: "Đã nộp"       },
  { value: "REVIEWING",           label: "Đang xem xét" },
  { value: "SHORTLISTED",         label: "Được chọn"    },
  { value: "INTERVIEW_SCHEDULED", label: "Phỏng vấn"    },
  { value: "OFFERED",             label: "Có offer"     },
  { value: "ACCEPTED",            label: "Đã chấp nhận" },
  { value: "REJECTED",            label: "Từ chối"      },
  { value: "WITHDRAWN",           label: "Đã rút"       },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ── AI Score badge ──────────────────────────────────────────────────────────────

function AIScoreBadge({ score, label }: { score?: number | null; label?: string | null }) {
  if (!score) return null;
  const color = score >= 80
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score >= 60
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold
      rounded-full border ${color}`}>
      <Sparkles size={9} />
      {score}% {label && `· ${label}`}
    </span>
  );
}

// ── Job type label ──────────────────────────────────────────────────────────────

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  "Toàn thời gian",
  PART_TIME:  "Bán thời gian",
  REMOTE:     "Remote",
  CONTRACT:   "Hợp đồng",
  INTERNSHIP: "Thực tập",
  FREELANCE:  "Freelance",
};

// ── Skeleton ────────────────────────────────────────────────────────────────────

function AppSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-24 bg-gray-100 rounded-full ml-auto" />
      </div>
      <div className="h-px bg-gray-50" />
      <div className="flex justify-between">
        <div className="h-3 w-28 bg-gray-100 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function CandidateApplicationsPage() {
  const toast  = useToast();
  const router = useRouter();

  const [apps,         setApps]         = useState<ApplicationWithJob[]>([]);
  const [statusCounts, setStatusCounts] = useState<Partial<Record<ApplicationStatus | "ALL", number>>>({});
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);

  // initialLoad: true = chưa có data lần nào → dùng skeleton đầy đủ
  // loading:     true = đang fetch (kể cả refetch) → dùng overlay mờ
  const [initialLoad, setInitialLoad]   = useState(true);
  const [loading,     setLoading]       = useState(true);

  const [activeTab,    setActiveTab]    = useState<ApplicationStatus | "ALL">("ALL");
  const [filterParams, setFilterParams] = useState<CandidateFilterParams>({
    keyword: "", appliedAtFrom: "", appliedAtTo: "",
  });
  const [page,     setPage]     = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── Derived stats từ data hiện tại ──────────────────────────────────────────
  const reviewing   = apps.filter(a => a.status === "REVIEWING").length;
  const scheduled   = apps.filter(a => a.status === "INTERVIEW_SCHEDULED").length;
  const shortlisted = apps.filter(a => a.status === "SHORTLISTED").length;

  const load = useCallback(async (params: MyApplicationsParams) => {
    setLoading(true);
    try {
      const res = await service.getMyApplications(params);
      setApps(res.applications.content);
      setTotalPages(res.applications.totalPages);
      setTotal(res.totalApplications);
      const counts = { ...res.statusCounts, ALL: res.totalApplications } as
        Partial<Record<ApplicationStatus | "ALL", number>>;
      setStatusCounts(counts);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [toast]);

  useEffect(() => {
    load({
      page,
      size:          pageSize,
      status:        activeTab === "ALL" ? undefined : activeTab,
      keyword:       filterParams.keyword       || undefined,
      appliedAtFrom: filterParams.appliedAtFrom || undefined,
      appliedAtTo:   filterParams.appliedAtTo   || undefined,
    });
  }, [page, pageSize, activeTab, filterParams, load]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ApplicationStatus | "ALL");
    setPage(0);
  };

  // Chỉ gọi khi nhấn nút Tìm kiếm hoặc Enter — giống EmployerFilterBar
  const handleFilter = (params: CandidateFilterParams) => {
    setFilterParams(params);
    setPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const handleExportExcel = () => {
    toast.success("Đang xuất Excel", "File sẽ được tải về sau vài giây.");
  };

  const tabs = STATUS_TABS.map(t => ({ ...t, count: statusCounts[t.value] ?? 0 }));
  const hasActiveFilter = !!(filterParams.keyword || filterParams.appliedAtFrom || filterParams.appliedAtTo);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Users       size={18} className="text-blue-600"   />}
          label="Tổng đơn"      value={total}       color="bg-blue-50"
        />
        <StatCard
          icon={<Clock       size={18} className="text-amber-500"  />}
          label="Đang xem xét"  value={reviewing}   color="bg-amber-50"
        />
        <StatCard
          icon={<Calendar    size={18} className="text-purple-600" />}
          label="Có lịch PV"    value={scheduled}   color="bg-purple-50"
        />
        <StatCard
          icon={<CheckCircle size={18} className="text-emerald-600" />}
          label="Được chọn"     value={shortlisted} color="bg-emerald-50"
        />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <CandidateFilterBar
        statusTabs={tabs}
        activeStatus={activeTab}
        onStatusChange={handleTabChange}
        searchPlaceholder="Tìm theo tên việc làm..."
        showDateRange
        onFilter={handleFilter}
        loading={loading}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onExportExcel={handleExportExcel}
      />

      {/* ── Result count — giữ chỗ bằng min-height ───────────────────────── */}
      <div className="min-h-[20px] -mt-1">
        {!loading && (
          <p className="text-xs text-gray-500">
            <strong className="text-gray-800">{total}</strong> đơn ứng tuyển
          </p>
        )}
      </div>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      {initialLoad ? (
        // Skeleton đầy đủ chỉ lần đầu
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => <AppSkeleton key={i} />)}
        </div>
      ) : (
        // Wrapper mờ khi refetch — không nhảy layout
        <div className={`relative transition-opacity duration-150 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}>
          {/* Overlay spinner nhỏ góc trên phải khi refetch */}
          {loading && (
            <div className="absolute -top-8 right-0 z-10 flex items-center gap-1.5 text-xs text-gray-400">
              <LoadingSpinner size="sm" variant="secondary" />
              Đang tải...
            </div>
          )}

          {apps.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <Briefcase size={36} strokeWidth={1.2} />
              <p className="text-[15px]">
                {hasActiveFilter ? "Không có đơn phù hợp với bộ lọc" : "Chưa có đơn ứng tuyển nào"}
              </p>
              {!hasActiveFilter && (
                <Link href="/jobs" className="text-sm text-blue-600 hover:underline">
                  Tìm việc làm ngay →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apps.map(app => {
                const city    = app.job?.workLocationCity ?? app.job?.city ?? app.company?.city;
                const jobType = app.job?.jobType ? JOB_TYPE_LABELS[app.job.jobType] ?? app.job.jobType : null;
                const deadline = app.job?.deadline
                  ? new Date(app.job.deadline).toLocaleDateString("vi-VN")
                  : null;

                return (
                  <button
                    key={app.id}
                    onClick={() => router.push(`/candidate/applications/${app.id}`)}
                    className="text-left group w-full"
                  >
                    <div className="bg-white border border-gray-100 rounded-2xl p-4
                      hover:border-blue-200 hover:shadow-md transition-all duration-200
                      flex flex-col gap-3">

                      {/* Header: logo + title + status */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50
                          border border-gray-100 shrink-0 flex items-center justify-center">
                          {app.company?.logoUrl
                            ? <img src={app.company.logoUrl} alt={app.company.name}
                                   className="w-full h-full object-contain p-0.5" />
                            : <Building2 size={18} className="text-gray-300" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-400 truncate leading-tight">
                            {app.company?.name}
                          </p>
                          <p className="text-[14px] font-semibold text-gray-900
                            group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mt-0.5">
                            {app.job?.title}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={app.status} />
                      </div>

                      {/* Tags: jobType + city + salary */}
                      <div className="flex flex-wrap gap-1.5">
                        {jobType && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium
                            bg-gray-100 text-gray-600 rounded-full">
                            {jobType}
                          </span>
                        )}
                        {city && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px]
                            font-medium bg-gray-100 text-gray-600 rounded-full">
                            <MapPin size={9} /> {city}
                          </span>
                        )}
                        {app.job?.salary && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold
                            bg-blue-50 text-blue-700 rounded-full ml-auto">
                            {app.job.salary}
                          </span>
                        )}
                      </div>

                      {/* AI Score */}
                      {app.hasAIScore && (
                        <AIScoreBadge
                          score={(app as any).aiScore}
                          label={(app as any).aiScoreLabel}
                        />
                      )}

                      {/* Interview alert */}
                      {app.scheduledAt && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50
                          rounded-xl text-xs text-purple-700 font-medium">
                          <Calendar size={12} className="shrink-0" />
                          Phỏng vấn: {new Date(app.scheduledAt).toLocaleString("vi-VN")}
                        </div>
                      )}

                      {/* Footer: date + deadline + arrow */}
                      <div className="flex items-center justify-between pt-1
                        border-t border-gray-50 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          Nộp {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex items-center gap-2">
                          {deadline && (
                            <span className="text-orange-400">HH: {deadline}</span>
                          )}
                          <ChevronRight size={13}
                            className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination — giữ chỗ để không nhảy layout */}
      <div className="min-h-[40px] flex justify-center">
        {!initialLoad && totalPages > 1 && (
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={p => setPage(p - 1)}
          />
        )}
      </div>

    </div>
  );
}