// src/app/(main)/companies/page.tsx
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Search, MapPin, ChevronDown }           from "lucide-react";
import { CompanyCard }     from "@/presentation/components/companies/CompanyCard";
import { FilterSidebar }   from "@/presentation/components/companies/FilterSidebar";
import { SORT_TABS }       from "@/presentation/components/companies/mockData";
import { Pagination }      from "@/presentation/components/common/Pagination";
import type { CompanyFilters } from "@/presentation/components/companies/types";
import type { CompanyProfile, PageResponse } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { toCompanyCard } from "@/presentation/components/companies/adapters";

const PER_PAGE = 10;

const companyService= new CompanyService(new CompanyRepository);
export default function CompaniesPage() {
  // ── Search & sort ─────────────────────────────────────────────────────────
  const [keyword,      setKeyword]      = useState("");
  const [location,     setLocation]     = useState("");
  const [sortTab,      setSortTab]      = useState("popular");
  const [page,         setPage]         = useState(1);
  const [filters,      setFilters]      = useState<CompanyFilters>({
    benefits: [], gender: "", companySize: "",
  });

  // ── Server state ──────────────────────────────────────────────────────────
  const [result,   setResult]   = useState<PageResponse<CompanyProfile> | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // debouce keyword để tránh call API mỗi keystroke
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    companyService
      .listVerified({
        page:        page - 1,          // backend 0-based
        size:        PER_PAGE,
        keyword:     debouncedKeyword   || undefined,
        location:    location           || undefined,
        sort:        sortTab            || undefined,
        companySize: filters.companySize || undefined,
      })
      .then(res => { if (!cancelled) setResult(res); })
      .catch(e  => { if (!cancelled) setError(e?.message ?? "Lỗi tải dữ liệu"); })
      .finally(()=> { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, debouncedKeyword, location, sortTab, filters.companySize]);

  // ── Active filter tags ────────────────────────────────────────────────────
  const activeTags = useMemo(() => {
    const tags: { label: string; key: string }[] = [];
    filters.benefits.forEach(b => tags.push({ label: b, key: `benefit:${b}` }));
    if (filters.gender)      tags.push({ label: filters.gender,                  key: "gender" });
    if (filters.companySize) tags.push({ label: `Quy mô ${filters.companySize}`, key: "size"   });
    return tags;
  }, [filters]);

  const removeTag = (key: string) => {
    if (key.startsWith("benefit:")) {
      const b = key.replace("benefit:", "");
      setFilters(f => ({ ...f, benefits: f.benefits.filter(x => x !== b) }));
    } else if (key === "gender") setFilters(f => ({ ...f, gender: "" }));
    else if  (key === "size")    setFilters(f => ({ ...f, companySize: "" }));
    setPage(1);
  };

  const companies  = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero / Search bar ────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Khám phá môi trường làm việc tốt nhất
          </h1>
          <div className="flex flex-col sm:flex-row gap-0 max-w-2xl mx-auto rounded-2xl
            border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setPage(1)}
                placeholder="Chức danh hoặc từ khóa"
                className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <input
                value={location}
                onChange={e => { setLocation(e.target.value); setPage(1); }}
                placeholder="Địa điểm"
                className="text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent w-28"
              />
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </div>
            <button
              onClick={() => setPage(1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600
                text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Search size={15} /> Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* ── Sort tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {SORT_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setSortTab(tab.value); setPage(1); }}
                className={`shrink-0 px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                  sortTab === tab.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">

          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onChange={f => { setFilters(f); setPage(1); }}
              activeTagsDisplay={activeTags}
              onRemoveTag={removeTag}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Result count */}
            <p className="text-xs text-gray-500 mb-4">
              Hiển thị{" "}
              <strong className="text-gray-700">{result?.totalElements ?? "..."}</strong>{" "}
              công ty
            </p>

            {/* States */}
            {error && (
              <div className="py-10 text-center text-red-500 text-sm">{error}</div>
            )}

            {loading && !error && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex flex-col gap-3">
                  {companies.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">
                      Không tìm thấy công ty phù hợp
                    </div>
                  ) : (
                    companies.map(c => (
                      <CompanyCard key={c.id} company={toCompanyCard(c)} />
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination current={page} total={totalPages} onChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}