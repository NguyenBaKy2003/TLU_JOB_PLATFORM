"use client";
import { useState, useCallback } from "react";
import { Search, FileText, Sheet, CalendarDays } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StatusOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSearchParams {
  search: string;
  dateFrom: string;
  dateTo: string;
}

export interface EmployerFilterBarProps {
  /** Danh sách tab trạng thái — nếu không truyền thì ẩn phần tab */
  statusTabs?: StatusOption[];
  activeStatus?: string;
  onStatusChange?: (value: string) => void;

  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;

  /** Hiển thị bộ lọc ngày từ/đến */
  showDateRange?: boolean;

  /**
   * Callback khi người dùng nhấn nút Tìm kiếm hoặc Enter.
   * Hàm này mới kích hoạt API call — status thay đổi sẽ tự trigger qua onStatusChange.
   */
  onSearch: (params: FilterSearchParams) => void;

  /** Xuất PDF — nếu không truyền thì ẩn nút */
  onExportPdf?: () => void;

  /** Xuất Excel — nếu không truyền thì ẩn nút */
  onExportExcel?: () => void;

  /** Disable các nút export khi đang loading */
  exportLoading?: boolean;

  /** Disable input + nút search khi đang load kết quả */
  loading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmployerFilterBar({
  statusTabs,
  activeStatus,
  onStatusChange,
  searchPlaceholder = "Tìm kiếm...",
  showDateRange = false,
  onSearch,
  onExportPdf,
  onExportExcel,
  exportLoading = false,
  loading = false,
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

  const hasExportButtons = onExportPdf || onExportExcel;
  const showTopRow       = statusTabs || hasExportButtons;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Row 1: Status tabs + Export buttons ─────────────────────────── */}
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

          {hasExportButtons && (
            <div className="flex items-center gap-2 ml-auto">
              {onExportPdf && (
                <button
                  onClick={onExportPdf}
                  disabled={exportLoading || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-red-600 bg-red-50 border border-red-200 rounded-xl
                    hover:bg-red-100 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <FileText size={13} />
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
                  <Sheet size={13} />
                  Xuất Excel
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── Row 2: Date range + Search input + Button ───────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

        {showDateRange && (
          <>
            <label className="sr-only" htmlFor="filter-date-from">Từ ngày</label>
            <div className="relative flex items-center">
              <CalendarDays
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
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
              <CalendarDays
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
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

        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            disabled={loading}
            className="w-full pl-9 pr-4 py-2 text-[16px] bg-white border border-gray-200
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-400 placeholder:text-gray-300 disabled:opacity-50
              transition-all"
          />
        </div>

        {/* Search trigger button */}
        <button
          onClick={triggerSearch}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium
            text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95
            disabled:opacity-50 transition-all shrink-0"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search size={13} />
          )}
          Tìm kiếm
        </button>

      </div>
    </div>
  );
}