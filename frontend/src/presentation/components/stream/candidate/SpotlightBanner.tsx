import React from "react";
import { Briefcase, X, Building2, MapPin, Banknote } from "lucide-react";

interface SpotlightJob {
  jobPostId:    string;
  title?:       string;
  companyName?: string;
  location?:    string;
  salaryRange?: string;
}

interface SpotlightBannerProps {
  job:       SpotlightJob;
  onApply:   () => void;
  onDismiss: () => void;
}

export function SpotlightBanner({ job, onApply, onDismiss }: SpotlightBannerProps) {
  return (
    <div className="mx-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 text-white mt-0.5">
        <Briefcase className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-amber-700 mb-0.5">
          ✨ Vị trí đang tuyển
        </p>
        <p className="text-[14px] font-bold text-stone-900 truncate">
          {job.title ?? `Job #${job.jobPostId.slice(0, 8)}`}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {job.companyName && (
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Building2 className="w-3 h-3 shrink-0" />
              {job.companyName}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <MapPin className="w-3 h-3 shrink-0" />
              {job.location}
            </span>
          )}
          {job.salaryRange && (
            <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
              <Banknote className="w-3 h-3 shrink-0" />
              {job.salaryRange}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={onApply}
          className="bg-amber-500 text-white border-none rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-amber-600 whitespace-nowrap transition-colors"
        >
          Ứng tuyển
        </button>
        <button
          onClick={onDismiss}
          className="flex items-center justify-center rounded-lg p-1 text-amber-600 hover:bg-amber-100 cursor-pointer border-none bg-transparent transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}