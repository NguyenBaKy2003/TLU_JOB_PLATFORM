// components/stream/employer/dashboard/SessionCardSkeleton.tsx
import React from "react";

export function SessionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 bg-slate-200 rounded-full w-20" />
            <div className="h-5 bg-slate-200 rounded-full w-16" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="flex gap-3">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        </div>
        <div className="space-y-2 shrink-0">
          <div className="h-9 bg-slate-200 rounded-xl w-24" />
          <div className="h-8 bg-slate-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}