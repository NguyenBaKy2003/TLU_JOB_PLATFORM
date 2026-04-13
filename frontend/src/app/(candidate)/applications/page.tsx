// src/app/(main)/applications/page.tsx  — hoặc /profile/applications/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link                               from "next/link";
import { Briefcase, Eye, X,
         FileText, MapPin, Clock }        from "lucide-react";
import { ApplicationStatusBadge }        from "@/presentation/components/applications/ApplicationStatusBadge";
import { StatusTimeline }                from "@/presentation/components/applications/StatusTimeline";
import { ApplicationService }            from "@/application/services/ApplicationService";
import { ApplicationRepository }         from "@/infrastructure/repositories/ApplicationRepository";
import type {
  ApplicationWithJob, ApplicationStatusLog, ApplicationStatus,
} from "@/domain/models/Application";
import { extractErrorMessage }           from "@/lib/extractErrorMessage";
import { useToast }                      from "@/presentation/components/ui/toast";
import { Pagination } from "@/presentation/components/common/Pagination";

const service = new ApplicationService(new ApplicationRepository());

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",              label: "Tất cả"            },
  { value: "PENDING",          label: "Chờ duyệt"         },
  { value: "REVIEWING",        label: "Đang xem xét"      },
  { value: "INTERVIEW_SCHEDULED", label: "Phỏng vấn"      },
  { value: "OFFERED",          label: "Có offer"          },
  { value: "ACCEPTED",         label: "Đã chấp nhận"      },
  { value: "REJECTED",         label: "Không phù hợp"     },
];

// ── Salary formatter ───────────────────────────────────────────────────────────
function salaryLabel(app: ApplicationWithJob) {
  if (!app.salaryMin && !app.salaryMax) return "Thoả thuận";
  const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(0)}tr` : `${n/1_000}k`;
  const cur = app.salaryCurrency === "VND" ? "" : ` ${app.salaryCurrency}`;
  if (app.salaryMin && app.salaryMax) return `${fmt(app.salaryMin)}-${fmt(app.salaryMax)}${cur}`;
  return app.salaryMin ? `Từ ${fmt(app.salaryMin)}${cur}` : `Đến ${fmt(app.salaryMax!)}${cur}`;
}

// ── Card skeleton ──────────────────────────────────────────────────────────────
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

// ── Detail drawer ──────────────────────────────────────────────────────────────
function DetailDrawer({ app, onClose, onWithdraw }: {
  app: ApplicationWithJob; onClose: () => void; onWithdraw: () => void;
}) {
  const [logs,    setLogs]    = useState<ApplicationStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await service.getStatusLogs(app.id);
        setLogs(data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [app.id]);

  const handleWithdraw = async () => {
    try {
      await service.withdraw(app.id);
      toast.success("Đã rút đơn", "Đơn ứng tuyển đã được rút thành công.");
      onWithdraw();
    } catch (e) { toast.error("Lỗi", extractErrorMessage(e)); }
  };

  const canWithdraw = service.canWithdraw(app);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl
        flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">Chi tiết đơn ứng tuyển</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Job info */}
          <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0 flex items-center justify-center">
              {app.companyLogo
                ? <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-cover" />
                : <Briefcase size={20} className="text-gray-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{app.companyName}</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{app.jobTitle}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-gray-500">
                {app.jobCity && <span className="flex items-center gap-0.5"><MapPin size={10} /> {app.jobCity}</span>}
                {app.jobType && <span>{app.jobType}</span>}
                <span className="text-blue-600 font-semibold">{salaryLabel(app)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Trạng thái hiện tại</span>
            <ApplicationStatusBadge status={app.status} />
          </div>

          {/* Application details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Ngày nộp đơn</span>
              <span className="font-medium text-gray-800">
                {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {app.expectedSalary && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Mức lương mong muốn</span>
                <span className="font-medium text-gray-800">
                  {app.expectedSalary.toLocaleString()} VND
                </span>
              </div>
            )}
          </div>

          {/* Cover letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Thư xin việc</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 whitespace-pre-line">
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Interview info */}
          {app.scheduledAt && (
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
              <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                <Clock size={12} /> Lịch phỏng vấn
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(app.scheduledAt).toLocaleString("vi-VN")}
              </p>
              {app.interviewLocation && (
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <MapPin size={11} /> {app.interviewLocation}
                </p>
              )}
              {app.interviewNote && (
                <p className="text-xs text-gray-500 mt-1">{app.interviewNote}</p>
              )}
            </div>
          )}

          {/* CV link */}
          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
              rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors w-fit">
            <FileText size={14} /> Xem CV đã nộp
          </a>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Lịch sử trạng thái
            </p>
            <StatusTimeline logs={logs} loading={loading} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-2">
          <Link href={`/jobs/${app.jobPostId}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm
              font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Eye size={15} /> Xem tin tuyển dụng
          </Link>
          {canWithdraw && (
            <button onClick={handleWithdraw}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm
                font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
              <X size={15} /> Rút đơn
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CandidateApplicationsPage() {
  const toast = useToast();

  const [apps,       setApps]       = useState<ApplicationWithJob[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<ApplicationStatus | "ALL">("ALL");
  const [selected,   setSelected]   = useState<ApplicationWithJob | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await service.getMyApplications(pg, 12);
      setApps(res.content);
      setTotal(res.totalElements);
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
    acc[t.value] = t.value === "ALL" ? apps.length : apps.filter(a => a.status === t.value).length;
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
                  activeTab === tab.value ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
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
            <p className="text-sm">Không có đơn ứng tuyển nào</p>
            <Link href="/jobs" className="text-sm text-blue-600 hover:underline">Tìm việc làm ngay</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(app => (
              <button key={app.id} onClick={() => setSelected(app)} className="text-left group">
                <div className="bg-white border border-gray-100 rounded-2xl p-5
                  hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-3">

                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50 border
                      border-gray-100 shrink-0 flex items-center justify-center">
                      {app.companyLogo
                        ? <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-cover" />
                        : <Briefcase size={18} className="text-gray-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400 truncate">{app.companyName}</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600
                        transition-colors truncate">{app.jobTitle}</p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {app.jobCity && (
                      <span className="flex items-center gap-1"><MapPin size={11} /> {app.jobCity}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="ml-auto text-blue-600 font-semibold text-[11px]">
                      {salaryLabel(app)}
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
            <Pagination current={page + 1} total={totalPages}
              onChange={p => { setPage(p - 1); load(p - 1); }} />
          </div>
        )}      {selected && (
        <DetailDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onWithdraw={() => { setSelected(null); load(page); }}
        />
      )}

      </div>

  );
}