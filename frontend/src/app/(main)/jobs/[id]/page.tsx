// src/app/(main)/jobs/[id]/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter }        from "next/navigation";
import Link                            from "next/link";
import { ChevronLeft }                 from "lucide-react";
import { JobService }                  from "@/application/services/JobService";
import { JobRepository }               from "@/infrastructure/repositories/JobRepository";
import { ApplicationService }          from "@/application/services/ApplicationService";
import { ApplicationRepository }       from "@/infrastructure/repositories/ApplicationRepository";
import { AiService }                   from "@/application/services/AiService";
import { AiRepository }                from "@/infrastructure/repositories/AiRepository";
import type { JobPostDetail }          from "@/domain/models/Job";
import type { CompetitionRateResult, PassProbabilityResult } from "@/domain/models/Ai";
import { extractErrorMessage }         from "@/lib/extractErrorMessage";
import { useToast }                    from "@/presentation/components/ui/toast";

import {
  JobHeroCard,
  JobDescriptionCards,
  JobInfoSidebar,
  CompanyCard,
  JobDetailSkeleton,
} from "@/presentation/components/job-detail/JobDetailComponents";
import { CandidateApplyCard }      from "@/presentation/components/job-detail/CandidateApplyCard";
import { ApplyModal }              from "@/presentation/components/job-detail/ApplyModal";
import { PassProbabilityCard, PassProbabilitySkeleton } from "@/presentation/components/job-detail/PassProbabilityCard";
import { useAuth } from "@/application/contexts/AuthContext";

const jobService = new JobService(new JobRepository());
const appService = new ApplicationService(new ApplicationRepository());
const aiService  = new AiService(new AiRepository());

// ── Competition Card ──────────────────────────────────────────────────────────

type CompetitionLevel = CompetitionRateResult["level"];

