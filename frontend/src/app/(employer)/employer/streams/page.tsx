"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
  BarChart2,
  Briefcase,
} from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Đã lên lịch",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  LIVE: {
    label: "Đang Live",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    pulse: true,
  },
  ENDED: {
    label: "Đã kết thúc",
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  CANCELLED: {
    label: "Đã huỷ",
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-300",
  },
} as const;

const TYPE_LABEL = {
  JOB_FAIR: { label: "Job Fair", icon: Briefcase },
  INTERVIEW: { label: "Phỏng vấn", icon: Users },
};

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-3xl font-bold ${accent ?? "text-slate-800"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${accent ? "bg-red-50" : "bg-slate-50"}`}>
          <Icon className={`w-5 h-5 ${accent ?? "text-slate-400"}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────
function SessionCard({
  session,
  onClick,
}: {
  session: LiveStreamSession;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[session.status];
  const type = TYPE_LABEL[session.sessionType];
  const TypeIcon = type.icon;

  const scheduledDate = new Date(session.scheduledAt);
  const isToday =
    scheduledDate.toDateString() === new Date().toDateString();

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail / Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center flex-shrink-0 group-hover:from-slate-700 transition-all">
          {session.thumbnailUrl ? (
            <img
              src={session.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Radio className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
            >
              {cfg.pulse && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
                </span>
              )}
              {!cfg.pulse && (
                <span className={`inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
              )}
              {cfg.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <TypeIcon className="w-3 h-3" />
              {type.label}
            </span>
          </div>

          <h3 className="font-semibold text-slate-800 truncate pr-4">
            {session.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {isToday ? "Hôm nay, " : ""}
              {scheduledDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {session.viewerCount}/{session.maxViewers}
            </span>
            {session.sessionType === "INTERVIEW" && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.interviewSlots.length} slots
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
        <Radio className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-700 font-semibold mb-1">Chưa có phiên stream</h3>
      <p className="text-slate-400 text-sm mb-6">
        Tạo phiên Job Fair hoặc Interview để bắt đầu tuyển dụng trực tiếp
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tạo phiên stream đầu tiên
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function EmployerStreamDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveStreamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "SCHEDULED" | "ENDED">("ALL");

  useEffect(() => {
    service
      .getMySessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  const live = sessions.filter((s) => s.status === "LIVE");
  const scheduled = sessions.filter((s) => s.status === "SCHEDULED");
  const ended = sessions.filter((s) => s.status === "ENDED");

  const filtered =
    filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);

  const totalViewers = live.reduce((a, s) => a + s.viewerCount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">Live Stream</h1>
              <p className="text-xs text-slate-400">Quản lý phiên tuyển dụng</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/employer/streams/create")}
            className="inline-flex items-center gap-2 bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo phiên mới
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Wifi}
            label="Đang live"
            value={live.length}
            sub={`${totalViewers} viewers`}
            accent={live.length > 0 ? "text-red-500" : undefined}
          />
          <StatCard
            icon={Calendar}
            label="Đã lên lịch"
            value={scheduled.length}
            sub="Sắp diễn ra"
          />
          <StatCard
            icon={BarChart2}
            label="Đã kết thúc"
            value={ended.length}
            sub="Có thể xem lại"
          />
          <StatCard
            icon={TrendingUp}
            label="Tổng phiên"
            value={sessions.length}
            sub="Tất cả thời gian"
          />
        </div>

        {/* Live sessions highlight */}
        {live.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                Đang phát trực tiếp
              </h2>
            </div>
            {live.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onClick={() => router.push(`/employer/streams/${s.id}/studio`)}
              />
            ))}
          </div>
        )}

        {/* Filter tabs + list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Tất cả phiên</h2>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 text-xs">
              {(["ALL", "SCHEDULED", "LIVE", "ENDED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === f
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f === "ALL" ? "Tất cả" : STATUS_CONFIG[f].label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                      <div className="h-4 bg-slate-100 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              onCreateClick={() => router.push("/employer/streams/create")}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onClick={() =>
                    router.push(
                      s.status === "LIVE"
                        ? `/employer/streams/${s.id}/studio`
                        : `/employer/streams/${s.id}`
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}