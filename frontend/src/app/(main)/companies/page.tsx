// src/app/(main)/companies/page.tsx
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, ChevronDown, Filter, X, 
  LayoutGrid, List, ArrowUpDown 
} from "lucide-react";
import { CompanyCard } from "@/presentation/components/companies/CompanyCard";
import { FilterSidebar } from "@/presentation/components/companies/FilterSidebar";
import { SORT_TABS } from "@/presentation/components/companies/mockData";
import { Pagination } from "@/presentation/components/common/Pagination";
import type { CompanyFilters } from "@/presentation/components/companies/types";
import type { CompanyProfile, PageResponse } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { toCompanyCard } from "@/presentation/components/companies/adapters";

const PER_PAGE = 10;
const companyService = new CompanyService(new CompanyRepository());

export default function CompaniesPage() {
  // ── Search & sort ─────
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [sortTab, setSortTab] = useState("popular");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CompanyFilters>({
    benefits: [], 
    gender: "", 
    companySize: "",
  });

  // ── UI State ──────────
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isMobile, setIsMobile] = useState(false);

  // ── Server state ──────
  const [result, setResult] = useState<PageResponse<CompanyProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Debounce keyword
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword]);

  // ── Fetch ─────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchParams = {
      page: page - 1,
      size: PER_PAGE,
      keyword: debouncedKeyword || undefined,
      location: location || undefined,
      sort: sortTab || undefined,
      companySize: filters.companySize || undefined,
    };

    companyService
      .listVerified(fetchParams)
      .then(res => { 
        if (!cancelled) setResult(res); 
      })
      .catch(e => { 
        if (!cancelled) setError(e?.message ?? "Lỗi tải dữ liệu"); 
      })
      .finally(() => { 
        if (!cancelled) setLoading(false); 
      });

    return () => { cancelled = true; };
  }, [page, debouncedKeyword, location, sortTab, filters.companySize]);

  // ── Active filter tags 
  const activeTags = useMemo(() => {
    const tags: { label: string; key: string }[] = [];
    filters.benefits.forEach(b => tags.push({ label: b, key: `benefit:${b}` }));
    if (filters.gender) tags.push({ label: `Giới tính: ${filters.gender}`, key: "gender" });
    if (filters.companySize) {
      const sizeLabel = SIZE_MAP[filters.companySize as keyof typeof SIZE_MAP] || filters.companySize;
      tags.push({ label: `Quy mô: ${sizeLabel}`, key: "size" });
    }
    return tags;
  }, [filters]);

  const removeTag = (key: string) => {
    if (key.startsWith("benefit:")) {
      const b = key.replace("benefit:", "");
      setFilters(f => ({ ...f, benefits: f.benefits.filter(x => x !== b) }));
    } else if (key === "gender") {
      setFilters(f => ({ ...f, gender: "" }));
    } else if (key === "size") {
      setFilters(f => ({ ...f, companySize: "" }));
    }
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setFilters({
      benefits: [],
      gender: "",
      companySize: "",
    });
    setPage(1);
  };

  const companies = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;
  const totalElements = result?.totalElements ?? 0;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* ── Hero Section ── */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4"
          >
            Khám phá công ty hàng đầu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
          >
            Tìm kiếm công ty phù hợp với bạn qua hàng ngàn đánh giá thực tế
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto px-4 sm:px-0"
          >
            <div className="flex flex-col sm:flex-row gap-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 sm:px-5 sm:py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setPage(1)}
                  placeholder="Tên công ty, ngành nghề..."
                  className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <input
                  value={location}
                  onChange={e => { setLocation(e.target.value); setPage(1); }}
                  placeholder="Địa điểm"
                  className="text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent min-w-[100px] sm:min-w-[120px]"
                />
                <ChevronDown size={14} className="text-gray-400 shrink-0 sm:hidden" />
              </div>
              <button
                onClick={() => setPage(1)}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Search size={16} /> 
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                activeTagsDisplay={activeTags}
                onRemoveTag={removeTag}
                onClearAll={handleClearAllFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Result count */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{totalElements.toLocaleString()}</span>{" "}
                    <span className="hidden sm:inline">công ty</span>
                    <span className="sm:hidden">cty</span>
                  </p>
                  {activeTags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <X size={12} />
                        Xóa bộ lọc
                      </button>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Sort dropdown for mobile */}
                  <div className="lg:hidden">
                    <select
                      value={sortTab}
                      onChange={(e) => { setSortTab(e.target.value); setPage(1); }}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SORT_TABS.map(tab => (
                        <option key={tab.value} value={tab.value}>{tab.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* View mode toggle - hide on mobile */}
                  <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                      }`}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                      }`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </div>

                  {/* Mobile filter button */}
                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                  >
                    <Filter size={12} />
                    Lọc
                    {activeTags.length > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                        {activeTags.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Active tags for mobile */}
              {activeTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {activeTags.slice(0, 3).map(tag => (
                    <span
                      key={tag.key}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                    >
                      <span className="truncate max-w-[100px]">{tag.label}</span>
                      <button onClick={() => removeTag(tag.key)} className="text-blue-400 hover:text-red-500">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {activeTags.length > 3 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600"
                    >
                      +{activeTags.length - 3}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sort tabs - Desktop */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {SORT_TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => { setSortTab(tab.value); setPage(1); }}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg transition-all
                      ${sortTab === tab.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
                    <div key={i} className="h-28 sm:h-32 rounded-xl bg-white animate-pulse shadow-sm" />
                  ))}
                </motion.div>
              )}

              {/* Error State */}
              {error && !loading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 sm:py-16"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 mb-3 sm:mb-4">
                    <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 px-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </motion.div>
              )}

              {/* Results */}
              {!loading && !error && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`space-y-3 ${
                    viewMode === "grid" && !isMobile 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0" 
                      : "space-y-3"
                  }`}
                >
                  {companies.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl mx-2 sm:mx-0">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3 sm:mb-4">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <p className="text-sm sm:text-base text-gray-500">Không tìm thấy công ty phù hợp</p>
                      <button
                        onClick={handleClearAllFilters}
                        className="mt-4 text-blue-600 text-sm hover:underline"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  ) : (
                    companies.map((company, index) => (
                      <CompanyCard 
                        key={company.id} 
                        company={toCompanyCard(company)} 
                        index={index}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && !loading && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6 sm:mt-8 px-4 sm:px-0"
              >
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  siblingCount={isMobile ? 0 : 1}
                  showFirstLast={!isMobile}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Bộ lọc</h3>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 pb-24">
                <FilterSidebar
                  filters={filters}
                  onChange={(newFilters) => {
                    setFilters(newFilters);
                    setPage(1);
                  }}
                  activeTagsDisplay={activeTags}
                  onRemoveTag={(key) => {
                    removeTag(key);
                    setPage(1);
                  }}
                  onClearAll={() => {
                    handleClearAllFilters();
                    setShowMobileFilter(false);
                  }}
                />
              </div>
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Xem kết quả ({totalElements})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Size mapping helper
const SIZE_MAP = {
  small: "Dưới 50",
  medium: "50-200",
  large: "200-500",
  enterprise: "Trên 500",
} as const;