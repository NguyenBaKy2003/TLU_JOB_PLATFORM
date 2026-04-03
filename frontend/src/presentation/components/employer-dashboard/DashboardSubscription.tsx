// src/presentation/components/employer-dashboard/DashboardSubscription.tsx
import Link         from "next/link";
import { TrendingUp } from "lucide-react";

export function DashboardSubscription() {
  const used  = 1;
  const total = 3;
  // SVG donut: circumference = 2π×16 ≈ 100.5
  const circumference = 100.5;
  const filled        = (used / total) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <TrendingUp size={13} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-none">Miễn phí</p>
            <p className="text-[10px] text-gray-400">Hàng tháng</p>
          </div>
        </div>

        {/* Donut */}
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="16" fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <circle cx="22" cy="22" r="16" fill="none" stroke="#3b82f6" strokeWidth="5"
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round" transform="rotate(-90 22 22)" />
          <text x="22" y="22" textAnchor="middle" dominantBaseline="central"
            fontSize="8" fontWeight="700" fill="#1e293b">
            {used}/{total}
          </text>
        </svg>
      </div>

      <div className="space-y-1.5 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">↻</span> Tự động gia hạn
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏱</span>
          Còn lại <strong className="text-gray-700 ml-1">22 ngày</strong>
        </div>
        <p className="text-[10px] text-gray-400">Tham gia từ 07/01/2025</p>
      </div>

      <Link href="/employer/subscription"
        className="block w-full text-center py-2 rounded-xl border border-gray-200
          text-xs font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600
          hover:bg-blue-50 transition-all">
        Quản lý gói dịch vụ
      </Link>
    </div>
  );
}