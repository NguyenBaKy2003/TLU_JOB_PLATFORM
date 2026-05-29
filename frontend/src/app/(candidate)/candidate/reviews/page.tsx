
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star, Loader2, ChevronLeft, ExternalLink, Edit3, Trash2,
  MessageSquare, Clock, ThumbsUp, ThumbsDown,
  Building2, MapPin, EyeOff, Briefcase,
} from "lucide-react";
import { CompanyReviewService }   from "@/application/services/CompanyReviewService";
import { CompanyReviewRepository } from "@/infrastructure/repositories/CompanyReviewRepository";
import type { CompanyReview, ReviewStatus } from "@/domain/models/CompanyReview";
import { ReviewForm }             from "@/presentation/components/company-detail/ReviewForm";
import { CandidateFilterBar }     from "@/presentation/components/candidate/CandidateFilterBar";
import type { CandidateFilterParams } from "@/presentation/components/candidate/CandidateFilterBar";
import { Pagination }             from "@/presentation/components/common";
import { LoadingSpinner }         from "@/presentation/components/common";
import { useToast }               from "@/presentation/components/ui/toast";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";

const reviewService = new CompanyReviewService(new CompanyReviewRepository());

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

// Tabs khớp với ReviewStatus + "ALL"
const STATUS_TABS: { value: ReviewStatus | "ALL"; label: string }[] = [
  { value: "ALL",      label: "Tất cả"     },
  { value: "PENDING",  label: "Chờ duyệt"  },
  { value: "APPROVED", label: "Đã duyệt"   },
  { value: "REJECTED", label: "Bị từ chối" },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12}
          className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; cls: string }> = {
    APPROVED: { label: "Đã duyệt",   cls: "bg-green-100 text-green-700"   },
    PENDING:  { label: "Chờ duyệt",  cls: "bg-yellow-100 text-yellow-700" },
    REJECTED: { label: "Bị từ chối", cls: "bg-red-100 text-red-700"       },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [err, setErr] = useState(false);
  if (logoUrl && !err) {
    return (
      <Image src={logoUrl} alt={name} width={44} height={44}
        onError={() => setErr(true)}
        className="w-11 h-11 rounded-xl border border-gray-100 object-contain bg-white flex-shrink-0" />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center
      justify-center flex-shrink-0 text-sm font-semibold text-gray-500">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReviewCard({ review, onEdit, onDelete, deleting }: {
  review: CompanyReview;
  onEdit: (r: CompanyReview) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const fmt = (s: string) => {
    const diff = Math.floor((Date.now() - new Date(s).getTime()) / 86_400_000);
    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "Hôm qua";
    if (diff < 7)   return `${diff} ngày trước`;
    return new Date(s).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4
      hover:border-blue-200 hover:shadow-sm transition-all duration-200 flex flex-col gap-3">

      {/* Company row */}
      <div className="flex items-center gap-3">
        <CompanyLogo name={review.companyName ?? "?"} logoUrl={review.companyLogoUrl} />
        <div className="flex-1 min-w-0">
          <Link href={`/companies/${ review.companyId}`}
            className="font-semibold text-sm text-gray-900 hover:text-blue-600
              flex items-center gap-1 w-fit truncate">
            {review.companyName ?? "Công ty"}
            <ExternalLink size={10} className="text-gray-400 flex-shrink-0" />
          </Link>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {review.companyIndustry && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Building2 size={10} /> {review.companyIndustry}
              </span>
            )}
            {review.companyLocation && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin size={10} /> {review.companyLocation}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={review.status} />
      </div>

      {/* Review content */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1 min-w-0">
          <StarRow rating={review.rating} />
          <p className="font-medium text-sm text-gray-900 leading-snug line-clamp-1">
            {review.title || "Không có tiêu đề"}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={9} /> {fmt(review.createdAt)}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(review)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Chỉnh sửa">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(review.id)} disabled={deleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Xóa">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{review.content}</p>

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div className="flex gap-3 pt-2.5 border-t border-gray-50">
          {review.pros && (
            <div className="flex gap-1.5 flex-1 min-w-0">
              <ThumbsUp size={11} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 line-clamp-2">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="flex gap-1.5 flex-1 min-w-0">
              <ThumbsDown size={11} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 line-clamp-2">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Chips */}
      {(review.anonymous || review.employed) && (
        <div className="flex gap-1.5 flex-wrap">
          {review.anonymous && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <EyeOff size={9} /> Ẩn danh
            </span>
          )}
          {review.employed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              <Briefcase size={9} /> Đã/đang làm việc
            </span>
          )}
        </div>
      )}

      {/* Rejection reason */}
      {review.status === "REJECTED" && review.rejectionReason && (
        <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-[10px] font-semibold text-red-700 mb-0.5">Lý do từ chối</p>
          <p className="text-[11px] text-red-600">{review.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-100 rounded" />)}
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-8 bg-gray-100 rounded" />
      <div className="h-px bg-gray-50" />
      <div className="flex gap-3">
        <div className="h-3 bg-gray-100 rounded flex-1" />
        <div className="h-3 bg-gray-100 rounded flex-1" />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CandidateReviewsPage() {
  const toast = useToast();

  const [reviews,      setReviews]      = useState<CompanyReview[]>([]);
  const [statusCounts, setStatusCounts] = useState<Partial<Record<ReviewStatus | "ALL", number>>>({});
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);

  const [initialLoad,  setInitialLoad]  = useState(true);
  const [loading,      setLoading]      = useState(true);

  const [activeTab,    setActiveTab]    = useState<ReviewStatus | "ALL">("ALL");
  const [filterParams, setFilterParams] = useState<CandidateFilterParams>({
    keyword: "", appliedAtFrom: "", appliedAtTo: "",
  });
  const [page,         setPage]         = useState(0);
  const [pageSize,     setPageSize]     = useState(DEFAULT_PAGE_SIZE);
  const [editingReview, setEditingReview] = useState<CompanyReview | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);

  const load = useCallback(async () => {
  setLoading(true);
  try {
    const data = await reviewService.getMyReviews({
      page,
      size:          pageSize,
      status:        activeTab === "ALL" ? undefined : activeTab,
      keyword:       filterParams.keyword       || undefined,
      createdAtFrom: filterParams.appliedAtFrom || undefined,
      createdAtTo:   filterParams.appliedAtTo   || undefined,
    });

    setReviews(data.reviews.content);
    setTotalPages(data.reviews.totalPages);
    setTotal(data.total);

    const counts: Partial<Record<ReviewStatus | "ALL", number>> = {
      ...data.statusCounts,
      ALL: data.total,
    };
    setStatusCounts(counts);
  } catch (err) {
    toast.error("Lỗi", extractErrorMessage(err, "Không tải được danh sách đánh giá"));
  } finally {
    setLoading(false);
    setInitialLoad(false);
  }
}, [page, pageSize, activeTab, filterParams]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(reviewId: string) {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    setDeletingId(reviewId);
    try {
      await reviewService.deleteReview(review.companyId, reviewId);
      toast.success("Đã xóa", "Đánh giá đã được xóa");
      await load();
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Không thể xóa đánh giá"));
    } finally {
      setDeletingId(null);
    }
  }

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: statusCounts[t.value] ?? 0,
  }));

  const hasActiveFilter = !!(
    filterParams.keyword || filterParams.appliedAtFrom || filterParams.appliedAtTo
  );

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <Link href="/candidate/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={15} /> Quay lại hồ sơ
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đánh giá của tôi</h1>
            <p className="text-gray-500 mt-1 text-sm">Quản lý các đánh giá công ty của bạn</p>
          </div>
          <Link href="/companies"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl
              text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0">
            <MessageSquare size={14} /> Khám phá công ty
          </Link>
        </div>
      </div>

      {/* Filter bar — giống ApplicationsPage */}
      <CandidateFilterBar
        statusTabs={tabs}
        activeStatus={activeTab}
        onStatusChange={(v) => { setActiveTab(v as ReviewStatus | "ALL"); setPage(0); }}
        searchPlaceholder="Tìm theo tên công ty, tiêu đề..."
        showDateRange
        onFilter={(p) => { setFilterParams(p); setPage(0); }}
        loading={loading}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        pageSize={pageSize}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
      />

      {/* Result count */}
      <div className="min-h-[18px] -mt-1">
        {!loading && (
          <p className="text-xs text-gray-500">
            <strong className="text-gray-800">{total}</strong> đánh giá
          </p>
        )}
      </div>

      {/* Content */}
      {initialLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => <ReviewCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className={`relative transition-opacity duration-150 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}>
          {loading && (
            <div className="absolute -top-8 right-0 z-10 flex items-center gap-1.5 text-xs text-gray-400">
              <LoadingSpinner size="sm" variant="secondary" /> Đang tải...
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <Star size={36} strokeWidth={1.2} />
              <p className="text-sm">
                {hasActiveFilter ? "Không có đánh giá phù hợp với bộ lọc" : "Chưa có đánh giá nào"}
              </p>
              {!hasActiveFilter && (
                <Link href="/companies" className="text-sm text-blue-600 hover:underline">
                  Khám phá công ty →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={setEditingReview}
                  onDelete={handleDelete}
                  deleting={deletingId === review.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="min-h-[40px] flex justify-center">
        {!initialLoad && totalPages > 1 && (
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={p => setPage(p - 1)}
          />
        )}
      </div>

      {/* Edit modal */}
      {editingReview && (
        <ReviewForm
          companyId={editingReview.companyId}
          companyName={editingReview.companyName}
          companyLogoUrl={editingReview.companyLogoUrl}
          existingReview={editingReview}
          onClose={() => setEditingReview(null)}
          onSuccess={() => { setEditingReview(null); load(); }}
        />
      )}
    </div>
  );
}