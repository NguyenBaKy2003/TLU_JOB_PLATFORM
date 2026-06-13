"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, MapPin, SlidersHorizontal, X,
  Briefcase, Sparkles,
} from "lucide-react";
import { JobCard }            from "@/presentation/components/jobs/JobCard";
import type { CompetitionLevel } from "@/domain/models/Job";
import { JobFilterSidebar, EMPTY_FILTERS } from "@/presentation/components/jobs/JobFilterSidebar";
import { JobService }         from "@/application/services/JobService";
import { JobRepository }      from "@/infrastructure/repositories/JobRepository";
import type { JobPost, JobSearchParams } from "@/domain/models/Job";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { JobFilters }     from "@/presentation/components/jobs/JobFilterSidebar";
import { Pagination }          from "@/presentation/components/common/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { JobsAISearchBar }    from "@/presentation/components/jobs/JobsAISearchBar";

const jobService = new JobService(new JobRepository());

// ── Skeleton ──────────

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`animate-pulse flex flex-col gap-3 p-5 bg-white rounded-2xl
      ${featured
        ? "border-[1.5px] border-blue-200"
        : "border border-gray-100"
      }`}>
      {featured && <div className="h-3 w-16 bg-blue-100 rounded-full" />}
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl shrink-0
          ${featured ? "bg-blue-100" : "bg-gray-100"}`} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-gray-100 rounded w-2/5" />
          <div className={`h-5 rounded w-3/4 ${featured ? "bg-blue-100" : "bg-gray-100"}`} />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-3 w-28 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Quick filter chip ─

const QUICK_FILTERS = [
  { label: "Toàn thời gian", value: "FULL_TIME", icon: "💼" },
  { label: "Thực tập",       value: "INTERN",    icon: "🎓" },
  { label: "Remote",         value: "REMOTE",    icon: "🏠" },
  { label: "Part-time",      value: "PART_TIME", icon: "⏰" },
  { label: "Hợp đồng",      value: "CONTRACT",  icon: "📄" },
];

function QuickChip({
  label, icon, active, onClick,
}: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-200 whitespace-nowrap
        ${active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
        }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// ── Section headers ───

function FeaturedSectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full
        bg-blue-600 text-white text-xs font-semibold shadow-sm">
        <Sparkles size={11} />
        Tin nổi bật
      </div>
      <span className="text-xs text-gray-400">{count} việc làm</span>
      <div className="flex-1 h-px bg-blue-100 ml-1" />
    </div>
  );
}

function RegularSectionHeader({ count, total }: { count: number; total: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-3 mt-6">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full
        bg-gray-100 text-gray-600 text-xs font-medium">
        <Briefcase size={11} />
        Tất cả việc làm
      </div>
      <span className="text-xs text-gray-400">{total.toLocaleString()} việc làm</span>
      <div className="flex-1 h-px bg-gray-100 ml-1" />
    </div>
  );
}

// ── Grid wrapper — dùng chung để tránh lặp className ─────────────────────────

function JobGrid({ children }: { children: React.ReactNode }) {
  return (
    // items-stretch: các cell trong cùng hàng stretch đều nhau
    // JobCard dùng h-full để lấp đầy cell → card ngang hàng luôn cùng chiều cao
    <div className="grid grid-cols-1 md:grid-cols-2  gap-4 items-stretch">
      {children}
    </div>
  );
}

// ── Inner ─────────────

function JobsPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const initialKeyword  = searchParams.get("keyword")  ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  const [jobs,       setJobs]       = useState<JobPost[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [city,    setCity]    = useState(initialLocation);

  const [appliedFilters, setAppliedFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeQuick,      setActiveQuick]      = useState<string | null>(null);

  const isFirst = useRef(true);

  const featuredJobs = jobs.filter(j => j.featured);
  const regularJobs  = jobs.filter(j => !j.featured);

  // ── Fetch ──────────

  const fetchJobs = useCallback(async (
    kw: string, ct: string, f: JobFilters, pg: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const postedWithinDays = f.postedWithin
        ? parseInt(f.postedWithin.replace("d", ""), 10)
        : undefined;

      const params: JobSearchParams = {
        keyword:         kw || undefined,
        city:            ct || undefined,
        workLocType:     f.workLocType || undefined,
        currency:        f.currency   || undefined,
        minSalary:       f.minSalary  ? Number(f.minSalary) : undefined,
        maxSalary:       f.maxSalary  ? Number(f.maxSalary) : undefined,
        postedWithinDays,
        jobTypes:        f.jobTypes.length ? f.jobTypes : undefined,
        levels:          f.levels.length   ? f.levels   : undefined,
        page: pg,
        size: 12,
      };
      const res = await jobService.search(params);
      setJobs(res.content);
      setTotal(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải danh sách việc làm"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(initialKeyword, initialLocation, EMPTY_FILTERS, 0);
  }, []);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    fetchJobs(keyword, city, appliedFilters, page);
  }, [page]);

  useEffect(() => {
    const kw  = searchParams.get("keyword")  ?? "";
    const loc = searchParams.get("location") ?? "";
    setKeyword(kw);
    setCity(loc);
    setPage(0);
    setAppliedFilters(EMPTY_FILTERS);
    setActiveQuick(null);
    fetchJobs(kw, loc, EMPTY_FILTERS, 0);
  }, [searchParams]);

  // ── Handlers ──────

  const handleSearch = useCallback((newKeyword: string, newCity: string) => {
    setKeyword(newKeyword);
    setCity(newCity);
    setPage(0);
    const p = new URLSearchParams();
    if (newKeyword) p.set("keyword",  newKeyword);
    if (newCity)    p.set("location", newCity);
    router.replace(`/jobs?${p.toString()}`, { scroll: false });
    fetchJobs(newKeyword, newCity, appliedFilters, 0);
  }, [appliedFilters, fetchJobs, router]);

  const handleApplyFilters = (newFilters: JobFilters) => {
    setAppliedFilters(newFilters);
    setPage(0);
    setMobileFilterOpen(false);
    fetchJobs(keyword, city, newFilters, 0);
  };

  const handleSave = useCallback(async (id: string) => {
    try { await jobService.toggleSave(id); } catch {}
  }, []);

  const handlePageChange = (oneBased: number) => {
    setPage(oneBased - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setAppliedFilters(EMPTY_FILTERS);
    setActiveQuick(null);
    setKeyword("");
    setCity("");
    setPage(0);
    router.replace("/jobs", { scroll: false });
    fetchJobs("", "", EMPTY_FILTERS, 0);
  };

  const handleQuickFilter = (value: string) => {
    const isActive = activeQuick === value;
    const next = isActive ? null : value;
    setActiveQuick(next);
    setPage(0);

    const locTypes = ["REMOTE", "ONSITE", "HYBRID"];
    let newFilters: JobFilters;
    if (locTypes.includes(value)) {
      newFilters = { ...appliedFilters, workLocType: isActive ? "" : value };
    } else {
      newFilters = { ...appliedFilters, jobTypes: isActive ? [] : [value as any] };
    }
    setAppliedFilters(newFilters);
    fetchJobs(keyword, city, newFilters, 0);
  };

  const activeFilterCount =
    appliedFilters.jobTypes.length +
    appliedFilters.levels.length +
    (appliedFilters.currency ? 1 : 0) +
    (appliedFilters.workLocType ? 1 : 0) +
    (appliedFilters.postedWithin ? 1 : 0);

  // ── Render ─────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ───── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* overflow-hidden tách riêng để không clip dropdown */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              bg-white/10 border border-white/20 text-white/90 text-xs font-medium">
              <Sparkles size={11} />
              {total > 0 ? `${total.toLocaleString()} việc làm đang tuyển` : "Tìm việc thông minh"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white text-center mb-2 leading-tight tracking-tight">
            Khám phá cơ hội việc làm
          </h1>
          <p className="text-blue-100 text-sm text-center mb-8">
            Hàng nghìn công việc từ các công ty hàng đầu đang chờ bạn
          </p>

          <JobsAISearchBar
            keyword={keyword}
            city={city}
            onSearch={handleSearch}
          />

          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            <span className="text-blue-200 text-xs">Phổ biến:</span>
            {QUICK_FILTERS.map(qf => (
              <QuickChip
                key={qf.value}
                label={qf.label}
                icon={qf.icon}
                active={activeQuick === qf.value}
                onClick={() => handleQuickFilter(qf.value)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Active keyword/city badges ──────────── */}
      <AnimatePresence>
        {(keyword || city) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white border-b border-gray-100"
          >
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5
              flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Kết quả cho:</span>
              {keyword && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                  bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                  {keyword}
                  <button onClick={() => {
                    setKeyword(""); setPage(0);
                    router.replace("/jobs", { scroll: false });
                    fetchJobs("", city, appliedFilters, 0);
                  }} className="text-blue-400 hover:text-blue-600">
                    <X size={10} />
                  </button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                  bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  <MapPin size={10} /> {city}
                  <button onClick={() => {
                    setCity(""); setPage(0);
                    fetchJobs(keyword, "", appliedFilters, 0);
                  }} className="text-gray-400 hover:text-gray-600">
                    <X size={10} />
                  </button>
                </span>
              )}
              <button onClick={handleClearAll}
                className="text-xs text-red-500 hover:underline ml-auto">
                Xóa tất cả
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ───── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Mobile filter toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-800">{total.toLocaleString()}</strong> việc làm
          </p>
          <button
            onClick={() => setMobileFilterOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200
              rounded-xl text-xs font-medium text-gray-700
              hover:border-gray-300 transition-colors shadow-sm"
          >
            <SlidersHorizontal size={14} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold
                rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileFilterOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white
                  shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Bộ lọc</h3>
                  <button onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-4">
                  <JobFilterSidebar
                    appliedFilters={appliedFilters}
                    onApply={handleApplyFilters}
                    onClearAll={handleClearAll}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex gap-6 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <JobFilterSidebar
                appliedFilters={appliedFilters}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
              />
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">

            {/* Header count + clear */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Briefcase size={14} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">{total.toLocaleString()}</strong> việc làm
                  {(keyword || city) && (
                    <span className="text-gray-400"> được tìm thấy</span>
                  )}
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={handleClearAll}
                  className="hidden lg:flex items-center gap-1.5 text-xs text-red-500
                    hover:text-red-700 transition-colors">
                  <X size={12} /> Xóa bộ lọc ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-center py-12 text-sm text-red-500 bg-red-50
                rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            {/* ── Loading skeleton ──────────────── */}
            {loading && (
              <>
                <div className="mb-3 h-5 w-32 bg-blue-100 rounded-full animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  <SkeletonCard featured />
                  <SkeletonCard featured />
                </div>
                <div className="mb-3 h-5 w-28 bg-gray-100 rounded-full animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </>
            )}

            {/* ── Empty ────────────────────────── */}
            {!loading && jobs.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={28} className="text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-medium">Không tìm thấy việc làm phù hợp</p>
                  <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
                </div>
                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 text-sm font-medium text-blue-600
                    bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* ── Featured section ──────────────── */}
            {!loading && featuredJobs.length > 0 && (
              <div className="mb-2">
                <FeaturedSectionHeader count={featuredJobs.length} />
                <JobGrid>
                  {featuredJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSave}
                      competitionLevel={job.competition?.level as CompetitionLevel}
                    />
                  ))}
                </JobGrid>
              </div>
            )}

            {/* ── Regular section ───────────────── */}
            {!loading && regularJobs.length > 0 && (
              <>
                <RegularSectionHeader count={regularJobs.length} total={total} />
                <JobGrid>
                  {regularJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSave}
                      competitionLevel={job.competition?.level as CompetitionLevel}
                    />
                  ))}
                </JobGrid>
              </>
            )}

            {/* ── Pagination ────────────────────── */}
            {!loading && totalPages > 1 && (
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
                showFirstLast
                className="mt-10"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JobsPageInner />
    </Suspense>
  );
}