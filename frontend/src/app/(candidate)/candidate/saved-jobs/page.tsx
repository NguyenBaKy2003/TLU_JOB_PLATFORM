// src/app/(candidate)/saved-jobs/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Eye, Building2, MapPin, Clock, Trash2,
  Loader2, BookmarkX,
} from "lucide-react";
import { JobService } from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";
import type { JobPost, MySavedJobsResponse } from "@/domain/models/Job";
import { JOB_TYPE_LABELS } from "@/domain/models/Job";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";
import {
  CandidateFilterBar,
  type CandidateFilterParams,
} from "@/presentation/components/candidate/CandidateFilterBar";
import { Pagination } from "@/presentation/components/common/Pagination";

const service = new JobService(new JobRepository());
const PAGE_SIZE_OPTIONS = [5, 10, 20];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="h-24 bg-gray-100 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
        <BookmarkX size={32} strokeWidth={1.2} className="text-gray-300" />
      </div>
      <div>
        <p className="text-base font-medium text-gray-500">
          {filtered ? "Không tìm thấy kết quả" : "Chưa có việc làm nào được lưu"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {filtered
            ? "Thử thay đổi bộ lọc để xem thêm kết quả"
            : "Hãy khám phá các cơ hội việc làm và lưu lại những vị trí bạn quan tâm"}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/jobs"
          className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium
            rounded-xl hover:bg-blue-700 transition-colors"
        >
          Khám phá việc làm
        </Link>
      )}
    </div>
  );
}

// ── Job card ──────────────────────────────────────────────────────────────────

