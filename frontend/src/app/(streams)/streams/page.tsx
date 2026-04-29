"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Search,
  Calendar,
  Users,
  Clock,
  Briefcase,
  Mic,
  Filter,
  ChevronRight,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LiveStreamSession, SessionType } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ─── Helpers ──────────────────────────────────────────────────
function formatScheduled(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);

  if (diffMs < 0) return "Đang diễn ra";
  if (diffH === 0) return `${diffM} phút nữa`;
  if (diffH < 24) return `${diffH} giờ ${diffM} phút nữa`;
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLiveNow(session: LiveStreamSession) {
  return session.status === "LIVE";
}

function isSoon(session: LiveStreamSession) {
  const diff = new Date(session.scheduledAt).getTime() - Date.now();
  return diff > 0 && diff < 2 * 3600000; // trong 2 giờ
}

// ─── Live Badge ───────────────────────────────────────────────
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      LIVE
    </span>
  );
}

// ─── Session Card (large, for featured) ───────────────────────
function FeaturedCard({
  session,
  onClick,
}: {
  session: LiveStreamSession;
  onClick: () => void;
}) {
  const isLive = isLiveNow(session);
  const TypeIcon = session.sessionType === "JOB_FAIR" ? Briefcase : Mic;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            {isLive ? (
              <LiveBadge />
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
                <Clock className="w-3 h-3" />
                {formatScheduled(session.scheduledAt)}
              </span>
            )}
            <h3 className="font-bold text-white text-lg leading-tight">
              {session.title}
            </h3>
            {session.description && (
              <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                {session.description}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
            <TypeIcon className="w-5 h-5 text-white/60" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {isLive ? `${session.viewerCount} đang xem` : `Tối đa ${session.maxViewers}`}
            </span>
            <span className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {session.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn"}
            </span>
            {session.sessionType === "INTERVIEW" && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.interviewSlots.length} slots
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-white/60 text-xs font-medium group-hover:text-white transition-colors">
            {isLive ? "Xem ngay" : "Chi tiết"}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Session Card (compact, for list) ────────────────────────
function StreamCard({
  session,
  onClick,
}: {
  session: LiveStreamSession;
  onClick: () => void;
}) {
  const isLive = isLiveNow(session);
  const soon = isSoon(session);
  const TypeIcon = session.sessionType === "JOB_FAIR" ? Briefcase : Mic;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-slate-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isLive
              ? "bg-red-50 group-hover:bg-red-100"
              : "bg-slate-50 group-hover:bg-slate-100"
          }`}
        >
          <TypeIcon className={`w-5 h-5 ${isLive ? "text-red-500" : "text-slate-500"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive ? (
              <LiveBadge />
            ) : soon ? (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full">
                Sắp diễn ra
              </span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatScheduled(session.scheduledAt)}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-slate-800 text-sm truncate">
            {session.title}
          </h3>

          <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {isLive ? `${session.viewerCount} đang xem` : `${session.maxViewers} chỗ`}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span>{session.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn"}</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-slate-800 text-white"
          : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
        <Radio className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-slate-600 font-medium mb-1">
        {query ? `Không tìm thấy "${query}"` : "Chưa có phiên stream"}
      </p>
      <p className="text-slate-400 text-sm">
        {query ? "Thử tìm kiếm với từ khoá khác" : "Quay lại sau để xem các phiên mới"}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function StreamMarketplacePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveStreamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | SessionType>("ALL");

  useEffect(() => {
    service
      .getUpcomingStreams()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  // Derived
  const live = sessions.filter((s) => s.status === "LIVE");
  const filtered = sessions.filter((s) => {
    const matchQ =
      !query ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase());
    const matchType = typeFilter === "ALL" || s.sessionType === typeFilter;
    return matchQ && matchType;
  });

  const featured = filtered.filter(
    (s) => s.status === "LIVE" || isSoon(s)
  );
  const rest = filtered.filter(
    (s) => s.status !== "LIVE" && !isSoon(s)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">Live Tuyển Dụng</h1>
              {live.length > 0 ? (
                <p className="text-xs text-red-500 font-medium">
                  {live.length} phiên đang diễn ra
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  {sessions.length} phiên sắp diễn ra
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm phiên stream..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterPill active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
              Tất cả
            </FilterPill>
            <FilterPill active={typeFilter === "JOB_FAIR"} onClick={() => setTypeFilter("JOB_FAIR")}>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Job Fair
              </span>
            </FilterPill>
            <FilterPill active={typeFilter === "INTERVIEW"} onClick={() => setTypeFilter("INTERVIEW")}>
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Phỏng vấn
              </span>
            </FilterPill>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl border border-slate-100 p-4 ${
                  i === 1 ? "h-40 bg-slate-200" : "h-20 bg-white"
                }`}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <>
            {/* Featured: Live + Soon */}
            {featured.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {live.length > 0 ? "Đang diễn ra & Sắp tới" : "Sắp diễn ra"}
                </h2>
                {featured.map((s) => (
                  <FeaturedCard
                    key={s.id}
                    session={s}
                    onClick={() => router.push(`/streams/${s.id}`)}
                  />
                ))}
              </section>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Các phiên khác
                </h2>
                {rest.map((s) => (
                  <StreamCard
                    key={s.id}
                    session={s}
                    onClick={() => router.push(`/streams/${s.id}`)}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}