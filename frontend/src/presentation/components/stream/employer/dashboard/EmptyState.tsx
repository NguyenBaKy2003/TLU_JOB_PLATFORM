// components/stream/employer/dashboard/EmptyState.tsx
import React from "react";
import { Radio, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
          <Radio className="w-10 h-10 text-slate-400" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-1">Chưa có phiên stream nào</h3>
      <p className="text-slate-500 text-[16px] mb-6 max-w-sm">
        Tạo phiên Job Fair hoặc Phỏng vấn trực tiếp để kết nối với ứng viên
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white text-[16px] font-semibold rounded-xl hover:bg-blue-900"
      >
        <Plus className="w-4 h-4" />
        Tạo phiên stream đầu tiên
      </button>
    </div>
  );
}