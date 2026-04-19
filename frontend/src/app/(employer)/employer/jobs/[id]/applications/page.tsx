// src/app/(employer)/employer/jobs/[jobId]/applications/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Users, Search } from "lucide-react";
import { CandidateRow } from "@/presentation/components/applications/CandidateRow";
import { CandidateDetailPanel } from "@/presentation/components/applications/CandidateDetailPanel";
import { ScheduleInterviewModal } from "@/presentation/components/applications/ScheduleInterviewModal";
import { ApplicationService } from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import type {
  ApplicationWithCandidate,
  ApplicationStatus,
  ScheduleInterviewRequest,
} from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS } from "@/domain/models/Application";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";
import { Pagination } from "@/presentation/components/common/Pagination";

const service = new ApplicationService(new ApplicationRepository());

// Tabs khớp với backend ApplicationStatus enum
const STATUS_FILTER_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"        },
  { value: "SUBMITTED",           label: "Đã nộp"        },
  { value: "REVIEWING",           label: "Đang xem xét"  },
  { value: "SHORTLISTED",         label: "Rút gọn"       },
  { value: "INTERVIEW_SCHEDULED", label: "Phỏng vấn"     },
  { value: "OFFERED",             label: "Offer"         },
  { value: "REJECTED",            label: "Từ chối"       },
];

export default function EmployerApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast  = useToast();

  const [apps,         setApps]         = useState<ApplicationWithCandidate[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalInTab,   setTotalInTab]   = useState(0);
  const [page,         setPage]         = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<ApplicationStatus | "ALL">("ALL");
  const [search,       setSearch]       = useState("");
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Key để force-remount CandidateDetailPanel sau khi status thay đổi
  const [detailKey, setDetailKey] = useState(0);

  const load = useCallback(
    async (pg: number, tab: ApplicationStatus | "ALL") => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await service.getByJobPost(id, pg, 20, tab);
        setApps(res.content);
        setTotalPages(res.totalPages);
        setTotalInTab(res.totalElements);
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [id, toast],
  );

  // Load lần đầu
  useEffect(() => {
    load(0, "ALL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload khi đổi tab
  useEffect(() => {
    setPage(0);
    setSelectedId(null);
    load(0, activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter client-side chỉ cho search (tab đã filter từ server)
  const filtered = apps.filter(
    (a) =>
      !search ||
      (a.candidate?.fullName ?? a.candidateName).toLowerCase().includes(search.toLowerCase()) ||
      (a.candidate?.email    ?? a.candidateEmail).toLowerCase().includes(search.toLowerCase()),
  );

  const selectedApp = apps.find((a) => a.id === selectedId) ?? null;

  const handleStatusChange = useCallback(
    async (status: ApplicationStatus, note?: string) => {
      if (!selectedId) return;
      try {
        const updated = await service.updateStatus(selectedId, status, note);

        // Cập nhật list local
        setApps((prev) =>
          prev.map((a) => (a.id === selectedId ? { ...a, ...updated } : a)),
        );

        // Force-reload CandidateDetailPanel để fetch lại detail mới (statusHistory, v.v.)
        setDetailKey((k) => k + 1);

        toast.success(
          "Đã cập nhật",
          `Trạng thái đã chuyển sang: ${APPLICATION_STATUS_LABELS[status]}`,
        );
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      }
    },
    [selectedId, toast],
  );

  const handleScheduleInterview = useCallback(
    async (req: ScheduleInterviewRequest) => {
      if (!selectedId) return;
      try {
        const updated = await service.scheduleInterview(selectedId, req);

        setApps((prev) =>
          prev.map((a) => (a.id === selectedId ? { ...a, ...updated } : a)),
        );

        // Reload detail để cập nhật lịch phỏng vấn mới
        setDetailKey((k) => k + 1);
        setShowSchedule(false);

        toast.success("Đã lên lịch", "Lịch phỏng vấn đã được gửi đến ứng viên.");
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
        throw e;
      }
    },
    [selectedId, toast],
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto shrink-0">
          {STATUS_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.value && totalInTab > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600">
                  {totalInTab}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ứng viên..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-400 placeholder:text-gray-300 transition-all"
          />
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: candidate list */}
        <div className="w-72 lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100
          shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {filtered.length} ứng viên
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                Không có ứng viên
              </div>
            ) : (
              filtered.map((app) => (
                <CandidateRow
                  key={app.id}
                  app={app}
                  active={selectedId === app.id}
                  onClick={() => setSelectedId(app.id)}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-50">
              <Pagination
                current={page + 1}
                total={totalPages}
                onChange={(p) => {
                  setPage(p - 1);
                  load(p - 1, activeTab);
                }}
              />
            </div>
          )}
        </div>

        {/* Right: detail */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {selectedApp ? (
            <CandidateDetailPanel
              key={`${selectedApp.id}-${detailKey}`}
              app={selectedApp}
              onStatusChange={handleStatusChange}
              onScheduleInterview={() => setShowSchedule(true)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400
              bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Users size={36} strokeWidth={1.2} />
              <p className="text-sm">Chọn một ứng viên để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule interview modal */}
      {showSchedule && selectedApp && (
        <ScheduleInterviewModal
          applicationId={selectedApp.id}
          candidateName={selectedApp.candidate?.fullName ?? selectedApp.candidateName}
          onSuccess={() => {
            setDetailKey(k => k + 1);
            setApps(prev =>
              prev.map(a => a.id === selectedApp.id ? { ...a, status: "INTERVIEW_SCHEDULED" } : a)
            );
          }}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}