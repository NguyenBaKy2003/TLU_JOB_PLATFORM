// src/presentation/components/company-detail/OverviewTab.tsx
"use client";
import { useState }             from "react";
import { Star, ThumbsUp, ThumbsDown, Quote } from "lucide-react";
import type { CompanyDetail }   from "./companyDetailTypes";

function ReviewerAvatar({ name }: { name: string }) {
  const colors = ["from-blue-400 to-blue-600","from-amber-400 to-orange-500","from-green-400 to-green-600"];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

export function OverviewTab({ company }: { company: CompanyDetail }) {
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>(
    Object?.(company.reviews?.map(r => [r.id, null]))
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Tổng Quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {company.reviews?.map(review => (
          <div key={review.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">

            {/* Quote icon */}
            <Quote size={20} className="text-blue-200 fill-blue-100" />

            {/* Reviewer */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ReviewerAvatar name={review.author} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{review.author}</p>
                  <p className="text-[11px] text-gray-400">{review.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-yellow-600">{review.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-xs text-gray-600 leading-relaxed flex-1">{review.content}</p>

            {/* Voting */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
              <button
                onClick={() => setVotes(v => ({ ...v, [review.id]: v[review.id] === "up" ? null : "up" }))}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  votes[review.id] === "up" ? "text-blue-600" : "text-gray-400 hover:text-blue-600"
                }`}
              >
                <ThumbsUp size={13} fill={votes[review.id] === "up" ? "currentColor" : "none"} />
                {review.likes + (votes[review.id] === "up" ? 1 : 0)}
              </button>
              <button
                onClick={() => setVotes(v => ({ ...v, [review.id]: v[review.id] === "down" ? null : "down" }))}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  votes[review.id] === "down" ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <ThumbsDown size={13} fill={votes[review.id] === "down" ? "currentColor" : "none"} />
                {review.dislikes + (votes[review.id] === "down" ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}