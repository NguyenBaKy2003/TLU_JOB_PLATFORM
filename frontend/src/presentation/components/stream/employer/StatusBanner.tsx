// components/stream/employer/StatusBanner.tsx
import React from "react";
import { Calendar, Radio, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  SCHEDULED: {
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Đã lên lịch",
    desc: "Phiên stream sẽ bắt đầu theo lịch hẹn",
  },
  LIVE: {
    icon: Radio,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    label: "Đang diễn ra",
    desc: "Stream đang live — vào Studio để quản lý",
  },
  ENDED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Đã kết thúc",
    desc: "AI đang xử lý summary và analytics",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-100",
    label: "Đã huỷ",
    desc: "Phiên stream đã bị huỷ",
  },
} as const;

interface StatusBannerProps {
  status: keyof typeof STATUS_CONFIG;
  onStudioClick?: () => void;
}

export function StatusBanner({ status, onStudioClick }: StatusBannerProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isLive = status === "LIVE";

  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${config.color}`}>{config.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{config.desc}</p>
        </div>
        {isLive && onStudioClick && (
          <button
            onClick={onStudioClick}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          >
            Quản lý <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}