// src/app/(employer)/employer/jobs/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link                           from "next/link";
import { Plus, Search, Filter, PlusCircle }       from "lucide-react";
import { DashboardLayout }            from "@/presentation/components/layout/profile/DashboardLayout";
import { EmployerJobsTable }          from "@/presentation/components/employer/jobs/EmployerJobsTable";
import { JobStatsRow }                from "@/presentation/components/employer/jobs/JobStatsRow";
import { JobService }                 from "@/application/services/JobService";
import { JobRepository }              from "@/infrastructure/repositories/JobRepository";
import type { JobPost, JobStatus }    from "@/domain/models/Job";
import { extractErrorMessage }        from "@/lib/extractErrorMessage";
import { useToast }                   from "@/presentation/components/ui/toast";
import { SettingsModal }              from "@/presentation/components/settings/SettingsModal";
import { Pagination } from "@/presentation/components/common/Pagination";

// ── Singleton ─────────────────────────────────────────────────────────────────

const service = new JobService(new JobRepository());

const STATUS_TABS: { value: JobStatus | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Tất cả"    },
  { value: "PUBLISHED", label: "Đang tuyển"},
  { value: "DRAFT",     label: "Nháp"      },
  { value: "CLOSED",    label: "Đã đóng"   },
  { value: "EXPIRED",   label: "Hết hạn"   },
];

const PER_PAGE = 10;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="border-b border-gray-50 px-5 py-4 flex gap-4">
        {[120, 80, 100, 80, 80].map((w, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-gray-50 px-5 py-5 flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-gray-100 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
          {[70, 60, 80, 70].map((w, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded self-center" style={{ width: w }} />
          ))}
          <div className="w-8 h-8 bg-gray-100 rounded-lg self-center" />
        </div>
      ))}
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ onConfirm, onCancel, loading }: {
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <SettingsModal title="Xóa bài đăng" onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Hành động không thể hoàn tác</p>
          <p className="text-xs text-red-500 leading-relaxed">
            Bài đăng và tất cả đơn ứng tuyển liên quan sẽ bị xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100
              rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500
              rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors
              flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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

  const [allJobs,    setAllJobs]    = useState<JobPost[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<JobStatus | "ALL">("ALL");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(0);
  const [acting,     setActing]     = useState<string | null>(null); // jobId đang xử lý
  const [deleteId,   setDeleteId]   = useState<string | null>(null); // confirm modal
  const [deleting,   setDeleting]   = useState(false);

  const hasLoaded = useRef(false);

  // ── Load all jobs ─────────────────────────────────────────────────────────

  const loadJobs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Load tất cả (max 200) rồi filter/paginate ở client
      // Production: nên dùng server-side filter + pagination
      const res = await service.getMyJobs(0, 200);
      setAllJobs(res.content);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải danh sách tin tuyển dụng"));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadJobs();
  }, [loadJobs]);

  // ── Filter + paginate ─────────────────────────────────────────────────────

  const filtered = allJobs
    .filter(j => activeTab === "ALL" || j.status === activeTab)
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleTabChange = (tab: JobStatus | "ALL") => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(0);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async (id: string) => {
    setActing(id);
    try {
      await service.publish(id);
      setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status: "PUBLISHED" as JobStatus } : j));
      toast.success("Đã đăng tin", "Bài đăng đang hiển thị với ứng viên.");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setActing(null); }
  }, [toast]);

  const handleClose = useCallback(async (id: string) => {
    setActing(id);
    try {
      await service.close(id);
      setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status: "CLOSED" as JobStatus } : j));
      toast.success("Đã đóng tin", "Bài đăng đã được đóng.");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setActing(null); }
  }, [toast]);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await service.delete(deleteId);
      setAllJobs(prev => prev.filter(j => j.id !== deleteId));
      toast.success("Đã xóa", "Bài đăng đã được xóa.");
      setDeleteId(null);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setDeleting(false); }
  }, [deleteId, toast]);

  // ─────────────────────────────────────────────────────────────────────────

  return (

      <div className="flex flex-col gap-5">

        {/* ── Header: title + create button ──────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div />
          <Link href="/employer/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm
            font-semibold rounded-xl hover:bg-violet-700 transition-colors">
          <PlusCircle size={16} />
          Đăng tin mới
        </Link>
        </div>

          

        {/* ── Stats row ───────────────────────────────────────── */}
        {!loading && <JobStatsRow jobs={allJobs} />}

        {/* ── Filters: tabs + search ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto shrink-0">
            {STATUS_TABS.map(tab => {
              const count = tab.value === "ALL"
                ? allJobs.length
                : allJobs.filter(j => j.status === tab.value).length;
              return (
                <button key={tab.value} onClick={() => handleTabChange(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      activeTab === tab.value
                        ? "bg-gray-100 text-gray-600"
                        : "bg-gray-200 text-gray-500"
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm theo tên tin đăng..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                placeholder:text-gray-300 transition-all" />
          </div>
        </div>

        {/* ── Result count ─────────────────────────────────────── */}
        {!loading && (
          <p className="text-xs text-gray-500 -mt-2">
            Hiển thị <strong className="text-gray-700">{paged.length}</strong> /
            <strong className="text-gray-700"> {filtered.length}</strong> tin đăng
          </p>
        )}

        {/* ── Table ───────────────────────────────────────────── */}
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button onClick={loadJobs}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600
                rounded-xl hover:bg-blue-700 transition-colors">
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
            py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Filter size={24} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {search ? "Không tìm thấy kết quả" : "Chưa có tin tuyển dụng"}
              </p>
              <p className="text-xs text-gray-400">
                {search
                  ? "Thử tìm với từ khóa khác"
                  : "Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên"}
              </p>
            </div>
            {!search && (
              <Link href="/employer/jobs/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white
                  text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                <Plus size={16} /> Đăng tin ngay
              </Link>
            )}
          </div>
        ) : (
          <EmployerJobsTable
            jobs={paged}
            onPublish={handlePublish}
            onClose={handleClose}
            onDelete={id => setDeleteId(id)}
          />
        )}

        {/* ── Pagination ───────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination current={page + 1} total={totalPages}
              onChange={p => setPage(p - 1)} />
          </div>
        )}
 {/* ── Delete confirm modal ─────────────────────────────── */}
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