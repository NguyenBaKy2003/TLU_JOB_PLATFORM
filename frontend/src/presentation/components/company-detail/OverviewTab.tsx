// src/presentation/components/company-detail/OverviewTab.tsx
"use client";
import { useState } from "react";
import { Star, ThumbsUp, Quote, Clock } from "lucide-react";
import type { CompanyProfile, CompanyReview } from "@/domain/models/Company";

interface Props {
  company: CompanyProfile;
  reviews?: CompanyReview[];
}

function ReviewerAvatar({ name }: { name: string }) {
  const colors = ["from-blue-400 to-blue-600", "from-amber-400 to-orange-500", "from-green-400 to-green-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
      {initials}
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
}

export function OverviewTab({ company, reviews = [] }: Props) {
  const visibleReviews = reviews.filter(r => r.visible);

  if (visibleReviews.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-6">Đánh giá</h2>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <Star size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">Chưa có đánh giá nào</p>
        </div>
      </div>
    );
  }

  const avgRating = visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  visibleReviews.forEach(r => { 
    const floorRating = Math.floor(r.rating);
    if (floorRating >= 1 && floorRating <= 5) {
      ratingCounts[floorRating as keyof typeof ratingCounts]++;
    }
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Đánh giá</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 bg-gray-50 rounded-2xl">
        <div className="text-center sm:text-left">
          <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={16} className={star <= avgRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
            ))}
          </div>
          <div className="text-xs text-gray-500">{visibleReviews.length} đánh giá</div>
        </div>
        
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star as keyof typeof ratingCounts];
            const percentage = visibleReviews.length > 0 ? (count / visibleReviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-6">{star}★</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleReviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <Quote size={20} className="text-blue-200 fill-blue-100" />
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <ReviewerAvatar name={review.anonymous ? "Ẩn danh" : `NV${review.reviewerId.slice(0, 6)}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {review.anonymous ? "Ẩn danh" : `Người dùng ${review.reviewerId.slice(0, 8)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-600">{review.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {review.employed && (
                <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full shrink-0">
                  Đã/đang làm
                </span>
              )}
            </div>

            {review.title && <p className="text-sm font-semibold text-gray-800">{review.title}</p>}
            <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>

            {(review.pros || review.cons) && (
              <div className="flex flex-col gap-2 text-xs">
                {review.pros && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">{review.pros}</span>
                  </div>
                )}
                {review.cons && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-600">{review.cons}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                <ThumbsUp size={13} /> Hữu ích
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}