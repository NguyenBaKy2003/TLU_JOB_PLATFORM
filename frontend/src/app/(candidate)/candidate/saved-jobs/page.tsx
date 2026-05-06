// src/app/(candidate)/saved-jobs/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark, MapPin, Clock, Briefcase,
  Building2, Trash2, Eye, Filter,
  ChevronLeft, ChevronRight, Loader2,
  BookmarkX,
} from "lucide-react";
import { JobService } from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";
import type { JobPost } from "@/domain/models/Job";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";
import { JOB_TYPE_LABELS } from "@/domain/models/Job";

const service = new JobService(new JobRepository());

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 flex flex-col items-center gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
        <BookmarkX size={32} strokeWidth={1.2} className="text-gray-300" />
      </div>
      <div>
        <p className="text-base font-medium text-gray-500">Chưa có việc làm nào được lưu</p>
        <p className="text-sm text-gray-400 mt-1">
          Hãy khám phá các cơ hội việc làm và lưu lại những vị trí bạn quan tâm
        </p>
      </div>
      <Link
        href="/jobs"
        className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
          hover:bg-blue-700 transition-colors"
      >
        Khám phá việc làm
      </Link>
    </div>
  );
}

interface JobCardProps {
  job: JobPost;
  onRemove: (jobId: string) => void;
  isRemoving: boolean;
}

function JobCard({ job, onRemove, isRemoving }: JobCardProps) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5
      hover:border-blue-200 hover:shadow-sm transition-all duration-200">
      <div className="flex gap-4">
        {/* Company logo */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100
          shrink-0 flex items-center justify-center">
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 size={22} className="text-gray-400" />
          )}
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/jobs/${job.slug}`}
                className="text-base font-semibold text-gray-900 hover:text-blue-600
                  transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/jobs/${job.id}`}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                  rounded-lg transition-colors"
                title="Xem chi tiết"
              >
                <Eye size={16} />
              </Link>
              <button
                onClick={() => onRemove(job.id)}
                disabled={isRemoving}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                  rounded-lg transition-colors disabled:opacity-50"
                title="Bỏ lưu"
              >
                {isRemoving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Job meta */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {job.workLocationCity && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} />
                {job.workLocationCity}
              </span>
            )}
            {job.jobType && (
              <span className="text-xs text-gray-500">
                {JOB_TYPE_LABELS[job.jobType] || job.jobType}
              </span>
            )}
            {job.salaryDisplay && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50
                px-2 py-0.5 rounded-full">
                {job.salaryDisplay}
              </span>
            )}
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} />
              {daysAgo <= 0
                ? "Hôm nay"
                : daysAgo === 1
                ? "1 ngày trước"
                : `${daysAgo} ngày trước`}
            </div>

            {/* Status */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              job.status === "PUBLISHED"
                ? "bg-blue-50 text-blue-600"
                : job.status === "CLOSED"
                ? "bg-gray-50 text-gray-500"
                : "bg-yellow-50 text-yellow-600"
            }`}>
              {job.status === "PUBLISHED"
                ? "Đang tuyển"
                : job.status === "CLOSED"
                ? "Đã đóng"
                : "Hết hạn"}
            </span>
          </div>
        </div>
      </div>

      {/* Deadline warning */}
      {job.deadline && new Date(job.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50
          rounded-lg px-3 py-1.5">
          <Clock size={11} />
          Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
        </div>
      )}
    </div>
  );
}

export default function SavedJobsPage() {
  const toast = useToast();

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Fetch saved jobs
  const fetchSavedJobs = async (pageNum: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.listSaved(pageNum, pageSize);
      setJobs(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.page);
    } catch (e) {
      setError(extractErrorMessage(e));
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle remove (toggle save)
  const handleRemove = async (jobId: string) => {
    try {
      setRemovingJobId(jobId);
      await service.toggleSave(jobId);
      
      // Remove job from list
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setTotalElements(prev => prev - 1);
      
      toast.success("Đã bỏ lưu", "Bài đăng đã được xóa khỏi danh sách đã lưu.");
      
      // If last item on current page and not first page, go to previous page
      if (jobs.length === 1 && page > 0) {
        fetchSavedJobs(page - 1);
      }
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setRemovingJobId(null);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchSavedJobs(newPage);
    }
  };

  if (loading && jobs.length === 0) return <PageSkeleton />;

  if (error && jobs.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => fetchSavedJobs()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50
            rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Việc đã lưu</h1>
            <p className="text-sm text-gray-400 mt-1">
              {totalElements > 0
                ? `${totalElements} việc làm đã lưu`
                : "Danh sách các công việc bạn đã đánh dấu"}
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600
              bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Eye size={15} />
            Khám phá thêm
          </Link>
        </div>
      </div>

      {/* Job list */}
      {jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onRemove={handleRemove}
                isRemoving={removingJobId === job.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600
                  hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed
                  transition-colors"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      i === page
                        ? "bg-blue-600 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600
                  hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed
                  transition-colors"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}