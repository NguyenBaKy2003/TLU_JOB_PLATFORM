"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, Search, X, CheckCircle2, XCircle, Clock, Filter,
} from "lucide-react";
import { AuditLogService }    from "@/application/services/AuditLogService";
import { AuditLogRepository } from "@/infrastructure/repositories/AuditLogRepository";
import type { AuditLog, MyAuditLogFilters, AuditLogResult } from "@/domain/models/AuditLog";
import { AUDIT_ACTION_LABELS } from "@/domain/models/AuditLog";
import { TablePagination } from "../common";

const service = new AuditLogService(new AuditLogRepository());

// Actions chỉ là "đọc nền" — ẩn khỏi view mặc định cho gọn
const NOISE_ACTIONS = new Set([
  "USER_GET_PROFILE",
  "USER_REFRESH_TOKEN",
  "CANDIDATE_GET_PROFILE",
  "EMPLOYER_GET_PROFILE",
]);

// ── Helpers ───────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ResultBadge({ result }: { result: AuditLogResult }) {
  if (result === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold
        rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={10} /> Thành công
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold
      rounded-full bg-red-50 text-red-700 border border-red-200">
      <XCircle size={10} /> Thất bại
    </span>
  );
}

// ── Skeleton ──────────

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-4 px-6 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-5 w-20 bg-gray-100 rounded-full" />
    </div>
  );
}

// ── Log Row ───────────

function LogRow({ log }: { log: AuditLog }) {
  const label = AUDIT_ACTION_LABELS[log.action] ?? log.action;

  return (
    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${log.result === "SUCCESS" ? "bg-emerald-50" : "bg-red-50"}`}>
        {log.result === "SUCCESS"
          ? <CheckCircle2 size={15} className="text-emerald-500" />
          : <XCircle      size={15} className="text-red-500" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {log.resourceType && (
            <span className="text-xs text-gray-400">{log.resourceType}</span>
          )}
          {log.errorMessage && (
            <span className="text-xs text-red-400 truncate max-w-[240px]" title={log.errorMessage}>
              {log.errorMessage}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {formatTime(log.occurredAt)}
          </span>
          {log.ipAddress && (
            <span className="text-xs text-gray-300">{log.ipAddress}</span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <ResultBadge result={log.result} />
      </div>
    </div>
  );
}

// ── Props — cho phép admin truyền actorId để xem log của user khác ────────────

interface ActivityPageProps {
  /** Admin mode: xem log của user cụ thể */
  adminActorId?: string;
}

// ── Page ──────────────

const EMPTY_FILTERS: Omit<MyAuditLogFilters, "page" | "size"> = {
  action:       "",
  resourceType: "",
  result:       "",
  from:         "",
  to:           "",
};

export default function ActivityPage({ adminActorId }: ActivityPageProps) {
  const [logs,        setLogs]        = useState<AuditLog[]>([]);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [page,        setPage]        = useState(0);
  const [pageSize,    setPageSize]    = useState(20);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [keyword,     setKeyword]     = useState("");
  const [showNoise,   setShowNoise]   = useState(false);

  const load = useCallback(async (f: typeof EMPTY_FILTERS, p: number, size: number) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (adminActorId) {
        res = await service.adminGetByUser(adminActorId, f.action || undefined, p, size);
      } else {
        res = await service.getMyLogs({ ...f, page: p, size });
      }
      setLogs(res.content);
      setTotal(res.totalElements);
      setPages(res.totalPages);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Không thể tải lịch sử hoạt động");
    } finally {
      setLoading(false);
    }
  }, [adminActorId]);

  useEffect(() => { load(filters, page, pageSize); }, [filters, page, pageSize, load]);

  const handleFilterChange = (key: keyof typeof EMPTY_FILTERS, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(0);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setKeyword("");
    setPage(0);
  };

  const handlePageChange = (oneBased: number) => {
    setPage(oneBased - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  // 1. Lọc noise (client-side toggle)
  const withoutNoise = showNoise ? logs : logs.filter(l => !NOISE_ACTIONS.has(l.action));

  // 2. Lọc theo keyword label (client-side)
  const displayed = keyword.trim()
    ? withoutNoise.filter(l =>
        (AUDIT_ACTION_LABELS[l.action] ?? l.action)
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : withoutNoise;

  const noiseCount = logs.length - withoutNoise.length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">Lịch sử hoạt động</h2>
              {adminActorId && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  Admin view
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {total > 0 ? `${total.toLocaleString()} hành động được ghi nhận` : "Lịch sử hành động tài khoản"}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
              ${showFilters || activeCount > 0
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
          >
            <Filter size={13} />
            Bộ lọc
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Tìm theo hành động..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:border-blue-300 bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kết quả</label>
                <select
                  value={filters.result}
                  onChange={e => handleFilterChange("result", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-blue-300 bg-gray-50"
                >
                  <option value="">Tất cả</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="FAILURE">Thất bại</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Loại tài nguyên</label>
                <input
                  value={filters.resourceType}
                  onChange={e => handleFilterChange("resourceType", e.target.value)}
                  placeholder="JobPost, Application..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-blue-300 bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Từ ngày</label>
                <input
                  type="date"
                  value={filters.from ? filters.from.slice(0, 10) : ""}
                  onChange={e => handleFilterChange("from", e.target.value ? `${e.target.value}T00:00:00` : "")}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-blue-300 bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Đến ngày</label>
                <input
                  type="date"
                  value={filters.to ? filters.to.slice(0, 10) : ""}
                  onChange={e => handleFilterChange("to", e.target.value ? `${e.target.value}T23:59:59` : "")}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-blue-300 bg-gray-50"
                />
              </div>
            </div>

            {activeCount > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={12} /> Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Noise toggle */}
      {!loading && noiseCount > 0 && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowNoise(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNoise
              ? `Ẩn ${noiseCount} hành động nền`
              : `Hiện ${noiseCount} hành động nền bị ẩn`
            }
          </button>
        </div>
      )}

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {error && (
          <div className="px-6 py-4 text-sm text-red-500 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {!loading && !error && displayed.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Activity size={22} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Chưa có hoạt động nào</p>
            <p className="text-xs text-gray-400">Các hành động của bạn sẽ xuất hiện ở đây</p>
          </div>
        )}

        {!loading && displayed.map(log => <LogRow key={log.id} log={log} />)}

        {!loading && total > 0 && (
          <TablePagination
            currentPage={page + 1}
            totalPages={pages}
            totalItems={total}
            startIndex={page * pageSize + 1}
            endIndex={Math.min((page + 1) * pageSize, total)}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}