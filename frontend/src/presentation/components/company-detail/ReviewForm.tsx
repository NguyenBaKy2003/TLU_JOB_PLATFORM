// D:\TLU_JOB_PLATFORM\frontend\src\presentation\components\company-detail\ReviewForm.tsx

"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { CompanyReviewService } from "@/application/services/CompanyReviewService";
import { CompanyReviewRepository } from "@/infrastructure/repositories/CompanyReviewRepository";
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  CompanyReview,
} from "@/domain/models/CompanyReview";
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
const reviewService = new CompanyReviewService(new CompanyReviewRepository());

interface ReviewFormProps {
  companyId: string;
  existingReview?: CompanyReview;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewForm({
  companyId,
  existingReview,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const isEditMode = !!existingReview;
  const toast = useToast();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [pros, setPros] = useState(existingReview?.pros || "");
  const [cons, setCons] = useState(existingReview?.cons || "");
  const [anonymous, setAnonymous] = useState(existingReview?.anonymous || false);
  const [employed, setEmployed] = useState(existingReview?.employed || false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (rating === 0) {
      toast.warning("Thiếu thông tin", "Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!content.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode && existingReview) {
        const data: UpdateReviewRequest = {
          rating,
          title,
          content,
          pros,
          cons,
        };
        await reviewService.updateReview(companyId, existingReview.id, data);
        toast.success(
          "Đã cập nhật",
          "Đánh giá của bạn đã được cập nhật và đang chờ duyệt lại!"
        );
      } else {
        const data: CreateReviewRequest = {
          rating,
          title,
          content,
          pros,
          cons,
          anonymous,
          employed,
        };
        await reviewService.createReview(companyId, data);
        toast.success(
          "Đã gửi đánh giá",
          "Đánh giá của bạn đã được gửi và đang chờ duyệt!",
          { duration: 4000 }
        );
      }

      onSuccess?.();
      setTimeout(() => onClose(), 600);
    } catch (err) {
      const message = extractErrorMessage(err, "Có lỗi xảy ra, vui lòng thử lại");
      toast.error("Lỗi", message);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ["", "Rất kém", "Kém", "Bình thường", "Tốt", "Xuất sắc"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating Stars */}
          <div>
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-[16px] font-medium text-gray-600">
                  {ratingLabels[rating]}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="VD: Môi trường làm việc tốt"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none 
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-[16px]"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              Nội dung đánh giá *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              required
              placeholder="Chia sẻ trải nghiệm của bạn về công ty..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none 
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-[16px] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{content.length}/2000</p>
          </div>

          {/* Pros */}
          <div>
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              Điểm tốt
            </label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Những điểm bạn thích về công ty..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none 
                focus:border-green-400 focus:ring-2 focus:ring-green-100 text-[16px] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{pros.length}/1000</p>
          </div>

          {/* Cons */}
          <div>
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              Điểm chưa tốt
            </label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Những điểm cần cải thiện..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none 
                focus:border-red-400 focus:ring-2 focus:ring-red-100 text-[16px] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{cons.length}/1000</p>
          </div>

          {/* Options — only for new review */}
          {!isEditMode && (
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 
                    focus:ring-blue-500"
                />
                <span className="text-[16px] text-gray-700">Ẩn danh</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={employed}
                  onChange={(e) => setEmployed(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 
                    focus:ring-blue-500"
                />
                <span className="text-[16px] text-gray-700">
                  Tôi đã/đang làm việc tại công ty này
                </span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[16px] 
                font-medium text-gray-700 hover:bg-gray-50 transition-colors
                disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[16px] 
                font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEditMode ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}