const COMPETITION_CONFIG: Record<CompetitionLevel, {
  label: string; bg: string; text: string; border: string; bar: string; dot: string;
}> = {
  LOW:       { label: "Ít cạnh tranh",  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  MEDIUM:    { label: "Trung bình",      bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  bar: "bg-yellow-400",  dot: "bg-yellow-400"  },
  HIGH:      { label: "Khá cạnh tranh", bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  bar: "bg-orange-500",  dot: "bg-orange-500"  },
  VERY_HIGH: { label: "Rất cạnh tranh", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     bar: "bg-red-500",     dot: "bg-red-500"     },
};

const TREND_CONFIG: Record<CompetitionRateResult["trend"], { label: string; className: string }> = {
  STABLE:  { label: "Ổn định",  className: "text-gray-500"    },
  RISING:  { label: "↑ Tăng",   className: "text-red-500"     },
  FALLING: { label: "↓ Giảm",   className: "text-emerald-600" },
};

function CompetitionRateCard({ data }: { data: CompetitionRateResult }) {
  const cfg   = COMPETITION_CONFIG[data.level];
  const trend = TREND_CONFIG[data.trend];

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-semibold ${cfg.text}`}>Mức độ cạnh tranh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
          <span className={`text-[10px] font-medium ${trend.className}`}>{trend.label}</span>
        </div>
      </div>

      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${Math.min(data.competitionScore, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className={`text-base font-bold ${cfg.text}`}>{data.totalApplicants}</p>
          <p className="text-[10px] text-gray-500 leading-tight">Ứng viên</p>
        </div>
        <div>
          <p className={`text-base font-bold ${cfg.text}`}>
            {data.competitionScore > 0 ? data.competitionScore.toFixed(1) : "—"}
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">Điểm TB</p>
        </div>
        <div>
          <p className={`text-base font-bold ${cfg.text}`}>{data.hiringQuota}</p>
          <p className="text-[10px] text-gray-500 leading-tight">Chỉ tiêu</p>
        </div>
      </div>

      {data.candidateAdvice && (
        <p className={`text-[11px] leading-relaxed ${cfg.text} border-t ${cfg.border} pt-2.5`}>
          {data.candidateAdvice}
        </p>
      )}
    </div>
  );
}

function CompetitionRateSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 animate-pulse flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-5 w-8 bg-gray-200 rounded" />
            <div className="h-2.5 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const toast   = useToast();

  const { user } = useAuth();
  const isCandidate = user?.role === "CANDIDATE";

  const [job,                setJob]                = useState<JobPostDetail | null>(null);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState<string | null>(null);
  const [saved,              setSaved]              = useState(false);
  const [applied,            setApplied]            = useState(false);
  const [applyDone,          setApplyDone]          = useState(false);
  const [showModal,          setShowModal]          = useState(false);
  const [competition,        setCompetition]        = useState<CompetitionRateResult | null>(null);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [passProbability,    setPassProbability]    = useState<PassProbabilityResult | null>(null);
  const [passLoading,        setPassLoading]        = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !id) return;
    hasLoaded.current = true;

    (async () => {
      // ── Job + application status ──────────────────────────────────────────
      setLoading(true);
      try {
        const [data, alreadyApplied, alreadySaved] = await Promise.all([
          jobService.getById(id),
          appService.checkApplied(id).catch(() => false),
          jobService.checkSaved(id).catch(() => false),
        ]);
        setJob(data);
        setApplied(!!alreadyApplied);
        setSaved(!!alreadySaved);
      } catch (e) {
        const msg = extractErrorMessage(e, "Không tìm thấy tin tuyển dụng");
        setError(msg);
        toast.error("Không thể tải tin tuyển dụng", msg);
      } finally {
        setLoading(false);
      }

      // ── Competition rate (tất cả user) ────────────────────────────────────
      setCompetitionLoading(true);
      try {
        const rate = await aiService.getCompetitionRate(id);
        setCompetition(rate);
      } catch {
        // silent — thông tin phụ
      } finally {
        setCompetitionLoading(false);
      }

      // ── Pass probability (chỉ CANDIDATE đã đăng nhập) ────────────────────
      if (isCandidate) {
        setPassLoading(true);
        try {
          const prob = await aiService.getPassProbability(id);
          setPassProbability(prob);
        } catch {
          // silent — thông tin phụ, không block UX
        } finally {
          setPassLoading(false);
        }
      }
    })();
  }, [id, isCandidate]);

  const handleSave = async () => {
    if (!job) return;
    try {
      await jobService.toggleSave(job.id);
      const next = !saved;
      setSaved(next);
      toast.success(
        next ? "Đã lưu việc làm" : "Đã bỏ lưu việc làm",
        next ? "Bạn có thể xem lại trong mục Việc làm đã lưu." : "",
      );
    } catch (e) {
      toast.error("Lưu tin thất bại", extractErrorMessage(e, "Lưu tin thất bại"));
    }
  };

  const handleApplySubmit = async (
    cvUrl: string,
    coverLetter: string,
    expectedSalary: string,
  ) => {
    try {
      await appService.submit({
        jobPostId:      id,
        cvUrl,
        coverLetter:    coverLetter    || undefined,
        expectedSalary: expectedSalary || undefined,
      });
      setShowModal(false);
      setApplied(true);
      setApplyDone(true);
      toast.success("Ứng tuyển thành công!", "Chúc bạn may mắn với vị trí này.");
    } catch (e) {
      toast.error("Ứng tuyển thất bại", extractErrorMessage(e, "Ứng tuyển thất bại"));
    }
  };

  if (loading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[16px] text-red-500 text-center">{error ?? "Không tìm thấy việc làm"}</p>
        <Link href="/jobs" className="text-[16px] text-blue-600 hover:underline">← Quay lại tìm kiếm</Link>
      </div>
    );
  }

  const competitionNode = competitionLoading
    ? <CompetitionRateSkeleton />
    : competition
    ? <CompetitionRateCard data={competition} />
    : null;

  // Chỉ render pass probability block cho CANDIDATE
  const passNode = isCandidate
    ? passLoading
      ? <PassProbabilitySkeleton />
      : passProbability
      ? <PassProbabilityCard data={passProbability} />
      : null
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {showModal && (
        <ApplyModal
          jobTitle={job.title}
          onClose={() => setShowModal(false)}
          onSubmit={handleApplySubmit}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[16px] text-gray-500 hover:text-gray-800
            transition-colors mb-5 sm:mb-6"
        >
          <ChevronLeft size={16} /> Quay lại kết quả tìm kiếm
        </button>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

          {/* ── Main column ─────────────────────────────────────────────────── */}
          <div className="w-full flex-1 min-w-0 flex flex-col gap-4 sm:gap-5">
            <JobHeroCard
              job={job}
              saved={saved}
              onSave={handleSave}
              onShare={() => navigator.share?.({ title: job.title, url: location.href })}
            />

            {/* Mobile sidebar cards */}
            <div className="lg:hidden flex flex-col gap-4">
              <CandidateApplyCard
                job={job}
                applied={applied}
                saved={saved}
                applyDone={applyDone}
                onApply={() => setShowModal(true)}
                onSave={handleSave}
              />
              {passNode}
              {competitionNode}
            </div>

            <JobDescriptionCards job={job} />
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex w-72 shrink-0 sticky top-4 flex-col gap-4">
            <CandidateApplyCard
              job={job}
              applied={applied}
              saved={saved}
              applyDone={applyDone}
              onApply={() => setShowModal(true)}
              onSave={handleSave}
            />
            {passNode}
            {competitionNode}
            <JobInfoSidebar job={job} />
            <CompanyCard job={job} />
          </div>

        </div>
      </div>
    </div>
  );
}