"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Building2, MapPin, Briefcase } from "lucide-react";
import type { AiOptimizeResult } from "@/domain/models/Cv";
import type { JobPost } from "@/domain/models/Job";
import { JobService } from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";

const jobService = new JobService(new JobRepository());

interface Props {
  optimizing: boolean;
  result:     AiOptimizeResult | null;
  error:      string | null;
  onAnalyze:  (jobPostId: string) => void;
  onClose:    () => void;
}

export function AiOptimizeModal({ optimizing, result, error, onAnalyze, onClose }: Props) {
  const [jobs,           setJobs]           = useState<JobPost[]>([]);
  const [jobsLoading,    setJobsLoading]    = useState(true);
  const [keyword,        setKeyword]        = useState("");
  const [selectedJob,    setSelectedJob]    = useState<JobPost | null>(null);

  // Load published jobs khi mount
  useEffect(() => {
    jobService.listPublished(0, 50)
      .then((res) => setJobs(res.content))
      .catch(console.error)
      .finally(() => setJobsLoading(false));
  }, []);

  // Filter theo keyword
  const filtered = keyword.trim()
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.companyName.toLowerCase().includes(keyword.toLowerCase()) ||
        (j.workLocationCity ?? "").toLowerCase().includes(keyword.toLowerCase())
      )
    : jobs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-[16px] font-semibold text-gray-900">AI Tối ưu CV</h2>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
              PREMIUM
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Input + Job picker (chỉ hiện khi chưa có result) ── */}
        {!result && (
          <>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Chọn tin tuyển dụng bạn muốn ứng tuyển. AI sẽ phân tích CV của bạn
              và đưa ra gợi ý tối ưu phù hợp với yêu cầu công việc đó.
            </p>

            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên việc làm, công ty, thành phố…"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Job list */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[13px]">Đang tải tin tuyển dụng…</span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-[13px] text-gray-400 py-8">
                  Không tìm thấy tin tuyển dụng phù hợp.
                </p>
              ) : (
                filtered.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`
                      w-full text-left rounded-xl border p-3 transition-all
                      ${selectedJob?.id === job.id
                        ? "border-purple-400 bg-purple-50 ring-1 ring-purple-300"
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      {job.companyLogoUrl ? (
                        <img
                          src={job.companyLogoUrl}
                          alt={job.companyName}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-800 truncate">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.companyName}
                          </span>
                          {job.workLocationCity && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.workLocationCity}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.jobType}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-purple-600 font-medium mt-0.5">
                          {job.salaryDisplay}
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedJob?.id === job.id && (
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <div className="text-[12px] text-purple-700 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
                Đã chọn: <span className="font-semibold">{selectedJob.title}</span> — {selectedJob.companyName}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* CTA */}
            <button
              onClick={() => selectedJob && onAnalyze(selectedJob.id)}
              disabled={optimizing || !selectedJob}
              className="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {optimizing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích…</>
                : "✨ Phân tích ngay"
              }
            </button>
          </>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="flex flex-col gap-4">

            {/* Match score */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className={`text-2xl font-bold ${
                result.matchScore >= 70 ? "text-emerald-600"
                : result.matchScore >= 40 ? "text-amber-500"
                : "text-red-500"
              }`}>
                {result.matchScore}%
              </div>
              <div>
                <div className="text-[12px] font-semibold text-purple-800">Độ phù hợp</div>
                <div className="text-[11px] text-purple-600 leading-relaxed">{result.overallSummary}</div>
              </div>
            </div>

            {result.suggestedSummary && (
              <Section title="📝 Gợi ý phần tóm tắt" color="blue">
                <p className="text-[12px] text-gray-600 leading-relaxed">{result.suggestedSummary}</p>
              </Section>
            )}

            {result.skillsToAdd.length > 0 && (
              <Section title="➕ Kỹ năng nên thêm" color="green">
                <div className="flex flex-wrap gap-1.5">
                  {result.skillsToAdd.map((s) => (
                    <span key={s} className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {result.skillsToRemove.length > 0 && (
              <Section title="➖ Kỹ năng không liên quan" color="red">
                <div className="flex flex-wrap gap-1.5">
                  {result.skillsToRemove.map((s) => (
                    <span key={s} className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {result.missingKeywords.length > 0 && (
              <Section title="🔑 Từ khóa đang thiếu" color="orange">
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((k) => (
                    <span key={k} className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>
              </Section>
            )}

            {result.experienceSuggestions.length > 0 && (
              <Section title="💼 Gợi ý kinh nghiệm" color="gray">
                <ul className="flex flex-col gap-1">
                  {result.experienceSuggestions.map((s, i) => (
                    <li key={i} className="text-[12px] text-gray-600 flex gap-2">
                      <span className="text-gray-400 shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section helper ────────────────────────────────────────────────────────────

const colorMap = {
  blue:   "bg-blue-50 border-blue-100 text-blue-800",
  green:  "bg-green-50 border-green-100 text-green-800",
  red:    "bg-red-50 border-red-100 text-red-800",
  orange: "bg-orange-50 border-orange-100 text-orange-800",
  gray:   "bg-gray-50 border-gray-100 text-gray-800",
  purple: "bg-purple-50 border-purple-100 text-purple-800",
};

function Section({ title, color = "gray", children }: {
  title:    string;
  color?:   keyof typeof colorMap;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2 ${colorMap[color]}`}>
      <div className="text-[12px] font-semibold">{title}</div>
      {children}
    </div>
  );
}