function JobCard({
  job, onRemove, isRemoving,
}: {
  job: JobPost;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const nearDeadline =
    job.deadline &&
    new Date(job.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3
      hover:border-blue-200 hover:shadow-sm transition-all duration-200">

      {/* Top: logo + info + actions */}
      <div className="flex gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100
          shrink-0 flex items-center justify-center">
          {job.companyLogoUrl
            ? <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
            : <Building2 size={20} className="text-gray-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600
                transition-colors line-clamp-2 leading-snug"
            >
              {job.title}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <Link
                href={`/jobs/${job.id}`}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                  rounded-lg transition-colors"
                title="Xem chi tiết"
              >
                <Eye size={14} />
              </Link>
              <button
                onClick={() => onRemove(job.id)}
                disabled={isRemoving}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                  rounded-lg transition-colors disabled:opacity-50"
                title="Bỏ lưu"
              >
                {isRemoving
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-0.5 truncate">{job.companyName}</p>
        </div>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.workLocationCity && (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50
            px-2 py-0.5 rounded-full">
            <MapPin size={10} /> {job.workLocationCity}
          </span>
        )}
        {job.jobType && (
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
            {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
          </span>
        )}
        {job.category && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {job.category}
          </span>
        )}
        {job.salaryDisplay && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50
            px-2 py-0.5 rounded-full">
            {job.salaryDisplay}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={10} />
          {daysAgo <= 0 ? "Hôm nay" : daysAgo === 1 ? "1 ngày trước" : `${daysAgo} ngày trước`}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          job.status === "PUBLISHED" ? "bg-blue-50 text-blue-600"
          : job.status === "CLOSED"  ? "bg-gray-50 text-gray-500"
          : "bg-yellow-50 text-yellow-600"
        }`}>
          {job.status === "PUBLISHED" ? "Đang tuyển"
           : job.status === "CLOSED"  ? "Đã đóng"
           : "Hết hạn"}
        </span>
      </div>

      {/* Deadline warning */}
      {nearDeadline && (
        <div className="flex items-center gap-1.5 text-xs text-orange-600
          bg-orange-50 rounded-lg px-3 py-1.5">
          <Clock size={10} />
          Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SavedJobsPage() {
  const toast = useToast();

  const [data, setData]             = useState<MySavedJobsResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Filter state
  const [keyword,      setKeyword]      = useState("");
  const [savedAtFrom,  setSavedAtFrom]  = useState("");
  const [savedAtTo,    setSavedAtTo]    = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  // Pagination — 0-based internally, convert ↔ Pagination component (1-based)
  const [page,     setPage]     = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (
    p: number, ps: number,
    kw: string, from: string, to: string, cat: string,
  ) => {
    try {
      setLoading(true);
      const result = await service.listSaved(p, ps, {
        keyword:     kw   || undefined,
        savedAtFrom: from || undefined,
        savedAtTo:   to   || undefined,
        category:    cat !== "ALL" ? cat : undefined,
        sortDir:     "desc",
      });
      setData(result);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(0, pageSize, "", "", "", "ALL");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilter = useCallback((params: CandidateFilterParams) => {
    setKeyword(params.keyword);
    setSavedAtFrom(params.appliedAtFrom);
    setSavedAtTo(params.appliedAtTo);
    setPage(0);
    fetchData(0, pageSize, params.keyword, params.appliedAtFrom, params.appliedAtTo, activeStatus);
  }, [fetchData, pageSize, activeStatus]);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveStatus(cat);
    setPage(0);
    fetchData(0, pageSize, keyword, savedAtFrom, savedAtTo, cat);
  }, [fetchData, pageSize, keyword, savedAtFrom, savedAtTo]);

  // Pagination component là 1-based → convert sang 0-based khi gọi API
  const handlePageChange = useCallback((oneBased: number) => {
    const zeroBased = oneBased - 1;
    setPage(zeroBased);
    fetchData(zeroBased, pageSize, keyword, savedAtFrom, savedAtTo, activeStatus);
  }, [fetchData, pageSize, keyword, savedAtFrom, savedAtTo, activeStatus]);

  const handlePageSizeChange = useCallback((ps: number) => {
    setPageSize(ps);
    setPage(0);
    fetchData(0, ps, keyword, savedAtFrom, savedAtTo, activeStatus);
  }, [fetchData, keyword, savedAtFrom, savedAtTo, activeStatus]);

  const handleRemove = useCallback(async (jobId: string) => {
    try {
      setRemovingId(jobId);
      await service.toggleSave(jobId);
      toast.success("Đã bỏ lưu", "Bài đăng đã được xóa khỏi danh sách.");
      const isLastOnPage = (data?.jobs.content.length ?? 0) === 1 && page > 0;
      const targetPage = isLastOnPage ? page - 1 : page;
      if (isLastOnPage) setPage(targetPage);
      fetchData(targetPage, pageSize, keyword, savedAtFrom, savedAtTo, activeStatus);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setRemovingId(null);
    }
  }, [data, page, pageSize, keyword, savedAtFrom, savedAtTo, activeStatus, fetchData, toast]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const jobs           = data?.jobs.content ?? [];
  const totalPages     = data?.jobs.totalPages ?? 0;
  const totalSaved     = data?.totalSaved ?? 0;
  const categoryCounts = data?.categoryCounts ?? {};
  const hasFilter      = !!(keyword || savedAtFrom || savedAtTo || activeStatus !== "ALL");

  const categoryTabs = [
    { value: "ALL", label: "Tất cả", count: totalSaved },
    ...Object.entries(categoryCounts).map(([cat, count]) => ({
      value: cat,
      label: cat,
      count: Number(count),
    })),
  ];

  if (loading && !data) return <PageSkeleton />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Việc đã lưu</h1>
            <p className="text-sm text-gray-400 mt-1">
              {totalSaved > 0
                ? `${totalSaved} việc làm đã lưu`
                : "Danh sách các công việc bạn đã đánh dấu"}
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
              text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Eye size={15} /> Khám phá thêm
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-1.5">
        <CandidateFilterBar
          statusTabs={categoryTabs}
          activeStatus={activeStatus}
          onStatusChange={handleCategoryChange}
          searchPlaceholder="Tìm theo tên việc làm, danh mục..."
          showDateRange
          onFilter={handleFilter}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </div>

      {/* Grid */}
      {jobs.length === 0 ? (
        <EmptyState filtered={hasFilter} />
      ) : (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity duration-200 ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onRemove={handleRemove}
                isRemoving={removingId === job.id}
              />
            ))}
          </div>

          {/* Pagination — 1-based, convert từ 0-based page state */}
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
            showFirstLast
            className="mt-2"
          />
        </>
      )}
    </>
  );
}