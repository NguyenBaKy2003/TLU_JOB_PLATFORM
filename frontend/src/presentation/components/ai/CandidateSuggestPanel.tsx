"use client";
import { useEffect, useState } from "react";
import { X, Sparkles, GraduationCap, RefreshCw, Users } from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { MatchedCandidateCard } from "@/presentation/components/ai/MatchedCandidateCard";
import type { CandidateSearchResult } from "@/domain/models/Ai";

const aiService = new AiService(new AiRepository());

// ── Skeleton ─────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 flex flex-col gap-2 pt-0.5">
              <div className="h-3.5 bg-gray-100 rounded-full w-2/5" />
              <div className="h-3 bg-gray-100 rounded-full w-1/4" />
              <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-0.5" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
          </div>
          <div className="h-12 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="flex gap-1.5">
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
        <Users size={24} className="text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Không tìm thấy ứng viên phù hợp</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
          Thử thêm kỹ năng vào bài đăng để cải thiện kết quả tìm kiếm
        </p>
      </div>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <Sparkles size={22} className="text-red-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-500">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white
          text-sm font-semibold hover:bg-violet-700 transition-colors"
      >
        <RefreshCw size={14} /> Thử lại
      </button>
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSuggestions(); }, [jobPostId]);

  const hasResults = !loading && !error && result && result.candidates.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] bg-gray-50 shadow-2xl rounded-2xl
        flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-gray-900 leading-snug">Gợi ý ứng viên</p>
              <p className="text-xs text-gray-400 truncate">{jobTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh button — only when results loaded */}
            {hasResults && (
              <button
                onClick={fetchSuggestions}
                title="Tải lại"
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
                  text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
                text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="p-4 flex flex-col gap-3">

            {loading ? (
              <PanelSkeleton />

            ) : error ? (
              <ErrorState message={error} onRetry={fetchSuggestions} />

            ) : !result || result.candidates.length === 0 ? (
              <EmptyState />

            ) : (
              <>
                {/* AI summary banner */}
                {result.searchSummary && (
                  <div className="rounded-xl bg-violet-50 border border-violet-100
                    px-4 py-3 flex items-start gap-2.5">
                    <Sparkles size={14} className="text-violet-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-violet-700 leading-relaxed">
                      {result.searchSummary}
                    </p>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                  <Users size={12} className="shrink-0" />
                  <span>
                    Đã quét{" "}
                    <strong className="text-gray-600 font-semibold">{result.totalScanned}</strong>
                    {" "}hồ sơ · Tìm thấy{" "}
                    <strong className="text-gray-600 font-semibold">{result.candidates.length}</strong>
                    {" "}ứng viên
                  </span>
                </div>

                {/* Candidate cards */}
                {result.candidates.map(c => (
                  <MatchedCandidateCard
                    key={c.candidateProfileId}
                    c={c}
                    jobPostId={jobPostId}
                    jobTitle={jobTitle}
                  />
                ))}

                {/* Refinement tips */}
                {result.refinementTips?.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold
                      text-amber-700 mb-2">
                      <GraduationCap size={13} /> Gợi ý cải thiện
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {result.refinementTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
                          <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom padding for scroll breathing room */}
                <div className="h-2" />
              </>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 bg-white border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center">
            Kết quả được cache 1 giờ · Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}