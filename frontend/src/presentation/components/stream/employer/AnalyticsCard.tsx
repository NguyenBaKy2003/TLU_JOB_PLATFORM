// components/stream/employer/AnalyticsCard.tsx
import React from "react";
import { BarChart2, ChevronRight } from "lucide-react";

interface AnalyticsCardProps {
  onClick: () => void;
}

export function AnalyticsCard({ onClick }: AnalyticsCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
        <BarChart2 className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-700 text-sm">Xem Analytics</p>
        <p className="text-xs text-slate-400">Viewers, apply rate, AI summary</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
    </button>
  );
}