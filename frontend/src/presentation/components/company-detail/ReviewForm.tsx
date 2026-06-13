// D:\TLU_JOB_PLATFORM\frontend\src\presentation\components\company-detail\ReviewForm.tsx

"use client";

import { useState } from "react";
import { Star, X, Loader2, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { CompanyReviewService } from "@/application/services/CompanyReviewService";
import { CompanyReviewRepository } from "@/infrastructure/repositories/CompanyReviewRepository";
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  CompanyReview,
} from "@/domain/models/CompanyReview";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const reviewService = new CompanyReviewService(new CompanyReviewRepository());

// ─── Rating config ──

const RATING_LABELS = ["", "Rất kém", "Kém", "Bình thường", "Tốt", "Xuất sắc"];
const RATING_COLORS = [
  "",
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-blue-500",
  "text-green-600",
];
const RATING_FILL_COLORS = [
  "",
  "fill-red-500 text-red-500",
  "fill-orange-500 text-orange-500",
  "fill-yellow-500 text-yellow-500",
  "fill-blue-500 text-blue-500",
  "fill-green-500 text-green-500",
];

// ─── Sub-components ─

function CharCount({ value, max }: { value: string; max: number }) {
  const ratio = value.length / max;
  return (
    <p className={`text-xs mt-1 text-right tabular-nums ${
      ratio > 0.9 ? "text-orange-500" : "text-gray-400"
    }`}>
      {value.length}/{max}
    </p>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ─── Props ──────────

interface ReviewFormProps {
  companyId: string;
  companyName?: string;
  companyLogoUrl?: string;
  existingReview?: CompanyReview;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Main component ──

export function ReviewForm({
  companyId,
  companyName,
  companyLogoUrl,
  existingReview,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const isEdit = !!existingReview;
  const toast  = useToast();

  const [rating,     setRating]     = useState(existingReview?.rating   ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title,      setTitle]      = useState(existingReview?.title    ?? "");
  const [content,    setContent]    = useState(existingReview?.content  ?? "");
  const [pros,       setPros]       = useState(existingReview?.pros     ?? "");
  const [cons,       setCons]       = useState(existingReview?.cons     ?? "");
  const [anonymous,  setAnonymous]  = useState(existingReview?.anonymous ?? false);
  const [employed,   setEmployed]   = useState(existingReview?.employed  ?? false);
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      if (isEdit && existingReview) {
        const req: UpdateReviewRequest = { rating, title, content, pros, cons };
        await reviewService.updateReview(companyId, existingReview.id, req);
        toast.success("Đã cập nhật", "Đánh giá đang chờ duyệt lại!");
      } else {
        const req: CreateReviewRequest = { rating, title, content, pros, cons, anonymous, employed };
        await reviewService.createReview(companyId, req);
        toast.success("Đã gửi đánh giá", "Đánh giá của bạn đang chờ duyệt!", { duration: 4000 });
      }
      onSuccess?.();
      setTimeout(onClose, 500);
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Có lỗi xảy ra, vui lòng thử lại"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto
        border border-gray-200 shadow-xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Company logo/icon */}
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt={companyName}
                className="w-9 h-9 rounded-xl border border-gray-100 object-contain bg-white flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center
                justify-center flex-shrink-0">
                <Star size={16} className="text-blue-500" />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {isEdit ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
              </h2>
              {companyName && (
                <p className="text-xs text-gray-500 mt-0.5">{companyName}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
              text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Rating */}
          <div>
            <FieldLabel required>Đánh giá của bạn</FieldLabel>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star} sao`}
                >
                  <Star
                    size={30}
                    className={`transition-colors ${
                      star <= displayRating
                        ? RATING_FILL_COLORS[displayRating] || "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className={`ml-2 text-sm font-medium ${RATING_COLORS[displayRating]}`}>
                  {RATING_LABELS[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <FieldLabel>Tiêu đề</FieldLabel>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="VD: Môi trường làm việc năng động"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                bg-white text-gray-900 placeholder:text-gray-400 transition-colors"
            />
            <CharCount value={title} max={200} />
          </div>

          {/* Content */}
          <div>
            <FieldLabel required>Nội dung đánh giá</FieldLabel>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về công ty..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
                focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                bg-white text-gray-900 placeholder:text-gray-400 transition-colors"
            />
            <CharCount value={content} max={2000} />
          </div>

          {/* Pros & Cons — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-green-700 mb-1.5">
                <ThumbsUp size={13} /> Điểm tốt
              </label>
              <textarea
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Những điểm bạn thích..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
                  focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100
                  bg-white text-gray-900 placeholder:text-gray-400 transition-colors"
              />
              <CharCount value={pros} max={1000} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-red-600 mb-1.5">
                <ThumbsDown size={13} /> Điểm chưa tốt
              </label>
              <textarea
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Những điểm cần cải thiện..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
                  focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100
                  bg-white text-gray-900 placeholder:text-gray-400 transition-colors"
              />
              <CharCount value={cons} max={1000} />
            </div>
          </div>

          {/* Options — chỉ hiện khi tạo mới */}
          {!isEdit && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-blue-600 cursor-pointer flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900">Ẩn danh</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tên của bạn sẽ không hiển thị công khai</p>
                </div>
              </label>

              <div className="h-px bg-gray-200" />

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={employed}
                  onChange={(e) => setEmployed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-blue-600 cursor-pointer flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900">
                    Đã/đang làm việc tại đây
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Xác nhận bạn có kinh nghiệm trực tiếp tại công ty</p>
                </div>
              </label>
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700
              border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="review-form"
            disabled={submitting}
            onClick={handleSubmit as any}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {isEdit ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}