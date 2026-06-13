"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Building2, MapPin, Briefcase, X, Sparkles } from "lucide-react";
import type { AiOptimizeResult } from "@/domain/models/Cv";
import type { JobPost }          from "@/domain/models/Job";
import { JobService }    from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";

const jobService = new JobService(new JobRepository());

interface Props {
  optimizing: boolean;
  result:     AiOptimizeResult | null;
  error:      string | null;
  onAnalyze:  (jobPostId: string) => void;
  onClose:    () => void;
}

// ── Result section helper ──────────────────────

const COLOR_MAP = {
  blue:   "bg-blue-50   border-blue-100   text-blue-800",
  green:  "bg-green-50  border-green-100  text-green-800",
  red:    "bg-red-50    border-red-100    text-red-800",
  orange: "bg-orange-50 border-orange-100 text-orange-800",
  slate:  "bg-slate-50  border-slate-100  text-slate-800",
  violet: "bg-violet-50 border-violet-100 text-violet-800",
} as const;

function ResultSection({
  title, color = "slate", children,
}: {
  title:    string;
  color?:   keyof typeof COLOR_MAP;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-3.5 flex flex-col gap-2.5 ${COLOR_MAP[color]}`}>
      <p className="text-xs font-bold">{title}</p>
      {children}
    </div>
  );
}

// ── Main modal ─────

export function AiOptimizeModal({ optimizing, result, error, onAnalyze, onClose }: Props) {
  const [jobs,        setJobs]        = useState<JobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [keyword,     setKeyword]     = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  useEffect(() => {
    jobService.listPublished(0, 50)
      .then((res) => setJobs(res.content))
      .catch(console.error)
      .finally(() => setJobsLoading(false));
  }, []);

  const filtered = keyword.trim()
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.companyName.toLowerCase().includes(keyword.toLowerCase()) ||
        (j.workLocationCity ?? "").toLowerCase().includes(keyword.toLowerCase())
      )
    : jobs;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="
        bg-white w-full sm:max-w-lg
        rounded-t-3xl sm:rounded-2xl
        shadow-2xl flex flex-col
        max-h-[92dvh] sm:max-h-[88vh]
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Tối ưu CV</h2>
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Premium</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {!result ? (
            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Chọn tin tuyển dụng bạn muốn ứng tuyển. AI sẽ phân tích CV và đưa ra gợi ý tối ưu phù hợp yêu cầu công việc.
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm việc làm, công ty, thành phố…"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
                />
              </div>

              {/* Job list */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-0.5">
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Đang tải…</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-10">Không tìm thấy kết quả.</p>
                ) : (
                  filtered.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`
                        w-full text-left rounded-xl border p-3 transition-all
                        ${selectedJob?.id === job.id
                          ? "border-violet-400 bg-violet-50 ring-1 ring-violet-300"
                          : "border-slate-200 hover:border-violet-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        {job.companyLogoUrl ? (
                          <img
                            src={job.companyLogoUrl}
                            alt={job.companyName}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-slate-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />{job.companyName}
                            </span>
                            {job.workLocationCity && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{job.workLocationCity}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-violet-600 font-semibold mt-0.5">{job.salaryDisplay}</p>
                        </div>

                        {selectedJob?.id === job.id && (
                          <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Selected job preview */}
              {selectedJob && (
                <div className="text-xs text-violet-700 bg-violet-50 rounded-xl px-3.5 py-2.5 border border-violet-100 font-medium">
                  Đã chọn: <span className="font-bold">{selectedJob.title}</span> — {selectedJob.companyName}
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3.5 py-2.5 border border-red-100">{error}</p>
              )}
            </div>
          ) : (
            /* Result view */
            <div className="p-5 flex flex-col gap-3.5">
              {/* Match score */}
              <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
                result.matchScore >= 70
                  ? "bg-emerald-50 border-emerald-200"
                  : result.matchScore >= 40
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <div className={`text-3xl font-black leading-none ${
                  result.matchScore >= 70 ? "text-emerald-600"
                  : result.matchScore >= 40 ? "text-amber-500"
                  : "text-red-500"
                }`}>
                  {result.matchScore}%
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-0.5">Độ phù hợp với vị trí</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{result.overallSummary}</p>
                </div>
              </div>

              {result.suggestedSummary && (
                <ResultSection title="📝 Gợi ý phần tóm tắt" color="blue">
                  <p className="text-xs text-slate-600 leading-relaxed">{result.suggestedSummary}</p>
                </ResultSection>
              )}

              {result.skillsToAdd.length > 0 && (
                <ResultSection title="➕ Kỹ năng nên thêm" color="green">
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsToAdd.map((s) => (
                      <span key={s} className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.skillsToRemove.length > 0 && (
                <ResultSection title="➖ Kỹ năng không liên quan" color="red">
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsToRemove.map((s) => (
                      <span key={s} className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.missingKeywords.length > 0 && (
                <ResultSection title="🔑 Từ khóa đang thiếu" color="orange">
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{k}</span>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.experienceSuggestions.length > 0 && (
                <ResultSection title="💼 Gợi ý kinh nghiệm" color="slate">
                  <ul className="flex flex-col gap-1.5">
                    {result.experienceSuggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-slate-300 flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </ResultSection>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50">
          {!result ? (
            <button
              onClick={() => selectedJob && onAnalyze(selectedJob.id)}
              disabled={optimizing || !selectedJob}
              className="
                w-full py-3 rounded-xl text-sm font-bold
                bg-violet-600 text-white hover:bg-violet-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all active:scale-[0.98] flex items-center justify-center gap-2
                shadow-sm shadow-violet-200
              "
            >
              {optimizing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích…</>
                : <><Sparkles className="w-4 h-4" /> Phân tích ngay</>
              }
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}