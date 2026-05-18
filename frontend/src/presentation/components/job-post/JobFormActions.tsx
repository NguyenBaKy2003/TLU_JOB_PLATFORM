"use client";
import { ChevronRight, Star, Loader2 } from "lucide-react";

interface JobFormActionsProps {
  isDraft: boolean;
  isBusy: boolean;
  saving: "draft" | "publish" | null;
  featured?: boolean;
  showFeatured?: boolean;
  onSubmit: (publish: boolean) => void;
  draftLabel?: string;
  publishLabel?: string;
}

export function JobFormActions({
  isDraft,
  isBusy,
  saving,
  featured = false,
  showFeatured = false,
  onSubmit,
  draftLabel = "Lưu nháp",
  publishLabel = "Đăng tin ngay",
}: JobFormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      {/* Draft button - only when draft */}
      {isDraft && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSubmit(false)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[16px]
            font-semibold text-blue-600 bg-white border border-blue-200 rounded-2xl
            hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all"
        >
          {saving === "draft" && (
            <Loader2 size={15} className="animate-spin" />
          )}
          {saving === "draft" ? "Đang lưu..." : draftLabel}
        </button>
      )}

      {/* Save changes button - when published */}
      {!isDraft && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSubmit(false)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[16px]
            font-semibold text-blue-600 bg-white border border-blue-200 rounded-2xl
            hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all"
        >
          {saving === "draft" && (
            <Loader2 size={15} className="animate-spin" />
          )}
          {saving === "draft" ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      )}

      {/* Publish button */}
      <button
        type="button"
        disabled={isBusy}
        onClick={() => onSubmit(true)}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 text-[16px]
          font-semibold text-white rounded-2xl disabled:opacity-50 transition-all shadow-sm
          ${showFeatured && featured
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >
        {saving === "publish" ? (
          <Loader2 size={15} className="animate-spin text-white" />
        ) : showFeatured && featured ? (
          <Star size={15} className="fill-white" />
        ) : (
          <ChevronRight size={16} />
        )}
        {saving === "publish"
          ? "Đang lưu..."
          : showFeatured && featured
            ? "Đăng tin nổi bật"
            : publishLabel
        }
      </button>
    </div>
  );
}