// components/stream/employer/ConfirmEndModal.tsx
import React from "react";
import { TriangleAlert } from "lucide-react";

interface ConfirmEndModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmEndModal({ onConfirm, onCancel }: ConfirmEndModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-7 max-w-[380px] w-full">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4 text-red-500">
          <TriangleAlert className="w-5.5 h-5.5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Kết thúc stream?</h3>
        <p className="text-[16px] text-slate-500 leading-relaxed mb-6">
          Stream sẽ kết thúc ngay lập tức. Hệ thống sẽ tự động xử lý recording và tạo AI summary.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-[10px] border border-slate-200 bg-white text-slate-500 text-[16px] font-medium cursor-pointer hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-[10px] border-none bg-red-500 text-white text-[16px] font-semibold cursor-pointer hover:bg-red-600"
          >
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
}