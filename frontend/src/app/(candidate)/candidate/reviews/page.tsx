// D:\TLU_JOB_PLATFORM\frontend\src\app\(candidate)\candidate\reviews\page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star, Loader2, ChevronLeft, ExternalLink,
  Edit3, Trash2, MessageSquare, Clock, ThumbsUp, ThumbsDown
} from "lucide-react";
import { CompanyReviewService } from "@/application/services/CompanyReviewService";
import { CompanyReviewRepository } from "@/infrastructure/repositories/CompanyReviewRepository";
import type { CompanyReview, ReviewStatus, } from "@/domain/models/CompanyReview";
import { ReviewForm } from "@/presentation/components/company-detail/ReviewForm";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const reviewService = new CompanyReviewService(new CompanyReviewRepository());

const STATUS_TABS: { label: string; value: ReviewStatus | undefined }[] = [
  { label: "Tất cả", value: undefined },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Bị từ chối", value: "REJECTED" },
];

export default function CandidateReviewsPage() {
  const toast = useToast();

  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<CompanyReview | null>(null);

  useEffect(() => {
    loadReviews();
  }, [page, statusFilter]);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await reviewService.getMyReviews(page, 10, statusFilter);
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Không tải được danh sách đánh giá"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    setDeletingId(reviewId);
    try {
      // Cần companyId từ review — lấy từ review hiện tại
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;
      await reviewService.deleteReview(review.companyId, reviewId);
      toast.success("Đã xóa", "Đánh giá đã được xóa");
      await loadReviews();
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Không thể xóa đánh giá"));
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(review: CompanyReview) {
    setEditingReview(review);
    setShowForm(true);
  }

  function handleCreateNew() {
    // Candidate cần chọn công ty trước khi viết review
    // Redirect đến trang companies hoặc mở form chọn company
    toast.info("Thông báo", "Vui lòng vào trang công ty để viết đánh giá");
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingReview(null);
    loadReviews();
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/candidate/profile"
          className="inline-flex items-center gap-1 text-[16px] text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft size={16} />
          Quay lại hồ sơ
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý các đánh giá công ty của bạn</p>
          </div>
          <Link
            href="/companies"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl
              text-[16px] font-medium hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={16} />
            Khám phá công ty
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-[16px] font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Star size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter ? `Không có đánh giá ${statusFilter === "PENDING" ? "chờ duyệt" : statusFilter === "APPROVED" ? "đã duyệt" : "bị từ chối"}` : "Chưa có đánh giá nào"}
          </h3>
          <p className="text-gray-500 mb-4">
            Hãy chia sẻ trải nghiệm của bạn về các công ty
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[16px] font-medium hover:bg-blue-700"
          >
            Khám phá công ty
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`${
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <Link
                      href={`/companies/${review.companyId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      {review.title || "Không có tiêu đề"}
                      <ExternalLink size={12} className="text-gray-400" />
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      review.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : review.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : review.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {review.status === "APPROVED" ? "Đã duyệt"
                      : review.status === "PENDING" ? "Chờ duyệt"
                      : review.status === "REJECTED" ? "Bị từ chối"
                      : review.status}
                  </span>

                  <button
                    onClick={() => handleEdit(review)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Xóa"
                  >
                    {deletingId === review.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[16px] text-gray-600 line-clamp-3">{review.content}</p>

              {/* Pros & Cons */}
              {(review.pros || review.cons) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                  {review.pros && (
                    <div className="flex items-start gap-1.5 flex-1">
                      <ThumbsUp size={12} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 line-clamp-2">{review.pros}</span>
                    </div>
                  )}
                  {review.cons && (
                    <div className="flex items-start gap-1.5 flex-1">
                      <ThumbsDown size={12} className="text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 line-clamp-2">{review.cons}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection reason */}
              {review.status === "REJECTED" && review.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs font-medium text-red-700 mb-0.5">Lý do từ chối:</p>
                  <p className="text-xs text-red-600">{review.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-[16px] text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-[16px] font-medium transition-colors ${
                    i === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-[16px] text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Form Modal */}
      {showForm && editingReview && (
        <ReviewForm
          companyId={editingReview.companyId}
          existingReview={editingReview}
          onClose={() => { setShowForm(false); setEditingReview(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}