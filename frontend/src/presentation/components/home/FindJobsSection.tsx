"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "./useInView";
import { JobCard }    from "@/presentation/components/jobs/JobCard";
import type { CompetitionLevel } from "@/domain/models/Job";
import type { JobPost } from "@/domain/models/Job";
import { JobService }    from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";

const jobService = new JobService(new JobRepository());

// ── Skeleton ──────────

function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-5 bg-[#e8f0fb] rounded-2xl border border-transparent h-full">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-blue-100 rounded w-3/4" />
          <div className="h-3 bg-blue-100 rounded w-2/5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-blue-100 rounded w-1/2" />
        <div className="h-3 bg-blue-100 rounded w-2/5" />
        <div className="h-3 bg-blue-100 rounded w-1/3" />
      </div>
      <div className="flex gap-2 mt-auto pt-2">
        <div className="h-6 w-16 bg-blue-100 rounded-full" />
        <div className="h-6 w-28 bg-blue-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Component ─────────

export function FindJobsSection() {
  const { ref, inView } = useInView();

  const [jobs,    setJobs]    = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    jobService.search({ page: 0, size: 6 })
      .then(res => setJobs(res.content))
      .catch(() => setError("Không thể tải danh sách việc làm"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-100/60 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-16 right-32 w-40 h-40 rounded-full bg-blue-100/40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-gray-900" />
            Việc Làm <span className="text-red-500 mx-1">Nổi Bật</span> Mới Nhất
          </h2>
          <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg mx-auto">
            Tìm kiếm công việc mơ ước giờ đây dễ dàng hơn bao giờ hết.<br />
            Chỉ cần lướt xem và ứng tuyển ngay vào vị trí bạn yêu thích
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-500 mb-8">{error}</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="h-full"
                >
                  <JobCard
                    job={job}
                    competitionLevel={job.competition?.level as CompetitionLevel}
                  />
                </motion.div>
              ))
          }
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/jobs"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-[16px] shadow-lg shadow-orange-200"
          >
            Khám phá thêm
          </Link>
        </motion.div>
      </div>
    </section>
  );
}