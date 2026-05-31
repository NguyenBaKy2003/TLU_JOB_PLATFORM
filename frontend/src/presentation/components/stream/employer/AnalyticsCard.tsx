"use client";

import {
  BarChart2, Users, TrendingUp, Clock,
  MessageSquare, FileText, CheckSquare, ChevronRight,
} from "lucide-react";

interface AnalyticsCardProps {
  peakViewerCount?:   number;
  totalViewerCount?:  number;
  totalWatchSeconds?: number;
  qaQuestionCount?:   number;
  pollResponseCount?: number;
  applyClickCount?:   number;
  loading?:           boolean; // ← THÊM
  onClick:            () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}p ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}p`;
}

function StatItem({
  icon: Icon,
  label,
  value,
  color = "text-slate-700",
  loading = false,
}: {
  icon:     React.ElementType;
  label:    string;
  value:    string | number;
  color?:   string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      {loading ? (
        <div className="h-6 w-12 bg-slate-100 rounded-md animate-pulse mt-0.5" />
      ) : (
        <span className={`text-[18px] font-bold ${color}`}>{value}</span>
      )}
    </div>
  );
}

export function AnalyticsCard({
  peakViewerCount   = 0,
  totalViewerCount  = 0,
  totalWatchSeconds = 0,
  qaQuestionCount   = 0,
  pollResponseCount = 0,
  applyClickCount   = 0,
  loading           = false,
  onClick,
}: AnalyticsCardProps) {
  const avgWatchSeconds = totalViewerCount > 0
    ? Math.floor(totalWatchSeconds / totalViewerCount)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <span className="text-[14px] font-semibold text-slate-700">Thống kê phiên</span>
            {loading && (
              <span className="ml-2 text-[11px] text-slate-400 animate-pulse">
                Đang tải...
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClick}
          disabled={loading}
          className="flex items-center gap-1 text-[12px] text-violet-600 font-medium
            hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Chi tiết
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats grid — viewer metrics */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <StatItem
          icon={Users}
          label="Tổng người xem"
          value={totalViewerCount}
          color="text-blue-600"
          loading={loading}
        />
        <StatItem
          icon={TrendingUp}
          label="Đỉnh người xem"
          value={peakViewerCount}
          color="text-emerald-600"
          loading={loading}
        />
        <StatItem
          icon={Clock}
          label="TB thời gian xem"
          value={formatDuration(avgWatchSeconds)}
          color="text-amber-600"
          loading={loading}
        />
      </div>

      <div className="mx-5 border-t border-slate-100" />

      {/* Engagement row */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <StatItem
          icon={MessageSquare}
          label="Câu hỏi Q&A"
          value={qaQuestionCount}
          loading={loading}
        />
        <StatItem
          icon={CheckSquare}
          label="Trả lời poll"
          value={pollResponseCount}
          loading={loading}
        />
        <StatItem
          icon={FileText}
          label="Click ứng tuyển"
          value={applyClickCount}
          color={applyClickCount > 0 ? "text-rose-600" : "text-slate-700"}
          loading={loading}
        />
      </div>
    </div>
  );
}