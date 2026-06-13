"use client";
import { useEffect, useState } from "react";
import { X, Sparkles, GraduationCap } from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { MatchedCandidateCard } from "@/presentation/components/ai/MatchedCandidateCard";
import type { CandidateSearchResult } from "@/domain/models/Ai";

const aiService = new AiService(new AiRepository());

// ── Skeleton ──────────

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3.5 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
          </div>
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="flex gap-1.5">
            <div className="h-6 w-18 bg-gray-100 rounded-full" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Panel ─────────────

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
              <p className="text-base font-semibold text-gray-900">Gợi ý ứng viên</p>
              <p className="text-sm text-gray-400 truncate">{jobTitle}</p>
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

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">

          {loading ? (
            <PanelSkeleton />

          ) : error ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <p className="text-base text-rose-500">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="px-5 py-2.5 text-base font-semibold text-white bg-violet-600
                  rounded-xl hover:bg-violet-700 transition-colors"
              >
                Thử lại
              </button>
            </div>

          ) : !result || result.candidates.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-base text-gray-500">Không tìm thấy ứng viên phù hợp</p>
              <p className="text-sm text-gray-400 mt-1">
                Thử thêm skill vào bài đăng để cải thiện kết quả
              </p>
            </div>

          ) : (
            <>
              {/* AI summary */}
              {result.searchSummary && (
                <div className="rounded-xl bg-violet-50 border border-violet-100
                  px-4 py-3 flex items-start gap-2.5">
                  <Sparkles size={16} className="text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-violet-700 leading-relaxed">
                    {result.searchSummary}
                  </p>
                </div>
              )}

              {/* Scanned count */}
              <p className="text-sm text-gray-400 text-center">
                Đã quét{" "}
                <strong className="text-gray-600 font-semibold">{result.totalScanned}</strong>{" "}
                hồ sơ · Tìm thấy{" "}
                <strong className="text-gray-600 font-semibold">{result.candidates.length}</strong>{" "}
                ứng viên phù hợp
              </p>

              {/* ── Candidate cards — mỗi card có nút "Mời ứng tuyển" ── */}
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
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mt-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold
                    text-amber-700 uppercase tracking-wider mb-2">
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
          <p className="text-sm text-gray-400 text-center">
            Kết quả được cache 1 giờ · Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}