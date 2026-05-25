// src/app/(main)/jobs/page.tsx
"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { JobCard }            from "@/presentation/components/jobs/JobCard";
import type { CompetitionLevel } from "@/presentation/components/jobs/JobCard";
import { JobFilterSidebar, EMPTY_FILTERS } from "@/presentation/components/jobs/JobFilterSidebar";
import { JobService }         from "@/application/services/JobService";
import { JobRepository }      from "@/infrastructure/repositories/JobRepository";
import { AiService }          from "@/application/services/AiService";
import { AiRepository }       from "@/infrastructure/repositories/AiRepository";
import type { JobPost, JobSearchParams } from "@/domain/models/Job";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { JobFilters }     from "@/presentation/components/jobs/JobFilterSidebar";
import { Pagination }          from "@/presentation/components/common/Pagination";

const jobService = new JobService(new JobRepository());
const aiService  = new AiService(new AiRepository());

function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-5 bg-white border border-gray-100 rounded-2xl">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-gray-100 rounded w-2/5" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Inner component (cần searchParams) ──────────────────────────────────────
function JobsPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Khởi tạo từ URL params (từ HeroSection navigate tới)
  const initialKeyword  = searchParams.get("keyword")  ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  const [jobs,        setJobs]        = useState<JobPost[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // Committed search values (dùng để fetch)
  const [keyword,  setKeyword]  = useState(initialKeyword);
  const [city,     setCity]     = useState(initialLocation);
  const [filters,  setFilters]  = useState<JobFilters>(EMPTY_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Draft values (trong ô input, chưa search)
  const [draftKeyword, setDraftKeyword] = useState(initialKeyword);
  const [draftCity,    setDraftCity]    = useState(initialLocation);

  const [competitionMap, setCompetitionMap] = useState<Record<string, CompetitionLevel>>({});

  const isFirst = useRef(true);

  // ── Competition fetch ────────────────────────────────────────────────────
  const fetchCompetition = useCallback((jobList: JobPost[]) => {
    jobList.forEach((job) => {
      aiService
        .getCompetitionRate(job.id)
        .then((res) =>
          setCompetitionMap((prev) => ({ ...prev, [job.id]: res.level }))
        )
        .catch(() => {});
    });
  }, []);

  // ── Jobs fetch ───────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (
    kw: string, ct: string, f: JobFilters, pg: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: JobSearchParams = {
        keyword: kw  || undefined,
        city:    ct  || undefined,
        jobType: f.jobTypes[0] as JobSearchParams["jobType"] || undefined,
        level:   f.levels[0]   as JobSearchParams["level"]   || undefined,
        page: pg,
        size: 18,
      };
      const res = await jobService.search(params);
      setJobs(res.content);
      setTotal(res.totalElements);
      setTotalPages(res.totalPages);
      fetchCompetition(res.content);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải danh sách việc làm"));
    } finally {
      setLoading(false);
    }
  }, [fetchCompetition]);

  // ── Initial fetch (dùng URL params) ─────────────────────────────────────
  useEffect(() => {
    fetchJobs(initialKeyword, initialLocation, EMPTY_FILTERS, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ chạy 1 lần khi mount

  // ── Re-fetch khi filters / page thay đổi (không phải lần đầu) ───────────
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    fetchJobs(keyword, city, filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // ── Khi URL params thay đổi (user navigate từ HeroSection lần nữa) ───────
  useEffect(() => {
    const kw  = searchParams.get("keyword")  ?? "";
    const loc = searchParams.get("location") ?? "";
    setDraftKeyword(kw);
    setDraftCity(loc);
    setKeyword(kw);
    setCity(loc);
    setPage(0);
    setFilters(EMPTY_FILTERS);
    fetchJobs(kw, loc, EMPTY_FILTERS, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Search button / Enter ────────────────────────────────────────────────
  const handleSearch = () => {
    setKeyword(draftKeyword);
    setCity(draftCity);
    setPage(0);
    // Cập nhật URL để bookmarkable
    const params = new URLSearchParams();
    if (draftKeyword) params.set("keyword",  draftKeyword);
    if (draftCity)    params.set("location", draftCity);
    router.replace(`/jobs?${params.toString()}`, { scroll: false });
    fetchJobs(draftKeyword, draftCity, filters, 0);
  };

  const handleSave = useCallback(async (id: string) => {
    try { await jobService.toggleSave(id); } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Promo banner */}
      <div className="bg-blue-600 text-white text-center text-xs font-medium py-2.5 px-4">
        ✦ Tốc độ tăng hơn 20% khi sử dụng gói trả phí của chúng tôi.{" "}
        <a href="/pricing" className="underline font-semibold hover:text-blue-100">Tìm hiểu thêm</a>
      </div>

      {/* Search section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Khám phá công việc phù hợp nhất
          </h1>
          <div className="flex flex-col sm:flex-row max-w-2xl mx-auto rounded-2xl border
            border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                value={draftKeyword}
                onChange={(e) => setDraftKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tên công việc hoặc từ khóa"
                className="flex-1 text-[16px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              {/* Clear button — hiện khi có text */}
              {draftKeyword && (
                <button
                  onClick={() => { setDraftKeyword(""); }}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <select
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                className="text-[16px] text-gray-800 focus:outline-none bg-transparent cursor-pointer w-36"
              >
                <option value="">Địa điểm</option>
                {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bắc Ninh", "Hải Phòng", "Huế"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="text-gray-400 shrink-0" />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600
                text-white text-[16px] font-semibold hover:bg-blue-700 transition-colors"
            >
              <Search size={15} /> Tìm kiếm
            </button>
          </div>

          {/* Active search badge — hiện khi có keyword từ HeroSection */}
          {keyword && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-[16px] text-gray-500">Kết quả cho:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700
                text-[16px] font-medium rounded-full border border-blue-100">
                {keyword}
                <button
                  onClick={() => {
                    setDraftKeyword("");
                    setKeyword("");
                    setPage(0);
                    router.replace("/jobs", { scroll: false });
                    fetchJobs("", city, filters, 0);
                  }}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </span>
              {city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600
                  text-[16px] font-medium rounded-full border border-gray-200">
                  <MapPin size={11} />
                  {city}
                  <button
                    onClick={() => {
                      setDraftCity("");
                      setCity("");
                      setPage(0);
                      fetchJobs(keyword, "", filters, 0);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-800">{total.toLocaleString()}</strong> việc làm
          </p>
          <button
            onClick={() => setMobileFilterOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
              rounded-xl text-[16px] font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Bộ lọc
            {(filters.jobTypes.length + filters.levels.length) > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold
                rounded-full flex items-center justify-center">
                {filters.jobTypes.length + filters.levels.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter drawer */}
        {mobileFilterOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Bộ lọc</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <JobFilterSidebar
                filters={filters}
                onChange={(f) => { setFilters(f); setPage(0); setMobileFilterOpen(false); }}
              />
            </div>
          </>
        )}

        <div className="flex gap-8 items-start">

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <JobFilterSidebar
              filters={filters}
              onChange={(f) => { setFilters(f); setPage(0); }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="hidden lg:block text-xs text-gray-500 mb-4">
              <strong className="text-gray-800">{total.toLocaleString()}</strong> việc làm được tìm thấy
            </p>

            {error && (
              <div className="text-center py-12 text-[16px] text-red-500">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : jobs.length === 0
                  ? (
                    <div className="col-span-2 py-16 text-center">
                      <p className="text-gray-400 text-[16px]">Không tìm thấy việc làm phù hợp</p>
                      <button
                        onClick={() => {
                          setFilters(EMPTY_FILTERS);
                          setDraftKeyword("");
                          setKeyword("");
                          setPage(0);
                          router.replace("/jobs", { scroll: false });
                          fetchJobs("", "", EMPTY_FILTERS, 0);
                        }}
                        className="mt-3 text-blue-600 text-xs hover:underline"
                      >
                        Xoá bộ lọc
                      </button>
                    </div>
                  )
                  : jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSave}
                      competitionLevel={competitionMap[job.id]}
                    />
                  ))
              }
            </div>

            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={page + 1}
                  total={totalPages}
                  onChange={(p) => {
                    setPage(p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export với Suspense wrapper (bắt buộc cho useSearchParams) ───────────────
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