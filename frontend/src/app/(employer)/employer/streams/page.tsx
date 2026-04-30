// components/stream/employer/dashboard/EmployerStreamDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Plus, Calendar, TrendingUp, BarChart2 } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { EmptyState, SessionCard, SessionCardSkeleton, StatCard } from "@/presentation/components/stream/employer/dashboard";

const service = new LiveStreamService(new LiveStreamRepository());

type FilterType = "ALL" | "LIVE" | "SCHEDULED" | "ENDED";

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "SCHEDULED", label: "Sắp diễn ra" },
  { key: "LIVE", label: "Đang live" },
  { key: "ENDED", label: "Đã kết thúc" },
];

export default function EmployerStreamDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveStreamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => {
    service.getMySessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  const live = sessions.filter((s) => s.status === "LIVE");
  const scheduled = sessions.filter((s) => s.status === "SCHEDULED");
  const ended = sessions.filter((s) => s.status === "ENDED");
  const filtered = filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);
  const totalViewers = live.reduce((a, s) => a + s.viewerCount, 0);

  const openStudio = (id: string) => window.open(`/employer/streams/${id}/studio`, "_blank", "noopener,noreferrer");
  const openDetail = (id: string) => router.push(`/employer/streams/${id}`);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}


      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Radio} label="Đang Live" value={live.length} sub={live.length > 0 ? `${totalViewers.toLocaleString()} người xem` : "Chưa có"} color="red" pulse={live.length > 0} />
          <StatCard icon={Calendar} label="Sắp diễn ra" value={scheduled.length} sub={scheduled.length > 0 ? "Đã lên lịch" : "Chưa có"} color="amber" />
          <StatCard icon={BarChart2} label="Đã kết thúc" value={ended.length} sub="Có thể xem analytics" color="emerald" />
          <StatCard icon={TrendingUp} label="Tổng số phiên" value={sessions.length} sub="Tất cả thời gian" color="blue" />
        </div>

        {/* Live highlight */}
        {live.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h2 className="text-base font-bold text-slate-800">Đang phát trực tiếp</h2>
              </div>
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">{live.length} phiên</span>
            </div>
            <div className="space-y-3">
              {live.map((s) => (
                <SessionCard key={s.id} session={s} onClick={() => openDetail(s.id)} onStudioClick={() => openStudio(s.id)} />
              ))}
            </div>
          </div>
        )}

        <button
            onClick={() => router.push("/employer/streams/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-xl hover:bg-blue-900 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo phiên mới</span>
          </button>

        {/* All sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-800">Tất cả phiên stream</h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{sessions.length}</span>
            </div>

            {/* Filters */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors
                    ${filter === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <SessionCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onCreateClick={() => router.push("/employer/streams/create")} />
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => (
                <SessionCard key={s.id} session={s} onClick={() => openDetail(s.id)} onStudioClick={() => openStudio(s.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}