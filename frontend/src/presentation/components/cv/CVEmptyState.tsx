"use client";

import { FileText, Plus, Sparkles } from "lucide-react";

interface Props {
  onCreateClick: () => void;
}

export function CVEmptyState({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center w-full">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-[1.5rem] bg-white/60 backdrop-blur-sm shadow-sm border border-white flex items-center justify-center">
          <FileText className="w-10 h-10 text-[#04389E]" strokeWidth={1.5} />
        </div>
        {/* Border DFEAFE giúp icon tia sét cắt lõm vào khối hộp đằng sau */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-50 rounded-full border-[3px] border-[#DFEAFE] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-gray-900 mb-3">
        Chưa có CV nào
      </h2>
      <p className="text-[15px] text-gray-500 max-w-[320px] mb-10 leading-relaxed">
        Tạo CV online đầu tiên của bạn và chia sẻ với nhà tuyển dụng chỉ qua một đường link.
      </p>

      <button
        onClick={onCreateClick}
        className="
          flex items-center gap-2 px-6 py-3
          bg-[#04389E] hover:bg-[#032a76]
          text-white text-[16px] font-semibold
          rounded-xl transition-all duration-150
          shadow-sm hover:shadow-md active:scale-95
        "
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        Tạo CV đầu tiên
      </button>

      {/* Feature hints */}
      <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 max-w-lg">
        {[
          { icon: "🎨", label: "Nhiều template đẹp", desc: "Chuyên nghiệp & hiện đại" },
          { icon: "🔗", label: "Chia sẻ qua link", desc: "Không cần tải file" },
          { icon: "📊", label: "Thống kê lượt xem", desc: "Theo dõi hiệu quả" },
        ].map((f) => (
          <div key={f.label} className="text-center flex flex-col items-center">
            <div className="text-[28px] mb-2 drop-shadow-sm">{f.icon}</div>
            <p className="text-[13px] font-bold text-gray-800">{f.label}</p>
            <p className="text-[11px] text-gray-400 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}