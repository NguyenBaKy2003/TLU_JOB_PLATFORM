"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Search, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { ApplicationStatusBadge }   from "@/presentation/components/applications/ApplicationStatusBadge";
import { AIScorePanel }             from "@/presentation/components/applications/AIScorePanel";
import { ApplicationDetailDrawer }  from "@/presentation/components/applications/ApplicationDetailDrawer";
import { Pagination }               from "@/presentation/components/common/Pagination";
import { ApplicationService }       from "@/application/services/ApplicationService";
import { ApplicationRepository }    from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                 from "@/presentation/components/ui/toast";
import { extractErrorMessage }      from "@/lib/extractErrorMessage";
import type {
  ApplicationWithCandidate, ApplicationStatus,
} from "@/domain/models/Application";

const service = new ApplicationService(new ApplicationRepository());

const STATUS_FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                label: "Tất cả"       },
  { value: "SUBMITTED",          label: "Mới nộp"      },
  { value: "REVIEWING",          label: "Đang xem"     },
  { value: "SHORTLISTED",        label: "Rút gọn"      },
  { value: "INTERVIEW_SCHEDULED", label: "Lịch PV"     },
  { value: "HIRED",              label: "Đã tuyển"     },
  { value: "REJECTED",           label: "Từ chối"      },
  { value: "WITHDRAWN",          label: "Đã rút"       },
];

const PAGE_SIZE = 20;

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
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

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function AdminApplicationsPage({
}: {
  searchParams?: { jobPostId?: string };
}) {
  const toast    = useToast();

  const [apps,          setApps]          = useState<ApplicationWithCandidate[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [statusFilter,  setStatusFilter]  = useState<ApplicationStatus | "ALL">("ALL");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const load = useCallback(async (p: number, s: ApplicationStatus | "ALL") => {
    setLoading(true);
    try {
      const statusParam = s === "ALL" ? undefined : s;
  
      const res = await service.getApplicationsByCompany(
        p,
        PAGE_SIZE,
        statusParam
      );
  
      setApps(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
  
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter, load]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(0), 400);
  };

  const filtered = search.trim()
    ? apps.filter(a =>
        a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        a.candidateEmail.toLowerCase().includes(search.toLowerCase()))
    : apps;

  const pending   = apps.filter(a => ["SUBMITTED", "PENDING"].includes(a.status)).length;
  const reviewing = apps.filter(a => a.status === "REVIEWING").length;
  const hired     = apps.filter(a => a.status === "HIRED").length;
  const rejected  = apps.filter(a => a.status === "REJECTED").length;

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<FileText    size={18} className="text-blue-600"  />} label="Tổng đơn"    value={totalElements.toLocaleString()} color="bg-blue-50"  />
        <StatCard icon={<Clock       size={18} className="text-amber-500" />} label="Chờ duyệt"   value={pending}       color="bg-amber-50"  />
        <StatCard icon={<CheckCircle size={18} className="text-green-600" />} label="Đã tuyển"    value={hired}         color="bg-green-50"  />
        <StatCard icon={<XCircle     size={18} className="text-red-500"   />} label="Từ chối"     value={rejected}      color="bg-red-50"    />
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
        flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Tìm ứng viên..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(0); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {totalElements.toLocaleString()} đơn
        </span>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <Users size={32} strokeWidth={1.2} />
              <p className="text-sm">Không có đơn ứng tuyển nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ứng viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Vị trí</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày nộp</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {app.candidate?.avatarUrl
                            ? <img src={app?.candidate?.avatarUrl} alt={app.candidate?.fullName}
                                className="w-8 h-8 rounded-xl object-cover border border-gray-100" />
                            : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200
                                flex items-center justify-center text-xs font-bold text-gray-600">
                              </div>
                          }
                          <div>
                            <p className="font-medium text-gray-900">{app.candidate?.fullName}</p>
                            <p className="text-xs text-gray-400">{app.candidate?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {app.job.level ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {app.aiScore != null ? (
                          <AIScorePanel
                            score={{ score: app.aiScore, label: app.aiScoreLabel ?? "", skillMatchScore: 0, experienceScore: 0, educationScore: 0 }}
                            compact
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedId(app.id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600
                            bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination current={page + 1} total={totalPages} onChange={p => setPage(p - 1)} />
        </div>
      )}

      {selectedId && (
        <ApplicationDetailDrawer
          applicationId={selectedId}
          role="admin"
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}