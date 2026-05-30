"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Clock, CheckCircle, Calendar,
  Briefcase, MapPin, Coins,
  Sparkles, Eye, ArrowRight,
  Bolt, CalendarClock, Download,
} from "lucide-react";
import { ApplicationStatusBadge }    from "@/presentation/components/applications/ApplicationStatusBadge";
import { ApplicationDetailDrawer }   from "@/presentation/components/applications/ApplicationDetailDrawer";
import { ScheduleInterviewModal }    from "@/presentation/components/applications/ScheduleInterviewModal";
import { StartConversationButton }   from "@/presentation/components/applications/StartConversationButton";
import { Pagination }                from "@/presentation/components/common/Pagination";
import { LoadingSpinner }            from "@/presentation/components/common";
import {
  EmployerFilterBar,
  type FilterSearchParams,
} from "@/presentation/components/employer/common/EmployerFilterBar";
import { ApplicationService }        from "@/application/services/ApplicationService";
import { ApplicationRepository }     from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                  from "@/presentation/components/ui/toast";
import { extractErrorMessage }       from "@/lib/extractErrorMessage";
import type {
  ApplicationWithCandidate, ApplicationStatus, ApplicationDetail,
} from "@/domain/models/Application";
import { useRouter } from "next/navigation";
import { BsLadder } from "react-icons/bs";

const service = new ApplicationService(new ApplicationRepository());

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"        },
  { value: "SUBMITTED",           label: "Mới nộp"       },
  { value: "REVIEWING",           label: "Đang xem xét"  },
  { value: "SHORTLISTED",         label: "Vào danh sách" },
  { value: "INTERVIEW_SCHEDULED", label: "Đã lên lịch"   },
  { value: "OFFERED",             label: "Đã offer"      },
  { value: "HIRED",               label: "Đã tuyển"      },
  { value: "REJECTED",            label: "Từ chối"       },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", label: "text-emerald-700" };
  if (score >= 50) return { bar: "bg-amber-400",   label: "text-amber-700"  };
  return               { bar: "bg-red-400",        label: "text-red-600"    };
}

function jobTypeLabel(type?: string) {
  const map: Record<string, string> = {
    FULL_TIME: "Full-time", PART_TIME: "Part-time",
    CONTRACT: "Hợp đồng",  INTERNSHIP: "Thực tập", REMOTE: "Remote",
  };
  return type ? (map[type] ?? type) : null;
}

