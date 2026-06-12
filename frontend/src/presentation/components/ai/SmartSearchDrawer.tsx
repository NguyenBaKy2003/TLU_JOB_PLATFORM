"use client";
import { useState } from "react";
import {
  X, Search, SlidersHorizontal, Sparkles,
  MapPin, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { LoadingSpinner } from "@/presentation/components/common";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { CandidateSearchResult, MatchedCandidate, SmartSearchCandidatesPayload } from "@/domain/models/Ai";
import type { JobSkill } from "@/domain/models/Job";

const aiService = new AiService(new AiRepository());

const LEVEL_OPTIONS = [
  { value: "",        label: "Tất cả cấp độ" },
  { value: "INTERN",  label: "Intern"         },
  { value: "FRESHER", label: "Fresher"        },
  { value: "JUNIOR",  label: "Junior"         },
  { value: "MIDDLE",  label: "Middle"         },
  { value: "SENIOR",  label: "Senior"         },
  { value: "LEAD",    label: "Lead"           },
  { value: "MANAGER", label: "Manager"        },
];

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

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ c }: { c: MatchedCandidate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
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

        <div className="flex items-center gap-2 shrink-0">
          <ScoreRing score={c.matchScore} />
          {open
            ? <ChevronUp size={16} className="text-gray-300" />
            : <ChevronDown size={16} className="text-gray-300" />
          }
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 flex flex-col gap-3 pt-3">
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

// ── Drawer ────────────────────────────────────────────────────────────────────

interface Props {
  defaultJobTitle?:       string;
  defaultLevel?:          string;
  defaultLocation?:       string;
  defaultRequiredSkills?: JobSkill[];
  onClose: () => void;
}

export function SmartSearchDrawer({
  defaultJobTitle       = "",
  defaultLevel          = "",
  defaultLocation       = "",
  defaultRequiredSkills = [],
  onClose,
}: Props) {
  const toast = useToast();

  const [query,        setQuery]        = useState("");
  const [jobTitle,     setJobTitle]     = useState(defaultJobTitle);
  const [level,        setLevel]        = useState(defaultLevel);
  const [location,     setLocation]     = useState(defaultLocation);
  const [maxResults,   setMaxResults]   = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput,   setSkillInput]   = useState("");
  const [skillList,    setSkillList]    = useState<string[]>(
    defaultRequiredSkills.filter(s => s.required).map(s => s.skillName)
  );

  const [result,   setResult]   = useState<CandidateSearchResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skillList.includes(v)) setSkillList(prev => [...prev, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkillList(prev => prev.filter(x => x !== s));

  const handleSearch = async () => {
    const payload: SmartSearchCandidatesPayload = {
      query:          query.trim()    || undefined,
      jobTitle:       jobTitle.trim() || undefined,
      level:          level           || undefined,
      location:       location.trim() || undefined,
      requiredSkills: skillList.length ? skillList : undefined,
      maxResults,
    };
    setLoading(true);
    setSearched(true);
    try {
      const res = await aiService.smartSearchCandidates(payload);
      setResult(res);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Không thể tìm kiếm ứng viên"));
    } finally {
      setLoading(false);
    }
  };

  const hasInput = query.trim() || jobTitle.trim() || skillList.length;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative h-full w-full max-w-lg bg-gray-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Search size={16} className="text-blue-500" />
            </div>
            <p className="text-base font-semibold text-gray-900">Tìm kiếm ứng viên AI</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
              text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">

          {/* Natural query */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Tìm kiếm bằng ngôn ngữ tự nhiên
            </p>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='VD: "Tìm Java senior 3 năm, biết K8s, làm việc tại HCM"'
              rows={3}
              className="w-full px-3 py-2.5 text-base bg-gray-50 border border-gray-200
                rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20
                focus:border-blue-400 placeholder:text-gray-300 transition-all"
            />
          </div>

          {/* Structured filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center justify-between text-sm font-semibold
                text-gray-500 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> Tiêu chí có cấu trúc
              </span>
              {showAdvanced
                ? <ChevronUp size={15} className="text-gray-400" />
                : <ChevronDown size={15} className="text-gray-400" />
              }
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4">

                {/* Job title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Vị trí</label>
                  <input
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="VD: Backend Engineer"
                    className="w-full px-3 py-2.5 text-base bg-gray-50 border border-gray-200
                      rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      focus:border-blue-400 placeholder:text-gray-300 transition-all"
                  />
                </div>

                {/* Level + Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Cấp độ</label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full px-3 py-2.5 text-base bg-gray-50 border border-gray-200
                        rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        focus:border-blue-400 transition-all appearance-none"
                    >
                      {LEVEL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Thành phố</label>
                    <input
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="VD: Hà Nội"
                      className="w-full px-3 py-2.5 text-base bg-gray-50 border border-gray-200
                        rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        focus:border-blue-400 placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>

                {/* Skill tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">
                    Skill yêu cầu
                    <span className="ml-1 font-normal text-gray-400">(để tính matched/missing chính xác)</span>
                  </label>

                  {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {skillList.map(s => (
                        <span key={s}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                            text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {s}
                          <button
                            onClick={() => removeSkill(s)}
                            className="text-blue-400 hover:text-blue-700 transition-colors ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder="VD: Spring Boot"
                      className="flex-1 px-3 py-2.5 text-base bg-gray-50 border border-gray-200
                        rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        focus:border-blue-400 placeholder:text-gray-300 transition-all"
                    />
                    <button
                      onClick={addSkill}
                      disabled={!skillInput.trim()}
                      className="px-4 py-2.5 text-base font-medium text-white bg-blue-600
                        rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Max results */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">
                    Số kết quả tối đa: <strong className="text-gray-700">{maxResults}</strong>
                  </label>
                  <input
                    type="range"
                    min={1} max={20} step={1}
                    value={maxResults}
                    onChange={e => setMaxResults(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-base text-gray-400 mt-1">
                    <span>1</span><span>20</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={loading || !hasInput}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-base
              font-semibold text-white bg-blue-600 hover:bg-blue-700
              disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[.98]"
          >
            {loading
              ? <><LoadingSpinner size="sm" variant="white" /> Đang phân tích...</>
              : <><Sparkles size={16} /> Tìm kiếm bằng AI</>
            }
          </button>

          {/* Results */}
          {searched && !loading && (
            result && result.candidates.length > 0 ? (
              <div className="flex flex-col gap-3">
                {result.searchSummary && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <p className="text-base text-blue-700 leading-relaxed">{result.searchSummary}</p>
                  </div>
                )}

                <p className="text-base text-gray-400 text-center">
                  Đã quét <strong className="text-gray-600">{result.totalScanned}</strong> hồ sơ
                  · Tìm thấy <strong className="text-gray-600">{result.candidates.length}</strong> ứng viên phù hợp
                </p>

                {result.candidates.map(c => (
                  <ResultCard key={c.candidateProfileId} c={c} />
                ))}

                {result.refinementTips?.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Gợi ý cải thiện tìm kiếm
                    </p>
                    <ul className="flex flex-col gap-2">
                      {result.refinementTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-base text-gray-600">
                          <span className="text-blue-400 mt-0.5 shrink-0">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-base text-gray-500">Không tìm thấy ứng viên phù hợp</p>
                <p className="text-base text-gray-400 mt-1">
                  Thử mở rộng tiêu chí hoặc thay đổi từ khóa
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}