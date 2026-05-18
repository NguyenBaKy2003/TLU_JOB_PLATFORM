"use client";

import { FileText, Plus, Sparkles } from "lucide-react";

interface Props {
  onCreateClick: () => void;
}

export function CVEmptyState({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-[#EBF0F8] flex items-center justify-center">
          <FileText className="w-10 h-10 text-[#3D5A80]" strokeWidth={1.4} />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Chưa có CV nào
      </h2>
      <p className="text-[16px] text-gray-500 max-w-xs mb-8 leading-relaxed">
        Tạo CV online đầu tiên của bạn và chia sẻ với nhà tuyển dụng chỉ qua một đường link.
      </p>

      <button
        onClick={onCreateClick}
        className="
          flex items-center gap-2 px-6 py-3
          bg-[#3D5A80] hover:bg-[#2E4565]
          text-white text-[16px] font-semibold
          rounded-xl transition-all duration-150
          shadow-sm hover:shadow-md active:scale-95
        "
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tạo CV đầu tiên
      </button>

      {/* Feature hints */}
      <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
        {[
          { icon: "🎨", label: "Nhiều template đẹp", desc: "Chuyên nghiệp & hiện đại" },
          { icon: "🔗", label: "Chia sẻ qua link", desc: "Không cần tải file" },
          { icon: "📊", label: "Thống kê lượt xem", desc: "Theo dõi hiệu quả" },
        ].map((f) => (
          <div key={f.label} className="text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-xs font-semibold text-gray-700">{f.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}