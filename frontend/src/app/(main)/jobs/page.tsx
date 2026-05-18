// src/app/(main)/jobs/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { JobCard }            from "@/presentation/components/jobs/JobCard";
import type { CompetitionLevel } from "@/presentation/components/jobs/JobCard";
import { JobFilterSidebar, EMPTY_FILTERS } from "@/presentation/components/jobs/JobFilterSidebar";
import { JobService }         from "@/application/services/JobService";
import { JobRepository }      from "@/infrastructure/repositories/JobRepository";
import { AiService }          from "@/application/services/AiService";
import { AiRepository }       from "@/infrastructure/repositories/AiRepository";
import type { JobPost, JobSearchParams } from "@/domain/models/Job";
import { extractErrorMessage }  from "@/lib/extractErrorMessage";
import type { JobFilters }      from "@/presentation/components/jobs/JobFilterSidebar";
import { Pagination }           from "@/presentation/components/common/Pagination";

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

export default function JobsPage() {
  const [jobs,       setJobs]       = useState<JobPost[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [keyword,  setKeyword]  = useState("");
  const [city,     setCity]     = useState("");
  const [filters,  setFilters]  = useState<JobFilters>(EMPTY_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [draftKeyword, setDraftKeyword] = useState("");
  const [draftCity,    setDraftCity]    = useState("");

  const [competitionMap, setCompetitionMap] = useState<Record<string, CompetitionLevel>>({});

  const hasLoaded = useRef(false);
  const isFirst   = useRef(true);

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

  const fetchJobs = useCallback(async (
    kw: string, ct: string, f: JobFilters, pg: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: JobSearchParams = {
        keyword:  kw || undefined,
        city:     ct || undefined,
        jobType:  f.jobTypes[0] as JobSearchParams["jobType"] || undefined,
        level:    f.levels[0]   as JobSearchParams["level"]   || undefined,
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

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    fetchJobs("", "", EMPTY_FILTERS, 0);
  }, [fetchJobs]);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    fetchJobs(keyword, city, filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const handleSearch = () => {
    setKeyword(draftKeyword);
    setCity(draftCity);
    setPage(0);
    fetchJobs(draftKeyword, draftCity, filters, 0);
  };

  const handleSave = useCallback(async (id: string) => {
    try { await jobService.toggleSave(id); } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-blue-600 text-white text-center text-xs font-medium py-2.5 px-4">
        ✦ Tốc độ tăng hơn 20% khi sử dụng gói trả phí của chúng tôi.{" "}
        <a href="/pricing" className="underline font-semibold hover:text-blue-100">Tìm hiểu thêm</a>
      </div>

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
                onChange={e => setDraftKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Tên công việc hoặc từ khóa"
                className="flex-1 text-[16px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <select
                value={draftCity}
                onChange={e => setDraftCity(e.target.value)}
                className="text-[16px] text-gray-800 focus:outline-none bg-transparent cursor-pointer w-36"
              >
                <option value="">Địa điểm</option>
                {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bắc Ninh", "Hải Phòng", "Huế"].map(c => (
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
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="lg:hidden mb-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-800">{total.toLocaleString()}</strong> việc làm
          </p>
          <button
            onClick={() => setMobileFilterOpen(v => !v)}
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
                onChange={f => { setFilters(f); setPage(0); setMobileFilterOpen(false); }}
              />
            </div>
          </>
        )}

        <div className="flex gap-8 items-start">

          <div className="hidden lg:block">
            <JobFilterSidebar
              filters={filters}
              onChange={f => { setFilters(f); setPage(0); }}
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
                        onClick={() => { setFilters(EMPTY_FILTERS); setPage(0); }}
                        className="mt-3 text-blue-600 text-xs hover:underline"
                      >
                        Xoá bộ lọc
                      </button>
                    </div>
                  )
                  : jobs.map(job => (
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
                  onChange={p => {
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