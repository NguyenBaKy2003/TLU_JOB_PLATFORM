"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Clock, CheckCircle, XCircle,
  Calendar, ChevronDown, Search,
} from "lucide-react";
import { ApplicationStatusBadge }       from "@/presentation/components/applications/ApplicationStatusBadge";
import { AIScorePanel }                 from "@/presentation/components/applications/AIScorePanel";
import { ApplicationDetailDrawer }      from "@/presentation/components/applications/ApplicationDetailDrawer";
import { ScheduleInterviewModal }       from "@/presentation/components/applications/ScheduleInterviewModal";
import { StartConversationButton }      from "@/presentation/components/applications/StartConversationButton";
import { Pagination }                   from "@/presentation/components/common/Pagination";
import { ApplicationService }           from "@/application/services/ApplicationService";
import { ApplicationRepository }        from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                     from "@/presentation/components/ui/toast";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";
import type {
  ApplicationWithCandidate, ApplicationStatus, ApplicationDetail,
} from "@/domain/models/Application";

const service = new ApplicationService(new ApplicationRepository());

const STATUS_FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                label: "Tất cả"           },
  { value: "SUBMITTED",          label: "Mới nộp"          },
  { value: "REVIEWING",          label: "Đang xem xét"     },
  { value: "SHORTLISTED",        label: "Vào danh sách"    },
  { value: "INTERVIEW_SCHEDULED", label: "Đã lên lịch"    },
  { value: "OFFERED",            label: "Đã offer"         },
  { value: "HIRED",              label: "Đã tuyển"         },
  { value: "REJECTED",           label: "Từ chối"          },
];

const PAGE_SIZE = 20;

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

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="flex gap-1">
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ScheduleTarget { id: string; candidateName: string; }

export default function EmployerApplicationsPage({
  params,
}: {
  params?: { jobPostId?: string };
}) {
  const toast = useToast();
  const jobPostId = params?.jobPostId;

  const [apps,          setApps]          = useState<ApplicationWithCandidate[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [statusFilter,  setStatusFilter]  = useState<ApplicationStatus | "ALL">("ALL");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(null);

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

  const handleFilterChange = (v: ApplicationStatus | "ALL") => {
    setStatusFilter(v);
    setPage(0);
  };

  const handleUpdated = (updated: ApplicationDetail) => {
    setApps(prev => prev.map(a =>
      a.id === updated.id ? { ...a, status: updated.status } : a,
    ));
  };

  // Derived stats from loaded page (approximate)
  const pending    = apps.filter(a => ["SUBMITTED", "PENDING"].includes(a.status)).length;
  const reviewing  = apps.filter(a => a.status === "REVIEWING").length;
  const scheduled  = apps.filter(a => a.status === "INTERVIEW_SCHEDULED").length;
  const hired      = apps.filter(a => a.status === "HIRED").length;

  const filtered = search.trim()
    ? apps.filter(a =>
        a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        a.candidateEmail.toLowerCase().includes(search.toLowerCase()))
    : apps;

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users       size={18} className="text-blue-600"   />} label="Tổng đơn"      value={totalElements} color="bg-blue-50"   />
        <StatCard icon={<Clock       size={18} className="text-amber-500"  />} label="Chờ xét duyệt" value={pending}       color="bg-amber-50"  />
        <StatCard icon={<Calendar    size={18} className="text-purple-600" />} label="Có lịch PV"    value={scheduled}     color="bg-purple-50" />
        <StatCard icon={<CheckCircle size={18} className="text-green-600"  />} label="Đã tuyển"      value={hired}         color="bg-green-50"  />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
        flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm ứng viên..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày nộp</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Candidate */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {app.candidate?.avatarUrl
                            ? <img src={app.candidate?.avatarUrl} alt={app.candidate?.fullName}
                                className="w-8 h-8 rounded-xl object-cover border border-gray-100" />
                            : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200
                                flex items-center justify-center text-xs font-bold text-blue-600">
                                {app.candidate?.fullName}
                              </div>
                          }
                          <div>
                            <p className="font-medium text-gray-900">{app.candidate?.fullName}</p>
                            <p className="text-xs text-gray-400">{app.candidate?.phone}</p>
                          </div>
                        </div>
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
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Schedule interview */}
                          {app.status === "SHORTLISTED" && (
                            <button
                              onClick={() => setScheduleTarget({ id: app.id, candidateName: app.candidateName })}
                              title="Lên lịch phỏng vấn"
                              className="w-7 h-7 rounded-lg flex items-center justify-center
                                text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                              <Calendar size={14} />
                            </button>
                          )}
                          {/* Start conversation */}
                          <StartConversationButton
                            candidateId={app.candidateId}
                            jobPostId={app.jobPostId}
                            size="sm"
                            variant="ghost"
                            label=""
                          />
                          {/* Detail */}
                          <button
                            onClick={() => setSelectedId(app.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center
                              text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination current={page + 1} total={totalPages} onChange={p => setPage(p - 1)} />
        </div>
      )}

      {/* Detail drawer */}
      {selectedId && (
        <ApplicationDetailDrawer
          applicationId={selectedId}
          role="employer"
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Schedule modal */}
      {scheduleTarget && (
        <ScheduleInterviewModal
          applicationId={scheduleTarget.id}
          candidateName={scheduleTarget.candidateName}
          onSuccess={() => load(page, statusFilter)}
          onClose={() => setScheduleTarget(null)}
        />
      )}
    </div>
  );
}