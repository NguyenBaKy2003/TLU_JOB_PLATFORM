"use client";
import { useState, useCallback } from "react";
import { Search, FileText, Sheet, CalendarDays, ChevronDown } from "lucide-react";
import { LoadingSpinner } from "../../common";

// ── Types ─────────────

export interface StatusOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSearchParams {
  search:   string;
  dateFrom: string;
  dateTo:   string;
}

export interface EmployerFilterBarProps {
  statusTabs?:        StatusOption[];
  activeStatus?:      string;
  onStatusChange?:    (value: string) => void;
  searchPlaceholder?: string;
  showDateRange?:     boolean;
  onSearch:           (params: FilterSearchParams) => void;
  pageSizeOptions?:   number[];
  pageSize?:          number;
  onPageSizeChange?:  (size: number) => void;
  onExportPdf?:       () => void;
  onExportExcel?:     () => void;
  exportLoading?:     boolean;
  loading?:           boolean;
}

// ── Page Size Select ──

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
        {options.map(o => (
          <option key={o} value={o}>{o} / trang</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Component ─────────

export function EmployerFilterBar({
  statusTabs,
  activeStatus,
  onStatusChange,
  searchPlaceholder = "Tìm kiếm...",
  showDateRange     = false,
  onSearch,
  pageSizeOptions,
  pageSize,
  onPageSizeChange,
  onExportPdf,
  onExportExcel,
  exportLoading = false,
  loading       = false,
}: EmployerFilterBarProps) {
  const [search,   setSearch]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const triggerSearch = useCallback(() => {
    onSearch({ search: search.trim(), dateFrom, dateTo });
  }, [search, dateFrom, dateTo, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerSearch();
  };

  const hasExportButtons    = onExportPdf || onExportExcel;
  const hasPageSizeSelector = pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange;
  const showTopRow          = statusTabs || hasExportButtons || hasPageSizeSelector;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Row 1: Status tabs + Page size + Export ─────────────────────── */}
      {showTopRow && (
        <div className="flex items-center gap-3 flex-wrap">
          {statusTabs && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto shrink-0">
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

          <div className="flex items-center gap-2 ml-auto">
            {hasPageSizeSelector && (
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
        </div>
      )}

      {/* ── Row 2: Date range + Search + Button ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

        {showDateRange && (
          <>
            <label className="sr-only" htmlFor="filter-date-from">Từ ngày</label>
            <div className="relative flex items-center">
              <CalendarDays size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  focus:border-blue-400 text-gray-700 disabled:opacity-50 transition-all"
              />
            </div>
            <span className="hidden sm:block text-gray-300 self-center select-none">—</span>
            <label className="sr-only" htmlFor="filter-date-to">Đến ngày</label>
            <div className="relative flex items-center">
              <CalendarDays size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="filter-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => setDateTo(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  focus:border-blue-400 text-gray-700 disabled:opacity-50 transition-all"
              />
            </div>
          </>
        )}

        <div className="relative flex-1 min-w-0">
          <Search size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            disabled={loading}
            className="w-full pl-9 pr-4 py-2 text-[16px] bg-white border border-gray-200
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-400 placeholder:text-gray-300 disabled:opacity-50 transition-all"
          />
        </div>

        <button
          onClick={triggerSearch}
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