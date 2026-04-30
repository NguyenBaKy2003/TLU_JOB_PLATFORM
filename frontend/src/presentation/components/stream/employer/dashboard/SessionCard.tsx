// components/stream/employer/dashboard/SessionCard.tsx
import React from "react";
import { Calendar, Eye, Clock, ChevronRight, Play, ExternalLink, Briefcase, Users } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Đã lên lịch",
    className: "text-amber-600 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  LIVE: {
    label: "Đang Live",
    className: "text-red-600 bg-red-50 border-red-200",
    dot: "bg-red-500",
    pulse: true,
  },
  ENDED: {
    label: "Đã kết thúc",
    className: "text-slate-500 bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
  },
  CANCELLED: {
    label: "Đã huỷ",
    className: "text-slate-400 bg-slate-50 border-slate-200",
    dot: "bg-slate-300",
  },
} as const;

const TYPE_CONFIG = {
  JOB_FAIR: { label: "Job Fair", icon: Briefcase, gradient: "from-blue-500 to-indigo-600" },
  INTERVIEW: { label: "Phỏng vấn", icon: Users, gradient: "from-violet-500 to-purple-600" },
};

interface SessionCardProps {
  session: LiveStreamSession;
  onClick: () => void;
  onStudioClick: () => void;
}

export function SessionCard({ session, onClick, onStudioClick }: SessionCardProps) {
  const status = STATUS_CONFIG[session.status];
  const type = TYPE_CONFIG[session.sessionType];
  const TypeIcon = type.icon;
  const isLive = session.status === "LIVE";
  const isScheduled = session.status === "SCHEDULED";

  const scheduledDate = new Date(session.scheduledAt);
  const isToday = scheduledDate.toDateString() === new Date().toDateString();

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden">
      {/* Top gradient bar on hover */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shrink-0 overflow-hidden`}>
            {session.thumbnailUrl ? (
              <img src={session.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <TypeIcon className="w-6 h-6 text-white/90" />
            )}
            {isLive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.className}`}>
                {status.pulse ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
                  </span>
                ) : (
                  <span className={`inline-flex rounded-full h-1.5 w-1.5 ${status.dot}`} />
                )}
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600`}>
                <TypeIcon className="w-3 h-3" />
                {type.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-800 truncate mb-2">
              {session.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {isToday ? "Hôm nay, " : ""}
                {scheduledDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {session.viewerCount.toLocaleString()}
              </span>
              {session.sessionType === "INTERVIEW" && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {session.interviewSlots.length} slots
                </span>
              )}
            </div>

            {/* Description */}
            {session.description && (
              <p className="text-xs text-slate-400 mt-2 line-clamp-1">{session.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {(isLive || isScheduled) && (
              <button
                onClick={(e) => { e.stopPropagation(); onStudioClick(); }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white
                  ${isLive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-slate-700 hover:bg-slate-800"
                  }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isLive ? "Studio" : "Bắt đầu"}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Chi tiết
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}