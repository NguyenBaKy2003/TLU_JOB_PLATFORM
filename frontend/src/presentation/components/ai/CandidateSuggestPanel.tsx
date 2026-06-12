"use client";
import { useEffect, useState } from "react";
import { X, Sparkles, MapPin, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { LoadingSpinner } from "@/presentation/components/common";
import type { CandidateSearchResult, MatchedCandidate } from "@/domain/models/Ai";

const aiService = new AiService(new AiRepository());

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-500" :
    score >= 60 ? "text-blue-500"    :
                  "text-gray-400";
  return (
    <div className={`text-center shrink-0 ${color}`}>
      <p className="text-xl font-bold leading-none">{score}</p>
      <p className="text-sm text-gray-400 mt-0.5">/ 100</p>
    </div>
  );
}

// ── Skill chips ───────────────────────────────────────────────────────────────

function SkillChips({ matched, missing }: { matched: string[]; missing: string[] }) {
  if (!matched.length && !missing.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {matched.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
            font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={12} /> {s}
        </span>
      ))}
      {missing.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
            font-medium bg-red-50 text-red-500 border border-red-100">
          <AlertCircle size={12} /> {s}
        </span>
      ))}
    </div>
  );
}

// ── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: MatchedCandidate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center
          text-base font-bold text-violet-600 shrink-0">
          {c.candidateName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{c.candidateName}</p>
          {c.headline && (
            <p className="text-base text-gray-400 truncate mt-0.5">{c.headline}</p>
          )}
          {c.location && (
            <p className="flex items-center gap-1 text-base text-gray-400 mt-0.5">
              <MapPin size={12} /> {c.location}
            </p>
          )}
        </div>

        <div className="flex minx items-center gap-2 shrink-0">
          <ScoreRing score={c.matchScore} />
          <ChevronRight
            size={16}
            className={`text-gray-300 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col  border-t border-gray-50 pt-3">
          {c.matchReason && (
            <p className="text-base text-gray-600 leading-relaxed">{c.matchReason}</p>
          )}
          <SkillChips matched={c.matchedSkills ?? []} missing={c.missingSkills ?? []} />
          {c.experienceSummary && (
            <p className="text-base text-gray-400 italic">{c.experienceSummary}</p>
          )}
          <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full
            text-sm font-medium border ${
            c.availabilityStatus === "ACTIVELY_LOOKING"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-blue-50 text-blue-600 border-blue-100"
          }`}>
            {c.availabilityStatus === "ACTIVELY_LOOKING" ? "Đang tìm việc tích cực" : "Sẵn sàng nhận offer"}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3.5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="w-12 h-10 bg-gray-100 rounded-lg shrink-0" />
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Sparkles size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Gợi ý ứng viên</p>
              <p className="text-sm text-gray-400 truncate max-w-[240px]">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
              text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <PanelSkeleton />
          ) : error ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <p className="text-base text-red-500">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="px-5 py-2.5 text-base font-medium text-white bg-violet-600
                  rounded-xl hover:bg-violet-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : !result || result.candidates.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-base text-gray-500">Không tìm thấy ứng viên phù hợp</p>
              <p className="text-base text-gray-400 mt-1">Thử thêm skill vào bài đăng để cải thiện kết quả</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              {result.searchSummary && (
                <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
                  <p className="text-base text-violet-700 leading-relaxed">{result.searchSummary}</p>
                </div>
              )}

              {/* Scanned count */}
              <p className="text-base text-gray-400 text-center">
                Đã quét <strong className="text-gray-600">{result.totalScanned}</strong> hồ sơ
                · Tìm thấy <strong className="text-gray-600">{result.candidates.length}</strong> ứng viên phù hợp
              </p>

              {/* Candidate list */}
              {result.candidates.map(c => (
                <CandidateCard key={c.candidateProfileId} c={c} />
              ))}

              {/* Refinement tips */}
              {result.refinementTips?.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 mt-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Gợi ý cải thiện
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.refinementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-base text-gray-600">
                        <span className="text-violet-400 mt-0.5 shrink-0">•</span> {tip}
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
          <p className="text-base text-gray-400 text-center">Kết quả được cache 1 giờ · Powered by AI</p>
        </div>
      </div>
    </div>
  );
}