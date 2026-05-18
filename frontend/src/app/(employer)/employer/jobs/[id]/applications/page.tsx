// src/app/(employer)/employer/jobs/[jobId]/applications/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Users, Search, GitCompareArrows,
  X, Trophy, Star, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { CandidateRow } from "@/presentation/components/applications/CandidateRow";
import { CandidateDetailPanel } from "@/presentation/components/applications/CandidateDetailPanel";
import { ScheduleInterviewModal } from "@/presentation/components/applications/ScheduleInterviewModal";
import { ApplicationService } from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import type {
  ApplicationWithCandidate,
  ApplicationStatus,
  ScheduleInterviewRequest,
} from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS } from "@/domain/models/Application";
import type {
  CandidateComparisonResult,
  RankedCandidate,
} from "@/domain/models/Ai";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";
import { Pagination } from "@/presentation/components/common/Pagination";

const service   = new ApplicationService(new ApplicationRepository());
const aiService = new AiService(new AiRepository());

const STATUS_FILTER_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"        },
  { value: "SUBMITTED",           label: "Đã nộp"        },
  { value: "REVIEWING",           label: "Đang xem xét"  },
  { value: "SHORTLISTED",         label: "Rút gọn"       },
  { value: "INTERVIEW_SCHEDULED", label: "Phỏng vấn"     },
  { value: "OFFERED",             label: "Offer"         },
  { value: "REJECTED",            label: "Từ chối"       },
];

// ─── Comparison Result Modal ─────────────────────────────────────────────────

