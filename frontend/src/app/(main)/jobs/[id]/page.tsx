"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter }        from "next/navigation";
import Link                            from "next/link";
import { ChevronLeft }                 from "lucide-react";
import { JobService }                  from "@/application/services/JobService";
import { JobRepository }               from "@/infrastructure/repositories/JobRepository";
import { ApplicationService }          from "@/application/services/ApplicationService";
import { ApplicationRepository }       from "@/infrastructure/repositories/ApplicationRepository";
import type { JobPostDetail }          from "@/domain/models/Job";
import { extractErrorMessage }         from "@/lib/extractErrorMessage";

import {
  JobHeroCard,
  JobDescriptionCards,
  JobInfoSidebar,
  CompanyCard,
  JobDetailSkeleton,
} from "@/presentation/components/job-detail/JobDetailComponents";
import { CandidateApplyCard } from "@/presentation/components/job-detail/CandidateApplyCard";
import { ApplyModal }         from "@/presentation/components/job-detail/ApplyModal";

// ── Singletons ────────────────────────────────────────────────────────────────

const jobService = new JobService(new JobRepository());
const appService = new ApplicationService(new ApplicationRepository());

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [job,       setJob]       = useState<JobPostDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !id) return;
    hasLoaded.current = true;

    (async () => {
      setLoading(true);
      try {
        const [data, alreadyApplied] = await Promise.all([
          jobService.getById(id),
          appService.checkApplied(id).catch(() => false),
        ]);
        setJob(data);
        setApplied(!!alreadyApplied);
      } catch (e) {
        setError(extractErrorMessage(e, "Không tìm thấy tin tuyển dụng"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!job) return;
    try { await jobService.toggleSave(job.id); setSaved(v => !v); } catch {}
  };

  const handleApplySubmit = async (
    cvUrl: string,
    coverLetter: string,
    expectedSalary: string,
  ) => {
    await appService.submit({
      jobPostId:      id,
      cvUrl,
      coverLetter:    coverLetter    || undefined,
      expectedSalary: expectedSalary || undefined,
    });
    setShowModal(false);
    setApplied(true);
    setApplyDone(true);
  };

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error ?? "Không tìm thấy việc làm"}</p>
        <Link href="/jobs" className="text-sm text-blue-600 hover:underline">
          ← Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {showModal && (
        <ApplyModal
          jobTitle={job.title}
          onClose={() => setShowModal(false)}
          onSubmit={handleApplySubmit}
        />
      )}

      <div className="mx-auto px-4 py-8">

        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
            transition-colors mb-6">
          <ChevronLeft size={16} /> Quay lại kết quả tìm kiếm
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: content ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            <JobHeroCard
              job={job}
              saved={saved}
              onSave={handleSave}
              onShare={() => navigator.share?.({ title: job.title, url: location.href })}
            />
            <JobDescriptionCards job={job} />
          </div>

          {/* ── Right: sidebar ────────────────────────────────── */}
          <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">
            <CandidateApplyCard
              job={job}
              applied={applied}
              saved={saved}
              applyDone={applyDone}
              onApply={() => setShowModal(true)}
              onSave={handleSave}
            />
            <JobInfoSidebar job={job} />
            <CompanyCard job={job} />
          </div>

        </div>
      </div>
    </div>
  );
}