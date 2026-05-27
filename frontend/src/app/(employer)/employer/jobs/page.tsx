"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link                           from "next/link";
import { Filter, PlusCircle, Plus }   from "lucide-react";
import { EmployerJobsCards }          from "@/presentation/components/employer/jobs/EmployerJobsCards";
import { JobStatsRow }                from "@/presentation/components/employer/jobs/JobStatsRow";
import { JobService }                 from "@/application/services/JobService";
import { JobRepository }              from "@/infrastructure/repositories/JobRepository";
import type { JobPost, JobStatus }    from "@/domain/models/Job";
import { extractErrorMessage }        from "@/lib/extractErrorMessage";
import { useToast }                   from "@/presentation/components/ui/toast";
import { SettingsModal }              from "@/presentation/components/settings/SettingsModal";
import { Pagination }                 from "@/presentation/components/common/Pagination";
import {
  EmployerFilterBar,
  type FilterSearchParams,
} from "@/presentation/components/employer/common/EmployerFilterBar";

// ── Singleton ─────────────────────────────────────────────────────────────────

const service = new JobService(new JobRepository());

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: JobStatus | "ALL"; label: string }[] = [
  { value: "ALL",            label: "Tất cả"     },
  { value: "PUBLISHED",      label: "Đang tuyển" },
  { value: "PENDING_REVIEW", label: "Chờ duyệt"  },
  { value: "REJECTED",       label: "Bị từ chối" },
  { value: "DRAFT",          label: "Nháp"       },
  { value: "CLOSED",         label: "Đã đóng"    },
  { value: "EXPIRED",        label: "Hết hạn"    },
];

const PER_PAGE = 9;

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppliedFilters {
  status:   JobStatus | "ALL";
  search:   string;
  dateFrom: string;
  dateTo:   string;
  page:     number;
}

const DEFAULT_FILTERS: AppliedFilters = {
  status:   "ALL",
  search:   "",
  dateFrom: "",
  dateTo:   "",
  page:     0,
};

/**
 * Trả về từ service.getMyJobCounts()
 * VD: { total: 42, PUBLISHED: 20, DRAFT: 10, CLOSED: 5, EXPIRED: 7 }
 */
