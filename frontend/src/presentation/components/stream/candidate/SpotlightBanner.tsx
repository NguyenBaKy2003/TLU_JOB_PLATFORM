// components/stream/candidate/SpotlightBanner.tsx
import React from "react";
import { Briefcase, X } from "lucide-react";

interface SpotlightJob {
  jobPostId: string;
  title?: string;
}

interface SpotlightBannerProps {
  job: SpotlightJob;
  onApply: () => void;
  onDismiss: () => void;
}

export function SpotlightBanner({ job, onApply, onDismiss }: SpotlightBannerProps) {
  return (
    <div className="mx-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 text-white">
        <Briefcase className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-amber-800">
          Vị trí đang tuyển
        </p>
        <p className="text-[13px] font-semibold text-stone-900 truncate">
          {job.title ?? `Job #${job.jobPostId.slice(0, 8)}`}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={onApply}
          className="bg-amber-500 text-white border-none rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-amber-600"
        >
          Ứng tuyển
        </button>
        <button
          onClick={onDismiss}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-700 hover:bg-amber-100 cursor-pointer border-none bg-transparent"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}