function levelLabel(level?: string) {
  const map: Record<string, string> = {
    INTERN: "Thực tập", JUNIOR: "Junior", MID: "Mid-level",
    SENIOR: "Senior",   LEAD: "Lead",     MANAGER: "Manager",
  };
  return level ? (map[level] ?? level) : null;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

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

// ── Card Skeleton — chỉ dùng lần đầu ─────────────────────────────────────────

function CardSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3.5 bg-gray-100 rounded w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-5 w-20 bg-gray-100 rounded-full flex-shrink-0" />
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 bg-gray-100 rounded w-full" />
            <div className="h-3.5 bg-gray-100 rounded w-4/5" />
            <div className="flex gap-2 mt-1">
              <div className="h-5 bg-gray-100 rounded-full w-20" />
              <div className="h-5 bg-gray-100 rounded-full w-16" />
            </div>
            <div className="h-px bg-gray-50 mt-1" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full w-full" />
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="flex gap-1.5">
              <div className="w-7 h-7 bg-gray-100 rounded-lg" />
              <div className="w-16 h-7 bg-gray-100 rounded-lg" />
              <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CV actions ────────────────────────────────────────────────────────────────

function useCvActions(appId: string, candidateName: string) {
  const toast = useToast();
  const [viewing,     setViewing]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleView = async () => {
    setViewing(true);
    try { await service.viewCVAsEmployer(appId); }
    catch (e) { toast.error("Không thể mở CV", extractErrorMessage(e)); }
    finally { setViewing(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await service.downloadCVAsEmployer(appId, candidateName); }
    catch (e) { toast.error("Không thể tải CV", extractErrorMessage(e)); }
    finally { setDownloading(false); }
  };

  return { viewing, downloading, handleView, handleDownload };
}

function CvActions({ appId, candidateName }: { appId: string; candidateName: string }) {
  const { viewing, downloading, handleView, handleDownload } = useCvActions(appId, candidateName);
  return (
    <>
      <button onClick={handleView} disabled={viewing || downloading} title="Xem CV"
        className="flex items-center gap-1 px-2.5 h-7 rounded-lg
          bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium
          hover:bg-blue-100 transition-colors disabled:opacity-60">
        {viewing ? <LoadingSpinner size="sm" variant="primary" /> : <Eye size={12} />}
        CV
      </button>
      <button onClick={handleDownload} disabled={viewing || downloading} title="Tải CV"
        className="w-7 h-7 rounded-lg flex items-center justify-center border
          border-gray-200 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
          hover:border-emerald-200 transition-colors disabled:opacity-60">
        {downloading ? <LoadingSpinner size="sm" variant="primary" /> : <Download size={13} />}
      </button>
    </>
  );
}

// ── Application Card ──────────────────────────────────────────────────────────

interface ApplicationCardProps {
  app: ApplicationWithCandidate;
  onSchedule: (id: string, name: string) => void;
  onDetail:   (id: string) => void;
}

function ApplicationCard({ app, onSchedule, onDetail }: ApplicationCardProps) {
  const fullName = app.candidate?.fullName ?? app.candidateName ?? "";
  const initials = fullName.split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase() || "?";
  const colors   = scoreColor(app.aiScore ?? 0);
  const jType    = jobTypeLabel(app.job?.jobType);
  const level    = levelLabel(app.job?.level);
  const salary   = app.job?.salary;
  const deadline = app.job?.deadline ? new Date(app.job.deadline).toLocaleDateString("vi-VN") : null;
  const city     = app.job?.workLocationCity;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
      hover:border-blue-100 transition-all duration-200 flex flex-col overflow-hidden">

      {/* Candidate header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {app.candidate?.avatarUrl ? (
              <img src={app.candidate.avatarUrl} alt={fullName}
                className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center
                justify-center text-sm font-semibold text-blue-600">
                {initials}
              </div>
            )}
            {app.candidate?.boosted && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px]
                bg-amber-400 rounded-full flex items-center justify-center" title="Ứng viên nổi bật">
                <Bolt size={9} className="text-white fill-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-[14px] leading-tight truncate">{fullName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{app.candidate?.email ?? app.candidateEmail}</p>
            {app.candidate?.phone && <p className="text-xs text-gray-400">{app.candidate.phone}</p>}
          </div>
          <ApplicationStatusBadge status={app.status} />
        </div>
      </div>

      <div className="mx-5 h-px bg-gray-50" />

      {/* Job info */}
      <div className="px-5 py-3.5 flex flex-col gap-2 flex-1">
        {app.job?.title && (
          <p className="text-[13.5px] font-medium text-gray-800 leading-snug line-clamp-2">
            {app.job.title}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {jType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-indigo-50 text-indigo-700 text-[11px] font-medium">
              <Briefcase size={10} /> {jType}
            </span>
          )}
          {level && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-purple-50 text-purple-700 text-[11px] font-medium">
              <BsLadder size={10} /> {level}
            </span>
          )}
          {city && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-gray-100 text-gray-600 text-[11px]">
              <MapPin size={10} /> {city}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {salary && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Coins size={11} className="text-gray-400" />
              {salary.length > 28 ? salary.slice(0, 28) + "…" : salary}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarClock size={11} /> Hạn {deadline}
            </span>
          )}
        </div>
        {app.aiScore != null ? (
          <div className="mt-1.5 pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Sparkles size={11} /> AI Score
              </span>
              <span className={`text-xs font-semibold ${colors.label}`}>
                {app.aiScore}/100 · {app.aiScoreLabel ?? ""}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${app.aiScore}%` }} />
            </div>
          </div>
        ) : (
          <div className="mt-1.5 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-300 flex items-center gap-1">
              <Sparkles size={11} /> Chưa có điểm AI
            </span>
          </div>
        )}
      </div>

      <div className="mx-5 h-px bg-gray-50" />

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={11} />
          {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
        </span>
        <div className="flex items-center gap-1.5">
          {app.status === "SHORTLISTED" && (
            <button onClick={() => onSchedule(app.id, fullName)} title="Lên lịch phỏng vấn"
              className="w-7 h-7 rounded-lg flex items-center justify-center border
                border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
              <Calendar size={13} />
            </button>
          )}
          <StartConversationButton
            candidateId={app.candidateId}
            jobPostId={app.jobPostId}
            size="sm"
            variant="ghost"
            label=""
          />
          <CvActions appId={app.id} candidateName={fullName} />
          <button onClick={() => onDetail(app.id)} title="Xem chi tiết"
            className="w-7 h-7 rounded-lg flex items-center justify-center border
              border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50
              hover:border-blue-100 transition-colors">
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScheduleTarget { id: string; candidateName: string; }

interface AppliedFilters {
  status:   ApplicationStatus | "ALL";
  search:   string;
  dateFrom: string;
  dateTo:   string;
  page:     number;
  pageSize: number;
}

const DEFAULT_FILTERS: AppliedFilters = {
  status: "ALL", search: "", dateFrom: "", dateTo: "", page: 0, pageSize: DEFAULT_PAGE_SIZE,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerApplicationsPage() {
  const toast  = useToast();
  const router = useRouter();

  const [apps,           setApps]           = useState<ApplicationWithCandidate[]>([]);
  const [totalElements,  setTotalElements]  = useState(0);
  const [totalPages,     setTotalPages]     = useState(1);
  // initialLoad: true = chưa có data lần nào → dùng skeleton
  // loading:     true = đang fetch (kể cả refetch) → dùng overlay mờ
  const [initialLoad,    setInitialLoad]    = useState(true);
  const [loading,        setLoading]        = useState(true);
  const [filters,        setFilters]        = useState<AppliedFilters>(DEFAULT_FILTERS);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(null);

  const load = useCallback(async (f: AppliedFilters) => {
    setLoading(true);
    try {
      const res = await service.getApplicationsByCompany(
        f.page,
        f.pageSize,
        f.status === "ALL" ? undefined : f.status,
      );
      setApps(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [toast]);

  useEffect(() => { load(filters); }, [filters, load]);

  const handleStatusChange   = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status: status as ApplicationStatus | "ALL", page: 0 }));
  }, []);

  const handleSearch         = useCallback((params: FilterSearchParams) => {
    setFilters(prev => ({ ...prev, ...params, page: 0 }));
  }, []);

  const handlePageChange     = useCallback((p: number) => {
    setFilters(prev => ({ ...prev, page: p - 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters(prev => ({ ...prev, pageSize: size, page: 0 }));
  }, []);

  const handleExportExcel = useCallback(() => {
    toast.success("Đang xuất Excel", "File sẽ được tải về sau vài giây.");
  }, [toast]);

  const handleUpdated = (updated: ApplicationDetail) => {
    setApps(prev => prev.map(a => a.id === updated.id ? { ...a, status: updated.status } : a));
  };

  const pending   = apps.filter(a => ["SUBMITTED", "PENDING"].includes(a.status)).length;
  const scheduled = apps.filter(a => a.status === "INTERVIEW_SCHEDULED").length;
  const hired     = apps.filter(a => a.status === "HIRED").length;

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users       size={18} className="text-blue-600"   />} label="Tổng đơn"      value={totalElements} color="bg-blue-50"   />
        <StatCard icon={<Clock       size={18} className="text-amber-500"  />} label="Chờ xét duyệt" value={pending}       color="bg-amber-50"  />
        <StatCard icon={<Calendar    size={18} className="text-purple-600" />} label="Có lịch PV"    value={scheduled}     color="bg-purple-50" />
        <StatCard icon={<CheckCircle size={18} className="text-green-600"  />} label="Đã tuyển"      value={hired}         color="bg-green-50"  />
      </div>

      {/* Filter bar */}
      <EmployerFilterBar
        statusTabs={STATUS_TABS}
        activeStatus={filters.status}
        onStatusChange={handleStatusChange}
        searchPlaceholder="Tìm theo tên, email ứng viên..."
        showDateRange
        onSearch={handleSearch}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        pageSize={filters.pageSize}
        onPageSizeChange={handlePageSizeChange}
        onExportExcel={handleExportExcel}
        loading={loading}
      />

      {/* Result count — giữ chỗ bằng min-height */}
      <div className="min-h-[20px] -mt-2">
        {!loading && (
          <p className="text-xs text-gray-500">
            Hiển thị <strong className="text-gray-700">{apps.length}</strong> / <strong className="text-gray-700">{totalElements}</strong> đơn ứng tuyển
          </p>
        )}
      </div>

      {/* Content area */}
      {initialLoad ? (
        <CardSkeleton count={DEFAULT_PAGE_SIZE} />
      ) : (
        /* Wrapper giữ layout ổn định, chỉ mờ khi refetch */
        <div className={`relative transition-opacity duration-150 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {/* Overlay spinner nhỏ góc trên phải khi refetch */}
          {loading && (
            <div className="absolute -top-8 right-0 z-10 flex items-center gap-1.5 text-xs text-gray-400">
              <LoadingSpinner size="sm" variant="secondary" />
              Đang tải...
            </div>
          )}

          {apps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
              py-20 flex flex-col items-center gap-3 text-gray-400">
              <Users size={36} strokeWidth={1.2} />
              <p className="text-[15px]">Không có đơn ứng tuyển nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {apps.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onSchedule={(id, name) => setScheduleTarget({ id, candidateName: name })}
                  onDetail={id => router.push(`/employer/applications/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination — giữ chỗ để không nhảy layout */}
      <div className="min-h-[40px] flex justify-center">
        {!initialLoad && totalPages > 1 && (
          <Pagination currentPage={filters.page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {selectedId && (
        <ApplicationDetailDrawer
          applicationId={selectedId}
          role="employer"
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}

      {scheduleTarget && (
        <ScheduleInterviewModal
          applicationId={scheduleTarget.id}
          candidateName={scheduleTarget.candidateName}
          onSuccess={() => load(filters)}
          onClose={() => setScheduleTarget(null)}
        />
      )}
    </div>
  );
}