type StatusCounts = Partial<Record<JobStatus, number>> & { total: number };

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="border-t border-gray-50 pt-3 flex gap-4">
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-12" />
            <div className="h-3 bg-gray-100 rounded w-14 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  onConfirm, onCancel, loading,
}: {
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <SettingsModal title="Xóa bài đăng" onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-[16px] font-semibold text-red-600 mb-1">⚠️ Hành động không thể hoàn tác</p>
          <p className="text-xs text-red-500 leading-relaxed">
            Bài đăng và tất cả đơn ứng tuyển liên quan sẽ bị xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 text-[16px] font-medium text-gray-600 bg-gray-100
              rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 text-[16px] font-medium text-white bg-red-500
              rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors
              flex items-center justify-center gap-2">
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Xóa bài đăng
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerJobsPage() {
  const toast = useToast();

  // ── Paginated job list ────────────────────────────────────────────────────
  const [jobs,          setJobs]          = useState<JobPost[]>([]);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  // ── Lightweight counts (replaces the 200-item load) ───────────────────────
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const countsRef = useRef(false);

  // ── Applied filters ───────────────────────────────────────────────────────
  const [filters, setFilters] = useState<AppliedFilters>(DEFAULT_FILTERS);

  // ── Action state ──────────────────────────────────────────────────────────
  const [acting,   setActing]   = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load counts once on mount ─────────────────────────────────────────────
  // service.getMyJobCounts() → endpoint nhẹ, chỉ trả về số lượng theo status
  // VD: GET /employer/jobs/counts → { total, PUBLISHED, DRAFT, CLOSED, ... }

  const loadCounts = useCallback(async () => {
    try {
      const counts = await service.getMyJobCounts();
      setStatusCounts(counts);
    } catch {
      // non-critical: tabs và stats row vẫn render, chỉ thiếu số lượng
    }
  }, []);

  useEffect(() => {
    if (countsRef.current) return;
    countsRef.current = true;
    loadCounts();
  }, [loadCounts]);

  // ── Load paginated jobs (9 items) ─────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getMyJobs(filters.page, PER_PAGE, {
          search:   filters.search   || undefined,
          status:   filters.status !== "ALL" ? filters.status : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo:   filters.dateTo   || undefined,
        });
        setJobs(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements ?? res.content.length);
      } catch (e) {
        setError(extractErrorMessage(e, "Không thể tải danh sách tin tuyển dụng"));
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  // ── Optimistic count helpers ──────────────────────────────────────────────

  const decrementCount = useCallback((status: JobStatus) => {
    setStatusCounts(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        total:    Math.max(0, prev.total - 1),
        [status]: Math.max(0, (prev[status] ?? 0) - 1),
      };
    });
  }, []);

  const swapCount = useCallback((from: JobStatus, to: JobStatus) => {
    setStatusCounts(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [from]: Math.max(0, (prev[from] ?? 0) - 1),
        [to]:   (prev[to] ?? 0) + 1,
      };
    });
  }, []);

  // ── Filter handlers ───────────────────────────────────────────────────────

  const handleStatusChange = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status: status as JobStatus | "ALL", page: 0 }));
  }, []);

  const handleSearch = useCallback((params: FilterSearchParams) => {
    setFilters(prev => ({
      ...prev,
      search:   params.search,
      dateFrom: params.dateFrom,
      dateTo:   params.dateTo,
      page:     0,
    }));
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setFilters(prev => ({ ...prev, page: p - 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Job actions ───────────────────────────────────────────────────────────

  const updateJobStatus = (id: string, status: JobStatus) =>
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));

  const handleSubmit = useCallback(async (id: string) => {
    setActing(id);
    try {
      const result = await service.submit(id);
      const { review } = result;

      if (review.decision === "APPROVED") {
        updateJobStatus(id, "PUBLISHED");
        swapCount("DRAFT", "PUBLISHED");
        toast.success("Đã duyệt", `Điểm chất lượng: ${review.qualityScore}/100.`);
      } else {
        updateJobStatus(id, "REJECTED");
        swapCount("DRAFT", "REJECTED");
        toast.error(
          "Bị từ chối",
          review.overallFeedback ?? "Xem chi tiết trong trang chỉnh sửa.",
        );
      }
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setActing(null);
    }
  }, [swapCount, toast]);

  const handleClose = useCallback(async (id: string) => {
    setActing(id);
    try {
      const job = jobs.find(j => j.id === id);
      await service.close(id);
      updateJobStatus(id, "CLOSED");
      if (job) swapCount(job.status, "CLOSED");
      toast.success("Đã đóng tin", "Bài đăng đã được đóng.");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setActing(null);
    }
  }, [jobs, swapCount, toast]);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const job = jobs.find(j => j.id === deleteId);
      await service.delete(deleteId);
      setJobs(prev => prev.filter(j => j.id !== deleteId));
      if (job) decrementCount(job.status);
      toast.success("Đã xóa", "Bài đăng đã được xóa.");
      setDeleteId(null);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }, [deleteId, jobs, decrementCount, toast]);

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExportPdf = useCallback(() => {
    toast.success("Đang xuất PDF", "File sẽ được tải về sau vài giây.");
  }, [toast]);

  const handleExportExcel = useCallback(() => {
    toast.success("Đang xuất Excel", "File sẽ được tải về sau vài giây.");
  }, [toast]);

  // ── Derived: status tab badges ────────────────────────────────────────────

  const statusTabsWithCount = STATUS_TABS.map(tab => ({
    ...tab,
    count: statusCounts
      ? tab.value === "ALL"
        ? statusCounts.total
        : (statusCounts[tab.value as JobStatus] ?? 0)
      : undefined,
  }));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div />
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white
            text-[16px] font-semibold rounded-xl hover:bg-violet-700 transition-colors"
        >
          <PlusCircle size={16} /> Đăng tin mới
        </Link>
      </div>

      {/* Stats — truyền counts thay vì raw jobs[] */}
      {statusCounts && <JobStatsRow counts={statusCounts} />}

      {/* Filter bar */}
      <EmployerFilterBar
        statusTabs={statusTabsWithCount}
        activeStatus={filters.status}
        onStatusChange={handleStatusChange}
        searchPlaceholder="Tìm theo tên tin đăng..."
        showDateRange
        onSearch={handleSearch}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        loading={loading}
      />

      {/* Result count */}
      {!loading && !error && (
        <p className="text-xs text-gray-500 -mt-1">
          Hiển thị{" "}
          <strong className="text-gray-700">{jobs.length}</strong> /{" "}
          <strong className="text-gray-700">{totalElements}</strong> tin đăng
        </p>
      )}

      {/* Content */}
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-[16px] text-red-500 mb-3">{error}</p>
          <button
            onClick={() => setFilters(f => ({ ...f }))}
            className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600
              rounded-xl hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
          py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Filter size={24} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-medium text-gray-700 mb-1">
              {filters.search || filters.dateFrom || filters.dateTo
                ? "Không tìm thấy kết quả"
                : "Chưa có tin tuyển dụng"}
            </p>
            <p className="text-xs text-gray-400">
              {filters.search || filters.dateFrom || filters.dateTo
                ? "Thử tìm với từ khóa hoặc khoảng thời gian khác"
                : "Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên"}
            </p>
          </div>
          {!filters.search && !filters.dateFrom && (
            <Link
              href="/employer/jobs/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white
                text-[16px] font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Đăng tin ngay
            </Link>
          )}
        </div>
      ) : (
        <EmployerJobsCards
          jobs={jobs}
          actingId={acting}
          onSubmit={handleSubmit}
          onClose={handleClose}
          onDelete={id => setDeleteId(id)}
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={filters.page + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}

    </div>
  );
}