"use client";

import { Plus, FileText } from "lucide-react";

interface Props {
  count: number;
  onCreateClick: () => void;
}

export function CVPageHeader({ count, onCreateClick }: Props) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <FileText className="w-5 h-5 text-[#04389E]" strokeWidth={1.8} />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#04389E]">
            Hồ sơ của tôi
          </span>
        </div>
        <h1 className="text-[2rem] font-bold text-gray-900 leading-tight tracking-tight">
          CV Online
        </h1>
        <p className="mt-1.5 text-[16px] text-gray-600">
          {count > 0
            ? `Bạn có ${count} CV · Nhà tuyển dụng có thể tìm thấy bạn qua link chia sẻ`
            : "Tạo CV trực tuyến và chia sẻ với nhà tuyển dụng"}
        </p>
      </div>

      <button
        onClick={onCreateClick}
        className="
          flex items-center gap-2 px-5 py-2.5
          bg-[#04389E] hover:bg-[#032a76]
          text-white text-[16px] font-semibold
          rounded-xl transition-all duration-150
          shadow-sm hover:shadow-md active:scale-95
        "
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tạo CV mới
      </button>
    </div>
  );
}