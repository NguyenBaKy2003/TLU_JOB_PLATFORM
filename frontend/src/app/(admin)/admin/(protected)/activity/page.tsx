"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, Search, X, CheckCircle2, XCircle, Clock,
  Filter, BarChart2, ChevronDown, RefreshCw, User,
} from "lucide-react";
import { AuditLogService }    from "@/application/services/AuditLogService";
import { AuditLogRepository } from "@/infrastructure/repositories/AuditLogRepository";
import { TableActions, TablePagination }     from "@/presentation/components/common";
import type {
  AuditLog, AdminAuditLogFilters, AuditLogResult,
} from "@/domain/models/AuditLog";
import { AUDIT_ACTION_LABELS } from "@/domain/models/AuditLog";

const service = new AuditLogService(new AuditLogRepository());

// ── Helpers ───────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
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
    <tr className="animate-pulse border-b border-gray-50">
      {[40, 120, 200, 100, 90, 80, 100].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-100 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Stats Card ────────

function StatsCard({
  label, value, sub, color,
}: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Filter state ──────

const EMPTY: Omit<AdminAuditLogFilters, "page" | "size"> = {
  actorId:      "",
  action:       "",
  resourceType: "",
  result:       "",
  from:         "",
  to:           "",
};

// ── Main Page ─────────

export default function AdminAuditLogPage() {
  // table state
  const [logs,     setLogs]     = useState<AuditLog[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // filter state
  const [filters,     setFilters]     = useState(EMPTY);
  const [showFilters, setShowFilters] = useState(false);
  const [keyword,     setKeyword]     = useState("");

  // stats
  const [stats,        setStats]        = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [showStats,    setShowStats]    = useState(true);

  // ── Load logs ──────

  const loadLogs = useCallback(
    async (f: typeof EMPTY, p: number, size: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.adminListAll({ ...f, page: p, size });
        setLogs(res.content);
        setTotal(res.totalElements);
        setPages(res.totalPages);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? e?.message ?? "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => { loadLogs(filters, page, pageSize); }, [filters, page, pageSize, loadLogs]);

  // ── Load stats ─────

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const s = await service.adminGetStats();
      setStats(s);
    } catch {
      // stats are non-critical
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Derived stats ──

  const totalActions  = Object.values(stats).reduce((a, b) => a + b, 0);
  const topAction     = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
  const successCount  = logs.filter(l => l.result === "SUCCESS").length;
  const failureCount  = logs.filter(l => l.result === "FAILURE").length;

  // ── Handlers ───────

  const handleFilter = (key: keyof typeof EMPTY, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(0);
  };

  const handleClear = () => {
    setFilters(EMPTY);
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

  // client-side keyword filter on label
  const displayed = keyword.trim()
    ? logs.filter(l =>
        (AUDIT_ACTION_LABELS[l.action] ?? l.action)
          .toLowerCase()
          .includes(keyword.toLowerCase()) ||
        l.actorId?.toLowerCase().includes(keyword.toLowerCase()) ||
        (l.ipAddress ?? "").includes(keyword),
      )
    : logs;

  // ── Row actions ─────

  const rowActions = [
    {
      key: "viewUser",
      label: "Xem log user này",
      icon: <User className="w-4 h-4" />,
      color: "default" as const,
      onClick: (log: AuditLog) => {
        window.open(`/admin/activity?userId=${log.actorId}`, "_blank");
      },
    },
  ];

  // ── Render ─────────

  return (
    <div className="space-y-4">

      {/* ── Stats bar ────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowStats(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <BarChart2 size={14} />
          {showStats ? "Ẩn thống kê" : "Hiện thống kê"}
          <ChevronDown
            size={12}
            className={`transition-transform ${showStats ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => { loadLogs(filters, page, pageSize); loadStats(); }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw size={13} />
          Làm mới
        </button>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            label="Tổng hành động (7 ngày)"
            value={loadingStats ? "…" : totalActions.toLocaleString()}
            color="text-blue-600"
          />
          <StatsCard
            label="Trang hiện tại – Thành công"
            value={successCount}
            sub={`/ ${logs.length} bản ghi`}
            color="text-emerald-600"
          />
          <StatsCard
            label="Trang hiện tại – Thất bại"
            value={failureCount}
            sub={`/ ${logs.length} bản ghi`}
            color="text-red-500"
          />
          <StatsCard
            label="Hành động phổ biến nhất"
            value={loadingStats ? "…" : (AUDIT_ACTION_LABELS[topAction?.[0]] ?? topAction?.[0] ?? "—")}
            sub={topAction ? `${topAction[1].toLocaleString()} lần` : undefined}
            color="text-violet-600"
          />
        </div>
      )}

      {/* ── Header + filters ─────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-violet-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Audit Log – Toàn hệ thống
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                Admin
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {total > 0 ? `${total.toLocaleString()} bản ghi` : "Lịch sử mọi hành động trên hệ thống"}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
              ${showFilters || activeCount > 0
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
          >
            <Filter size={13} />
            Bộ lọc
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Keyword search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Tìm theo hành động, actor ID, IP..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:border-violet-300 bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Actor ID */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Actor ID (User ID)</label>
                <input
                  value={filters.actorId}
                  onChange={e => handleFilter("actorId", e.target.value)}
                  placeholder="uuid..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
                />
              </div>

              {/* Action */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Action</label>
                <select
                  value={filters.action}
                  onChange={e => handleFilter("action", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
                >
                  <option value="">Tất cả</option>
                  {Object.entries(AUDIT_ACTION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Result */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kết quả</label>
                <select
                  value={filters.result}
                  onChange={e => handleFilter("result", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
                >
                  <option value="">Tất cả</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="FAILURE">Thất bại</option>
                </select>
              </div>

              {/* Resource type */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Loại tài nguyên</label>
                <input
                  value={filters.resourceType}
                  onChange={e => handleFilter("resourceType", e.target.value)}
                  placeholder="JobPost, Application..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
                />
              </div>

              {/* From */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Từ ngày</label>
                <input
                  type="date"
                  value={filters.from ? filters.from.slice(0, 10) : ""}
                  onChange={e =>
                    handleFilter("from", e.target.value ? `${e.target.value}T00:00:00` : "")
                  }
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
                />
              </div>

              {/* To */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Đến ngày</label>
                <input
                  type="date"
                  value={filters.to ? filters.to.slice(0, 10) : ""}
                  onChange={e =>
                    handleFilter("to", e.target.value ? `${e.target.value}T23:59:59` : "")
                  }
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2
                    focus:outline-none focus:border-violet-300 bg-gray-50"
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

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {error && (
          <div className="px-6 py-4 text-sm text-red-500 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Actor ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Tài nguyên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Kết quả</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">IP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && !error && displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Activity size={22} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Không có kết quả</p>
                      <p className="text-xs text-gray-400">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && displayed.map(log => (
                <tr
                  key={log.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.id}</td>

                  {/* Actor */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono text-gray-600 cursor-pointer hover:text-violet-600 transition-colors"
                      title={log.actorId}
                      onClick={() => handleFilter("actorId", log.actorId)}
                    >
                      {log.actorId?.slice(0, 8)}…
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${log.result === "SUCCESS" ? "bg-emerald-50" : "bg-red-50"}`}>
                        {log.result === "SUCCESS"
                          ? <CheckCircle2 size={12} className="text-emerald-500" />
                          : <XCircle      size={12} className="text-red-500" />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                          {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                        </p>
                        {log.errorMessage && (
                          <p className="text-[10px] text-red-400 truncate max-w-[200px]" title={log.errorMessage}>
                            {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Resource */}
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.resourceType
                      ? <span>{log.resourceType}{log.resourceId ? <span className="text-gray-400"> #{log.resourceId.slice(0, 6)}</span> : ""}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>

                  {/* Result */}
                  <td className="px-4 py-3">
                    <ResultBadge result={log.result} />
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(log.occurredAt)}
                    </div>
                  </td>

                  {/* IP */}
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
                    {log.ipAddress ?? "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <TableActions record={log} actions={rowActions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <TablePagination
            currentPage={page + 1}
            totalPages={pages}
            totalItems={total}
            startIndex={page * pageSize + 1}
            endIndex={Math.min((page + 1) * pageSize, total)}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}