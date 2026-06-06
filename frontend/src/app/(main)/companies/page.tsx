// src/app/(main)/companies/page.tsx
"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, X, LayoutGrid, List, Filter,
} from "lucide-react";
import { CompanyCard }    from "@/presentation/components/companies/CompanyCard";
import { FilterSidebar, EMPTY_FILTERS } from "@/presentation/components/companies/FilterSidebar";
import type { CompanySearchFilters } from "@/presentation/components/companies/FilterSidebar";
import { Pagination }     from "@/presentation/components/common/Pagination";
import type { CompanyProfile, PageResponse, CompanyPlanCode } from "@/domain/models/Company";
import { COMPANY_SIZE_LABELS } from "@/domain/models/Company";
import { CompanyService }    from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { PlanBadge } from "@/presentation/components/companies/PlanBadge";
import { CompaniesAISearchBar } from "@/presentation/components/companies/CompaniesAISearchBar";

const PER_PAGE = 12;
const companyService = new CompanyService(new CompanyRepository());

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-2/5" />
          <div className="h-5 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Inner ─────────────────────────────────────────────────────────────────────

function CompaniesPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const initialKeyword  = searchParams.get("keyword")  ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  // keyword/location committed (dùng cho fetch + badges)
  const [appliedKeyword,  setAppliedKeyword]  = useState(initialKeyword);
  const [appliedLocation, setAppliedLocation] = useState(initialLocation);

  const [filters, setFilters] = useState<CompanySearchFilters>(EMPTY_FILTERS);
  const [page,    setPage]    = useState(1);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [result,  setResult]  = useState<PageResponse<CompanyProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync URL params → state
  useEffect(() => {
    const kw  = searchParams.get("keyword")  ?? "";
    const loc = searchParams.get("location") ?? "";
    setAppliedKeyword(kw);
    setAppliedLocation(loc);
    setPage(1);
  }, [searchParams]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    companyService.search({
      keyword:   appliedKeyword  || undefined,
      city:      appliedLocation || undefined,
      size:      (filters.size      || undefined) as any,
      planCode:  (filters.planCode  || undefined) as any,
      minRating: filters.minRating  ?? undefined,
      page:      page - 1,
      pageSize:  PER_PAGE,
    })
      .then(res => {
        if (currentFetchId !== fetchIdRef.current) return;
        setResult(res);
        setError(null);
      })
      .catch(e => {
        if (currentFetchId !== fetchIdRef.current) return;
        setError(e?.message ?? "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (currentFetchId !== fetchIdRef.current) return;
        setLoading(false);
      });
  }, [appliedKeyword, appliedLocation, filters, page]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Handler cho CompaniesAISearchBar — nhận (keyword, location) đã commit
  const handleSearch = (kw: string, loc: string) => {
    setAppliedKeyword(kw);
    setAppliedLocation(loc);
    setPage(1);
    const params = new URLSearchParams();
    if (kw)  params.set("keyword",  kw);
    if (loc) params.set("location", loc);
    router.replace(`/companies?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (f: CompanySearchFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedKeyword("");
    setAppliedLocation("");
    setPage(1);
    router.replace("/companies", { scroll: false });
  };

  const companies     = result?.content       ?? [];
  const totalPages    = result?.totalPages    ?? 0;
  const totalElements = result?.totalElements ?? 0;

  const activeFilterCount = [
    filters.size,
    filters.planCode,
    filters.minRating != null && filters.minRating > 0 ? 1 : 0,
  ].filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      {/* section không có overflow-hidden → dropdown AI không bị clip */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        {/* blur balls tách riêng với overflow-hidden để không clip dropdown */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3">Khám phá công ty hàng đầu</h1>
          <p className="text-blue-100 text-sm mb-8 max-w-2xl mx-auto">
            Tìm kiếm công ty phù hợp với bạn qua hàng ngàn đánh giá thực tế
          </p>

          {/* AI Search bar — thay thế search bar thủ công */}
          <CompaniesAISearchBar
            keyword={appliedKeyword}
            location={appliedLocation}
            onSearch={handleSearch}
          />

          {/* Active keyword/location badges */}
          <AnimatePresence>
            {(appliedKeyword || appliedLocation) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center justify-center gap-2 mt-4 flex-wrap"
              >
                <span className="text-blue-100 text-sm">Kết quả cho:</span>
                {appliedKeyword && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1
                    bg-white/20 text-white text-sm font-medium rounded-full border border-white/30">
                    {appliedKeyword}
                    <button
                      onClick={() => handleSearch("", appliedLocation)}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {appliedLocation && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1
                    bg-white/20 text-white text-sm font-medium rounded-full border border-white/30">
                    <MapPin size={11} /> {appliedLocation}
                    <button
                      onClick={() => handleSearch(appliedKeyword, "")}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:flex-col w-56 shrink-0 self-start sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-gray-600">
                  {loading
                    ? <span className="text-gray-400">Đang tải...</span>
                    : <><strong className="text-gray-900">{totalElements.toLocaleString()}</strong> công ty</>
                  }
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.planCode && (
                    <PlanBadge planCode={filters.planCode as CompanyPlanCode} />
                  )}
                  {filters.minRating != null && filters.minRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5
                      text-[10px] font-semibold rounded-full border
                      bg-amber-50 text-amber-700 border-amber-200">
                      ≥ {filters.minRating}★
                      <button
                        onClick={() => handleFilterChange({ ...filters, minRating: null })}
                        className="text-amber-400 hover:text-amber-600 ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {filters.size && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5
                      text-[10px] font-semibold rounded-full border
                      bg-gray-50 text-gray-600 border-gray-200">
                      {COMPANY_SIZE_LABELS[filters.size as keyof typeof COMPANY_SIZE_LABELS] ?? filters.size}
                      <button
                        onClick={() => handleFilterChange({ ...filters, size: "" })}
                        className="text-gray-400 hover:text-gray-600 ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}

                  <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
                    >
                      <List size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5
                      bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                  >
                    <Filter size={12} /> Lọc
                    {activeFilterCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results area */}
            <AnimatePresence mode="wait">

              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={viewMode === "grid" && !isMobile
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"}
                >
                  {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </motion.div>
              )}

              {/* Error */}
              {!loading && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                >
                  <p className="text-gray-500 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => setFilters(f => ({ ...f }))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </motion.div>
              )}

              {/* Empty */}
              {!loading && !error && companies.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                >
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium text-sm">Không tìm thấy công ty phù hợp</p>
                  <p className="text-gray-400 text-xs mt-1">Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc</p>
                  <button
                    onClick={handleClearAll}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50
                      rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </motion.div>
              )}

              {/* Results */}
              {!loading && !error && companies.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={viewMode === "grid" && !isMobile
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"}
                >
                  {companies.map((company, index) => (
                    <CompanyCard key={company.id} company={company} index={index} />
                  ))}
                </motion.div>
              )}

            </AnimatePresence>

            {totalPages > 1 && !loading && !error && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={p => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  siblingCount={isMobile ? 0 : 1}
                  showFirstLast={!isMobile}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-50
                lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4
                flex items-center justify-between">
                <h3 className="font-bold text-lg">Bộ lọc</h3>
                <button onClick={() => setShowMobileFilter(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 pb-28">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onClearAll={() => { handleClearAll(); setShowMobileFilter(false); }}
                />
              </div>
              <div className="fixed bottom-0 right-0 w-[85vw] max-w-sm
                bg-white border-t border-gray-100 p-4 shadow-lg">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold
                    hover:bg-blue-700 transition-colors"
                >
                  Xem kết quả {!loading && `(${totalElements})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CompaniesPageInner />
    </Suspense>
  );
}