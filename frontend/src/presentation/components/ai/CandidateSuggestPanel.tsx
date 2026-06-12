"use client";
import { useEffect, useState } from "react";
import {
  X, Sparkles, MapPin, CheckCircle2, AlertCircle,
  Briefcase, GraduationCap, ChevronDown,
} from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import type { CandidateSearchResult, MatchedCandidate } from "@/domain/models/Ai";

const aiService = new AiService(new AiRepository());

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80 ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
    score >= 60 ? "bg-blue-50 text-blue-600 ring-blue-200"          :
                  "bg-gray-100 text-gray-500 ring-gray-200";
  return (
    <div className={`shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl ring-1 ${tone}`}>
      <span className="text-lg font-bold leading-none">{score}</span>
      <span className="text-[10px] font-medium opacity-60 mt-0.5">/100</span>
    </div>
  );
}

// ── Skill chips ───────────────────────────────────────────────────────────────

function SkillChips({ matched, missing }: { matched: string[]; missing: string[] }) {
  if (!matched.length && !missing.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {matched.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs
            font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <CheckCircle2 size={11} className="shrink-0" /> {s}
        </span>
      ))}
      {missing.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs
            font-medium bg-rose-50 text-rose-500 ring-1 ring-rose-100">
          <AlertCircle size={11} className="shrink-0" /> {s}
        </span>
      ))}
    </div>
  );
}

// ── Availability badge ─────────────────────────────────────────────────────────

function AvailabilityBadge({ status }: { status: string }) {
  const looking = status === "ACTIVELY_LOOKING";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
      ${looking ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${looking ? "bg-emerald-500" : "bg-blue-500"}`} />
      {looking ? "Đang tìm việc" : "Sẵn sàng nhận offer"}
    </span>
  );
}

// ── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: MatchedCandidate }) {
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(c.experienceSummary);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Top row — always visible */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center
          text-base font-bold text-violet-600 shrink-0">
          {c.candidateName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{c.candidateName}</p>
          {c.headline && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{c.headline}</p>
          )}
          {c.location && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin size={12} className="shrink-0" /> {c.location}
            </p>
          )}
        </div>

        <ScoreBadge score={c.matchScore} />
      </div>

      {/* Match reason — always visible */}
      {c.matchReason && (
        <div className="px-4 -mt-1 pb-3">
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
            {c.matchReason}
          </p>
        </div>
      )}

      {/* Skills — always visible */}
      <div className="px-4 pb-3">
        <SkillChips matched={c.matchedSkills ?? []} missing={c.missingSkills ?? []} />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <AvailabilityBadge status={c.availabilityStatus} />
        {hasMore && (
          <button
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600
              hover:text-violet-700 transition-colors"
          >
            {open ? "Thu gọn" : "Xem thêm"}
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Expandable — experience detail */}
      {open && c.experienceSummary && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-start gap-2">
          <Briefcase size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">{c.experienceSummary}</p>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3.5 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
          </div>
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-gray-100 rounded-md" />
            <div className="h-5 w-14 bg-gray-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface Props {
  jobPostId: string;
  jobTitle:  string;
  onClose:   () => void;
}

export function CandidateSuggestPanel({ jobPostId, jobTitle, onClose }: Props) {
  const [result,  setResult]  = useState<CandidateSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchSuggestions = () => {
    setLoading(true);
    setError(null);
    aiService
      .autoSuggestCandidates(jobPostId)
      .then(setResult)
      .catch(() => setError("Không thể tải gợi ý ứng viên. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSuggestions(); }, [jobPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative h-full w-full max-w-md bg-gray-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Gợi ý ứng viên</p>
              <p className="text-xs text-gray-400 truncate">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center
              text-gray-400 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <PanelSkeleton />
          ) : error ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <p className="text-sm text-rose-500">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="px-5 py-2.5 text-sm font-medium text-white bg-violet-600
                  rounded-xl hover:bg-violet-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : !result || result.candidates.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Không tìm thấy ứng viên phù hợp</p>
              <p className="text-xs text-gray-400 mt-1">Thử thêm skill vào bài đăng để cải thiện kết quả</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              {result.searchSummary && (
                <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 flex items-start gap-2.5">
                  <Sparkles size={16} className="text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-violet-700 leading-relaxed">{result.searchSummary}</p>
                </div>
              )}

              {/* Scanned count */}
              <p className="text-xs text-gray-400 text-center">
                Đã quét <strong className="text-gray-600 font-semibold">{result.totalScanned}</strong> hồ sơ
                · Tìm thấy <strong className="text-gray-600 font-semibold">{result.candidates.length}</strong> ứng viên phù hợp
              </p>

              {/* Candidate list */}
              {result.candidates.map(c => (
                <CandidateCard key={c.candidateProfileId} c={c} />
              ))}

              {/* Refinement tips */}
              {result.refinementTips?.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mt-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                    <GraduationCap size={14} /> Gợi ý cải thiện
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {result.refinementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="text-amber-500 mt-0.5 shrink-0">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 bg-white border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Kết quả được cache 1 giờ · Powered by AI</p>
        </div>
      </div>
    </div>
  );
}