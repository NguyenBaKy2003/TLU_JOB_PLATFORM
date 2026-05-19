// D:\TLU_JOB_PLATFORM\frontend\src\presentation\components\company-detail\OverviewTab.tsx

"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Edit3, Trash2, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { CompanyReviewService } from "@/application/services/CompanyReviewService";
import { CompanyReviewRepository } from "@/infrastructure/repositories/CompanyReviewRepository";
import { useAuth } from "@/application/contexts/AuthContext";
import type { CompanyProfile } from "@/domain/models/Company";
import type { CompanyReview, ReviewStats, PageResponse } from "@/domain/models/CompanyReview";
import { ReviewForm } from "./ReviewForm";

const reviewService = new CompanyReviewService(new CompanyReviewRepository());

interface OverviewTabProps {
  company: CompanyProfile;
  reviews?: CompanyReview[]; // Giữ lại để backward compatibility
}

export function OverviewTab({ company, reviews: initialReviews }: OverviewTabProps) {
  const { user, isAuthenticated } = useAuth();

  // State cho reviews
  const [reviews, setReviews] = useState<CompanyReview[]>(initialReviews || []);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<CompanyReview | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load stats và reviews
  useEffect(() => {
    loadStats();
    loadReviews();
  }, [company.id, page]);

  async function loadStats() {
    try {
      const data = await reviewService.getStats(company.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to load review stats:", err);
    }
  }

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.listReviews(company.id, page);
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải đánh giá");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    setDeletingId(reviewId);
    try {
      await reviewService.deleteReview(company.id, reviewId);
      await loadReviews();
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa đánh giá");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(review: CompanyReview) {
    setEditingReview(review);
    setShowForm(true);
  }

  function handleReviewSuccess() {
    loadReviews();
    loadStats();
  }

  const canWriteReview = isAuthenticated && user?.role === "CANDIDATE";

  return (
    <div className="space-y-6">
      {/* Tiêu đề khu vực */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Đánh giá & Nhận xét</h2>
        {canWriteReview && (
          <button
            onClick={() => {
              setEditingReview(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl
              text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <MessageSquare size={16} />
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Stats Overview */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Average Rating */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={`${
                        star <= Math.round(stats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <div>{stats.totalReviews} đánh giá</div>
              </div>
            </div>

            {/* Star Breakdown */}
            <div className="flex-1 space-y-1.5">
              {[
                { star: 5, count: stats.fiveStarCount },
                { star: 4, count: stats.fourStarCount },
                { star: 3, count: stats.threeStarCount },
                { star: 2, count: stats.twoStarCount },
                { star: 1, count: stats.oneStarCount },
              ].map((item) => {
                const percentage = stats.totalReviews > 0
                  ? (item.count / stats.totalReviews) * 100
                  : 0;

                return (
                  <div key={item.star} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-xs font-medium text-gray-600">{item.star}</span>
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Star size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá nào</h3>
          <p className="text-gray-500 mb-4">
            Hãy là người đầu tiên chia sẻ trải nghiệm về công ty này
          </p>
          {canWriteReview && (
            <button
              onClick={() => {
                setEditingReview(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              <MessageSquare size={16} />
              Viết đánh giá đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === review.id}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    i === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          companyId={company.id}
          existingReview={editingReview || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

// ─── Review Card Component ───

interface ReviewCardProps {
  review: CompanyReview;
  currentUserId?: string;
  onEdit: (review: CompanyReview) => void;
  onDelete: (reviewId: string) => void;
  isDeleting: boolean;
}

function ReviewCard({ review, currentUserId, onEdit, onDelete, isDeleting }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = currentUserId && review.reviewerName === currentUserId;
  const isLongContent = review.content.length > 300;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 
            flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {review.reviewerName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{review.reviewerName}</span>
              {review.employed && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full 
                  bg-blue-100 text-blue-700">
                  Nhân viên
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={`${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions — chỉ cho chủ review */}
        {isOwner && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(review)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 
                hover:bg-blue-50 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(review.id)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 
                hover:bg-red-50 transition-colors"
              title="Xóa"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Content with expand/collapse */}
      <div className="relative">
        <p className={`text-sm text-gray-600 whitespace-pre-wrap ${!expanded && isLongContent ? "line-clamp-4" : ""}`}>
          {review.content}
        </p>
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-1 text-sm text-blue-600 hover:text-blue-700 
              font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Xem thêm
              </>
            )}
          </button>
        )}
      </div>

      {/* Pros & Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          {review.pros && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ThumbsUp size={14} className="text-green-500" />
                <span className="text-xs font-medium text-green-700">Điểm tốt</span>
              </div>
              <p className="text-sm text-gray-600">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ThumbsDown size={14} className="text-red-500" />
                <span className="text-xs font-medium text-red-700">Điểm chưa tốt</span>
              </div>
              <p className="text-sm text-gray-600">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Status badge — chỉ hiện cho chủ review */}
      {isOwner && review.status !== "APPROVED" && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              review.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : review.status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {review.status === "PENDING"
              ? "Đang chờ duyệt"
              : review.status === "REJECTED"
                ? `Bị từ chối: ${review.rejectionReason || ""}`
                : review.status}
          </span>
        </div>
      )}
    </div>
  );
}