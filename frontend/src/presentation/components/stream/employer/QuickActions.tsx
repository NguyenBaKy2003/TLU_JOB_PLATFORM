// components/stream/employer/QuickActions.tsx
import React from "react";
import { Play, AlertCircle } from "lucide-react";

interface QuickActionsProps {
  isLive: boolean;
  onStudioClick: () => void;
  onEditClick: () => void;
}

export function QuickActions({ isLive, onStudioClick, onEditClick }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onStudioClick}
          className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border
            ${isLive
              ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
            }`}
        >
          <Play className="w-4 h-4" />
          {isLive ? "Vào Studio" : "Bắt đầu"}
        </button>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          <AlertCircle className="w-4 h-4" />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}