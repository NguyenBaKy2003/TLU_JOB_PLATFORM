"use client";
import { useState, useCallback } from "react";
import {
  Search, FileText, Sheet, CalendarDays, ChevronDown, X,
} from "lucide-react";
import { LoadingSpinner } from "@/presentation/components/common";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CandidateStatusTab {
  value:  string;
  label:  string;
  count?: number;
}

export interface CandidateFilterParams {
  keyword:       string;
  appliedAtFrom: string;
  appliedAtTo:   string;
}

export interface CandidateFilterBarProps {
  statusTabs?:        CandidateStatusTab[];
  activeStatus?:      string;
  onStatusChange?:    (value: string) => void;

  searchPlaceholder?: string;
  showDateRange?:     boolean;

  /** Chỉ gọi khi nhấn nút Tìm kiếm hoặc Enter */
  onFilter:           (params: CandidateFilterParams) => void;

  /** Tùy chọn page size */
  pageSizeOptions?:   number[];
  pageSize?:          number;
  onPageSizeChange?:  (size: number) => void;

  /** Export */
  onExportPdf?:       () => void;
  onExportExcel?:     () => void;
  exportLoading?:     boolean;

  loading?:           boolean;
}

// ── Page Size Select ───────────────────────────────────────────────────────────

function PageSizeSelect({
  options, value, onChange, disabled,
}: {
  options: number[]; value: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className="appearance-none pl-3 pr-7 py-2 text-xs font-medium bg-white
          border border-gray-200 rounded-xl text-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          disabled:opacity-50 transition-all cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o} / trang</option>)}
      </select>
      <ChevronDown size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CandidateFilterBar({
  statusTabs,
  activeStatus,
  onStatusChange,
  searchPlaceholder = "Tìm kiếm...",
  showDateRange     = true,
  onFilter,
  pageSizeOptions,
  pageSize,
  onPageSizeChange,
  onExportPdf,
  onExportExcel,
  exportLoading     = false,
  loading           = false,
}: CandidateFilterBarProps) {

  const [keyword,       setKeyword]       = useState("");
  const [appliedAtFrom, setAppliedAtFrom] = useState("");
  const [appliedAtTo,   setAppliedAtTo]   = useState("");

  const triggerFilter = useCallback(() => {
    onFilter({
      keyword:       keyword.trim(),
      appliedAtFrom,
      appliedAtTo,
    });
  }, [keyword, appliedAtFrom, appliedAtTo, onFilter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerFilter();
  };

  const clearKeyword = () => {
    setKeyword("");
    onFilter({ keyword: "", appliedAtFrom, appliedAtTo });
  };

  const hasPageSize  = !!(pageSizeOptions?.length && onPageSizeChange);
  const hasExport    = !!(onExportPdf || onExportExcel);
  const showTopRow   = !!(statusTabs?.length || hasPageSize || hasExport);

  return (
    <div className="flex flex-col gap-3">

      {/* ── Row 1: Tabs + PageSize + Export ──────────────────────────────── */}
      {showTopRow && (
        <div className="flex items-center gap-3 flex-wrap">

          {!!statusTabs?.length && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-none shrink-0">
              {statusTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => onStatusChange?.(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    rounded-lg whitespace-nowrap transition-all ${
                    activeStatus === tab.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      activeStatus === tab.value
                        ? "bg-gray-100 text-gray-600"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {(hasPageSize || hasExport) && (
            <div className="flex items-center gap-2 ml-auto">
              {hasPageSize && (
                <PageSizeSelect
                  options={pageSizeOptions!}
                  value={pageSize ?? pageSizeOptions![0]}
                  onChange={onPageSizeChange!}
                  disabled={loading}
                />
              )}
              {onExportPdf && (
                <button
                  onClick={onExportPdf}
                  disabled={exportLoading || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-red-600 bg-red-50 border border-red-200 rounded-xl
                    hover:bg-red-100 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {exportLoading
                    ? <LoadingSpinner size="sm" variant="white" />
                    : <FileText size={13} />
                  }
                  Xuất PDF
                </button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  disabled={exportLoading || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl
                    hover:bg-emerald-100 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {exportLoading
                    ? <LoadingSpinner size="sm" variant="white" />
                    : <Sheet size={13} />
                  }
                  Xuất Excel
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Row 2: Date range + Search input + Tìm kiếm button ───────────── */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

        {showDateRange && (
          <>
            <label className="sr-only" htmlFor="candidate-filter-from">Từ ngày</label>
            <div className="relative flex items-center">
              <CalendarDays size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="candidate-filter-from"
                type="date"
                value={appliedAtFrom}
                max={appliedAtTo || undefined}
                onChange={e => setAppliedAtFrom(e.target.value)}
                disabled={loading}
                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  focus:border-blue-400 text-gray-700 disabled:opacity-50 transition-all"
              />
            </div>

            <span className="hidden sm:block text-gray-300 self-center select-none">—</span>

            <label className="sr-only" htmlFor="candidate-filter-to">Đến ngày</label>
            <div className="relative flex items-center">
              <CalendarDays size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="candidate-filter-to"
                type="date"
                value={appliedAtTo}
                min={appliedAtFrom || undefined}
                onChange={e => setAppliedAtTo(e.target.value)}
                disabled={loading}
                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  focus:border-blue-400 text-gray-700 disabled:opacity-50 transition-all"
              />
            </div>
          </>
        )}

        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            disabled={loading}
            className="w-full pl-9 pr-8 py-2 text-[16px] bg-white border border-gray-200
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-400 placeholder:text-gray-300 disabled:opacity-50 transition-all"
          />
          {keyword && (
            <button
              onClick={clearKeyword}
              aria-label="Xóa từ khóa"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Search button — giống Employer */}
        <button
          onClick={triggerFilter}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium
            text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95
            disabled:opacity-50 transition-all shrink-0"
        >
          {loading
            ? <LoadingSpinner size="sm" variant="white" />
            : <Search size={13} />
          }
          Tìm kiếm
        </button>

      </div>
    </div>
  );
}