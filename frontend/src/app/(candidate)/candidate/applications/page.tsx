"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link                               from "next/link";
import { useRouter }                      from "next/navigation";
import { Briefcase, MapPin, Clock }       from "lucide-react";
import { ApplicationStatusBadge }        from "@/presentation/components/applications/ApplicationStatusBadge";
import { ApplicationService }            from "@/application/services/ApplicationService";
import { ApplicationRepository }         from "@/infrastructure/repositories/ApplicationRepository";
import type {
  ApplicationWithJob, ApplicationStatus,
} from "@/domain/models/Application";
import { extractErrorMessage }           from "@/lib/extractErrorMessage";
import { useToast }                      from "@/presentation/components/ui/toast";
import { Pagination }                    from "@/presentation/components/common/Pagination";

const service = new ApplicationService(new ApplicationRepository());

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"        },
  { value: "PENDING",             label: "Chờ duyệt"     },
  { value: "REVIEWING",           label: "Đang xem xét"  },
  { value: "INTERVIEW_SCHEDULED", label: "Phỏng vấn"     },
  { value: "OFFERED",             label: "Có offer"      },
  { value: "ACCEPTED",            label: "Đã chấp nhận"  },
  { value: "REJECTED",            label: "Không phù hợp" },
];

// ── Salary formatter ───────
function salaryLabel(app: ApplicationWithJob) {
  if (!app.salaryMin && !app.salaryMax) return "Thoả thuận";
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${n / 1_000}k`;
  const cur = app.salaryCurrency === "VND" ? "" : ` ${app.salaryCurrency}`;
  if (app.salaryMin && app.salaryMax) return `${fmt(app.salaryMin)}-${fmt(app.salaryMax)}${cur}`;
  return app.salaryMin ? `Từ ${fmt(app.salaryMin)}${cur}` : `Đến ${fmt(app.salaryMax!)}${cur}`;
}

// ── Card skeleton ──────────
function AppSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Page ────
export default function CandidateApplicationsPage() {
  const toast  = useToast();
  const router = useRouter();

  const [apps,       setApps]       = useState<ApplicationWithJob[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<ApplicationStatus | "ALL">("ALL");
  const hasLoaded = useRef(false);

  const load = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await service.getMyApplications(pg, 12);
      setApps(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    load(0);
  }, [load]);

  const filtered = activeTab === "ALL"
    ? apps
    : apps.filter(a => a.status === activeTab);

  const tabCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value === "ALL"
      ? apps.length
      : apps.filter(a => a.status === t.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-5">

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
            {tabCounts[tab.value] > 0 && (
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                activeTab === tab.value
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-200 text-gray-500"
              }`}>{tabCounts[tab.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 -mt-2">
        <strong className="text-gray-800">{filtered.length}</strong> đơn ứng tuyển
      </p>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <AppSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
          <Briefcase size={36} strokeWidth={1.2} />
          <p className="text-[16px]">Không có đơn ứng tuyển nào</p>
          <Link href="/jobs" className="text-[16px] text-blue-600 hover:underline">
            Tìm việc làm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(app => (
            <button
              key={app.id}
              onClick={() => router.push(`/candidate/applications/${app.id}`)}
              className="text-left group"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-5
                hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-3">

                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50 border
                    border-gray-100 shrink-0 flex items-center justify-center">
                    {app.company.logoUrl
                      ? <img src={app.company.logoUrl} alt={app.company.name} className="w-full h-full object-cover" />
                      : <Briefcase size={18} className="text-gray-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 truncate">{app.company.name}</p>
                    <p className="text-[16px] font-semibold text-gray-900 group-hover:text-blue-600
                      transition-colors truncate">{app.job.title}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {app?.job?.workLocationCity && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {app?.job?.workLocationCity}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="ml-auto text-blue-600 font-semibold text-[11px]">
                  {app?.job?.salary}
                  </span>
                </div>

                {/* Interview scheduled */}
                {app.scheduledAt && (
                  <div className="px-3 py-2 bg-purple-50 rounded-xl text-xs text-purple-700 font-medium">
                    🗓 Phỏng vấn: {new Date(app.scheduledAt).toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-2">
          <Pagination
            current={page + 1}
            total={totalPages}
            onChange={p => { setPage(p - 1); load(p - 1); }}
          />
        </div>
      )}
    </div>
  );
}