function ScoreBar({ value, max = 100, color = "bg-blue-500" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

function ImpactIcon({ impact }: { impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL" }) {
  if (impact === "POSITIVE") return <TrendingUp size={12} className="text-emerald-500 shrink-0" />;
  if (impact === "NEGATIVE") return <TrendingDown size={12} className="text-red-400 shrink-0" />;
  return <Minus size={12} className="text-gray-400 shrink-0" />;
}

function RankBadge({ rank }: { rank: number }) {
  const styles = [
    "bg-yellow-400 text-yellow-900",
    "bg-gray-300 text-gray-700",
    "bg-amber-600 text-amber-100",
  ];
  const icons = ["🥇", "🥈", "🥉"];
  if (rank <= 3) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles[rank - 1]}`}>
        {icons[rank - 1]} #{rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
      #{rank}
    </span>
  );
}

function CandidateCard({
  candidate,
  isTop,
  defaultOpen,
}: {
  candidate: RankedCandidate;
  isTop: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={`rounded-xl border transition-all ${isTop ? "border-blue-200 bg-blue-50/40" : "border-gray-100 bg-white"}`}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <RankBadge rank={candidate.rank} />
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-gray-800 truncate">{candidate.candidateName}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{candidate.verdict}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-lg font-bold ${candidate.totalScore >= 80 ? "text-emerald-600" : candidate.totalScore >= 60 ? "text-blue-600" : "text-gray-500"}`}>
            {candidate.totalScore}
          </span>
          <span className="text-[10px] text-gray-400 block">/ 100</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100/80 pt-3">
          {/* Score breakdown */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Điểm thành phần</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-20 shrink-0">Kỹ năng</span>
              <ScoreBar value={candidate.skillScore} color="bg-blue-400" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-20 shrink-0">Kinh nghiệm</span>
              <ScoreBar value={candidate.experienceScore} color="bg-violet-400" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-20 shrink-0">Học vấn</span>
              <ScoreBar value={candidate.educationScore} color="bg-amber-400" />
            </div>
          </div>

          {/* Strengths */}
          {candidate.uniqueStrengths.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1.5">Điểm mạnh nổi bật</p>
              <ul className="flex flex-col gap-1">
                {candidate.uniqueStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {candidate.relativeWeaknesses.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-red-500 font-semibold mb-1.5">Điểm cần cải thiện</p>
              <ul className="flex flex-col gap-1">
                {candidate.relativeWeaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                    <AlertCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareResultModal({
  result,
  onClose,
}: {
  result: CandidateComparisonResult;
  onClose: () => void;
}) {
  const topCandidate = result.ranking[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <GitCompareArrows size={14} className="text-blue-600" />
            </div>
            <h2 className="text-[16px] font-semibold text-gray-900">Kết quả so sánh ứng viên</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Top recommendation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Gợi ý hàng đầu</span>
            </div>
            <p className="text-[16px] text-gray-800 leading-relaxed">{result.topRecommendation}</p>
          </div>

          {/* Rankings */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Xếp hạng ({result.ranking.length} ứng viên)
            </p>
            <div className="flex flex-col gap-2">
              {result.ranking.map((c) => (
                <CandidateCard
                  key={c.applicationId}
                  candidate={c}
                  isTop={c.rank === 1}
                  defaultOpen={c.rank === 1}
                />
              ))}
            </div>
          </div>

          {/* Summary & Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Tổng quan</p>
              <p className="text-xs text-gray-700 leading-relaxed">{result.comparisonSummary}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={11} className="text-amber-500" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Lời khuyên tuyển dụng</p>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{result.recruitmentAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EmployerApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const toast   = useToast();

  const [apps,           setApps]           = useState<ApplicationWithCandidate[]>([]);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalInTab,     setTotalInTab]     = useState(0);
  const [page,           setPage]           = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState<ApplicationStatus | "ALL">("ALL");
  const [search,         setSearch]         = useState("");
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [showSchedule,   setShowSchedule]   = useState(false);
  const [detailKey,      setDetailKey]      = useState(0);

  // ── Compare state ──
  const [compareMode,      setCompareMode]      = useState(false);
  const [compareIds,       setCompareIds]       = useState<Set<string>>(new Set());
  const [comparing,        setComparing]        = useState(false);
  const [compareResult,    setCompareResult]    = useState<CandidateComparisonResult | null>(null);

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

  useEffect(() => { load(0, "ALL"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(0);
    setSelectedId(null);
    load(0, activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = apps.filter(
    (a) =>
      !search ||
      (a.candidate?.fullName ?? a.candidateName).toLowerCase().includes(search.toLowerCase()) ||
      (a.candidate?.email    ?? a.candidateEmail).toLowerCase().includes(search.toLowerCase()),
  );

  const selectedApp = apps.find((a) => a.id === selectedId) ?? null;

  // ── Compare handlers ──

  const toggleCompareMode = () => {
    setCompareMode((v) => !v);
    setCompareIds(new Set());
    if (!compareMode) setSelectedId(null);
  };

  const toggleCompareId = (appId: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        if (next.size >= 10) {
          toast.error("Giới hạn", "Tối đa 10 ứng viên mỗi lần so sánh");
          return prev;
        }
        next.add(appId);
      }
      return next;
    });
  };

const handleCompare = async () => {
  if (!id) return;
  if (compareIds.size < 2) {
    toast.error("Chưa đủ", "Chọn ít nhất 2 ứng viên để so sánh");
    return;
  }
  setComparing(true);
  try {
    const result = await aiService.compareCandidates(id, Array.from(compareIds));
    setCompareResult(result);
  } catch (e) {
    toast.error("Lỗi", extractErrorMessage(e));
  } finally {
    setComparing(false);
  }
};
  // ── Status / Interview handlers ──

  const handleStatusChange = useCallback(
    async (status: ApplicationStatus, note?: string) => {
      if (!selectedId) return;
      try {
        const updated = await service.updateStatus(selectedId, status, note);
        setApps((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...updated } : a)));
        setDetailKey((k) => k + 1);
        toast.success("Đã cập nhật", `Trạng thái đã chuyển sang: ${APPLICATION_STATUS_LABELS[status]}`);
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
        setApps((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...updated } : a)));
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[16px] text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        {/* Compare toggle button */}
        <button
          onClick={toggleCompareMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            compareMode
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <GitCompareArrows size={13} />
          {compareMode ? "Thoát so sánh" : "So sánh ứng viên"}
        </button>
      </div>

      {/* Compare mode banner */}
      {compareMode && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[16px]">
          <div className="flex items-center gap-2 text-blue-700">
            <GitCompareArrows size={14} />
            <span className="font-medium">Chế độ so sánh:</span>
            <span className="text-blue-600">
              {compareIds.size === 0
                ? "Chọn 2–10 ứng viên từ danh sách"
                : `Đã chọn ${compareIds.size} ứng viên`}
            </span>
          </div>
          <button
            onClick={handleCompare}
            disabled={compareIds.size < 2 || comparing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-blue-700 transition-colors"
          >
            {comparing ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <GitCompareArrows size={12} />
                Phân tích AI
              </>
            )}
          </button>
        </div>
      )}

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
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ứng viên..."
            className="w-full pl-9 pr-4 py-2 text-[16px] bg-white border border-gray-200
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
            <span className="text-[16px] font-medium text-gray-700">
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
              <div className="py-12 text-center text-[16px] text-gray-400">
                Không có ứng viên
              </div>
            ) : (
              filtered.map((app) => (
                <div key={app.id} className="relative">
                  {/* Checkbox overlay in compare mode */}
                  {compareMode && (
                    <div
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleCompareId(app.id); }}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        compareIds.has(app.id)
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}>
                        {compareIds.has(app.id) && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={compareMode ? "pl-6" : ""}>
                    <CandidateRow
                      app={app}
                      active={!compareMode && selectedId === app.id}
                      onClick={() => {
                        if (compareMode) {
                          toggleCompareId(app.id);
                        } else {
                          setSelectedId(app.id);
                        }
                      }}
                    />
                  </div>
                </div>
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
          {compareMode ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400
              bg-white rounded-2xl border border-gray-100 shadow-sm">
              <GitCompareArrows size={36} strokeWidth={1.2} className="text-blue-300" />
              <p className="text-[16px] text-gray-500 font-medium">
                {compareIds.size === 0
                  ? "Tick vào ứng viên để thêm vào danh sách so sánh"
                  : compareIds.size === 1
                  ? "Chọn thêm ít nhất 1 ứng viên nữa"
                  : `${compareIds.size} ứng viên đã được chọn — nhấn "Phân tích AI" để tiếp tục`}
              </p>
              {compareIds.size >= 2 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-sm mt-1">
                  {Array.from(compareIds).map((cid) => {
                    const a = apps.find((x) => x.id === cid);
                    if (!a) return null;
                    return (
                      <span key={cid} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                        {a.candidate?.fullName ?? a.candidateName}
                        <button onClick={() => toggleCompareId(cid)} className="hover:text-blue-900">
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ) : selectedApp ? (
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
              <p className="text-[16px]">Chọn một ứng viên để xem chi tiết</p>
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
            setDetailKey((k) => k + 1);
            setApps((prev) =>
              prev.map((a) =>
                a.id === selectedApp.id ? { ...a, status: "INTERVIEW_SCHEDULED" } : a,
              ),
            );
          }}
          onClose={() => setShowSchedule(false)}
        />
      )}

      {/* Compare result modal */}
      {compareResult && (
        <CompareResultModal
          result={compareResult}
          onClose={() => setCompareResult(null)}
        />
      )}
    </div>
  );
}