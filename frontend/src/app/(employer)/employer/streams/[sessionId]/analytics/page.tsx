"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BarChart2, Users, TrendingUp, Clock,
  MessageSquare, FileText, CheckSquare, Eye, Loader,
} from "lucide-react";
import type { LiveStreamSession, StreamAnalytics } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ── Helpers ────────────

function formatDuration(seconds: number): string {
  if (seconds === 0)  return "0s";
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}p ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}p`;
}

// ── Sub-components ─────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-3">
      {children}
    </h2>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "blue",
}: {
  icon:    React.ElementType;
  label:   string;
  value:   string | number;
  sub?:    string;
  accent?: "blue" | "emerald" | "amber" | "violet" | "rose" | "slate";
}) {
  const accentMap = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    icon: "text-blue-400"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-400" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   icon: "text-amber-400"   },
    violet:  { bg: "bg-violet-50",  text: "text-violet-600",  icon: "text-violet-400"  },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600",    icon: "text-rose-400"    },
    slate:   { bg: "bg-slate-50",   text: "text-slate-700",   icon: "text-slate-400"   },
  };
  const c = accentMap[accent];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-400 mb-0.5">{label}</p>
        <p className={`text-[24px] font-bold leading-tight ${c.text}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EngagementRow({
  icon: Icon,
  label,
  value,
  max,
  color = "bg-slate-200",
}: {
  icon:   React.ElementType;
  label:  string;
  value:  number;
  max:    number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] text-slate-600">{label}</span>
          <span className="text-[13px] font-semibold text-slate-800">{value}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] text-slate-400 w-8 text-right shrink-0">{pct}%</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1">
        <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
        <div className="h-7 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ── Page ───────────────

export default function StreamAnalyticsPage() {
  const params    = useParams<{ sessionId: string }>();
  const router    = useRouter();
  const sessionId = params.sessionId;

  const [session,   setSession]   = useState<LiveStreamSession | null>(null);
  const [analytics, setAnalytics] = useState<StreamAnalytics | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      service.getSession(sessionId),
      service.getAnalytics(sessionId),
    ])
      .then(([s, a]) => {
        setSession(s);
        setAnalytics(a);
      })
      .catch(() => setError("Không thể tải dữ liệu thống kê."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Loading ──────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-slate-100 rounded animate-pulse mb-1.5" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-[14px] text-slate-500 text-center">
          {error ?? "Chưa có dữ liệu thống kê cho phiên này."}
        </p>
        <button
          onClick={() => router.back()}
          className="text-[13px] text-violet-600 font-medium hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // ── Derived values ────
  const avgWatchSeconds = analytics.totalViewerCount > 0
    ? Math.floor(analytics.totalWatchSeconds / analytics.totalViewerCount)
    : 0;

  const engagementMax = Math.max(
    analytics.qaQuestionCount,
    analytics.pollResponseCount,
    analytics.applyClickCount,
    analytics.cvViewCount,
    1,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-800 truncate">
              {session?.title ?? "Thống kê phiên"}
            </h1>
            <p className="text-xs text-slate-400">
              {session?.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
              {session?.scheduledAt && (
                <> · {new Date(session.scheduledAt).toLocaleDateString("vi-VN")}</>
              )}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-violet-500" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* ── Viewer metrics ─────────────────────── */}
        <section>
          <SectionTitle>Người xem</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={Users}
              label="Tổng người xem"
              value={analytics.totalViewerCount}
              sub="Unique viewers tham gia"
              accent="blue"
            />
            <MetricCard
              icon={TrendingUp}
              label="Đỉnh đồng thời"
              value={analytics.peakViewerCount}
              sub="Cao nhất trong phiên"
              accent="emerald"
            />
            <MetricCard
              icon={Clock}
              label="TB thời gian xem"
              value={formatDuration(avgWatchSeconds)}
              sub={`Tổng: ${formatDuration(analytics.totalWatchSeconds)}`}
              accent="amber"
            />
            <MetricCard
              icon={Eye}
              label="Lượt xem CV"
              value={analytics.cvViewCount}
              sub="Employer xem CV ứng viên"
              accent="violet"
            />
          </div>
        </section>

        {/* ── Engagement ─────────────────────────── */}
        <section>
          <SectionTitle>Tương tác</SectionTitle>
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 space-y-4">
            <EngagementRow
              icon={MessageSquare}
              label="Câu hỏi Q&A"
              value={analytics.qaQuestionCount}
              max={engagementMax}
              color="bg-blue-400"
            />
            <EngagementRow
              icon={CheckSquare}
              label="Trả lời poll"
              value={analytics.pollResponseCount}
              max={engagementMax}
              color="bg-violet-400"
            />
            <EngagementRow
              icon={FileText}
              label="Click ứng tuyển"
              value={analytics.applyClickCount}
              max={engagementMax}
              color="bg-rose-400"
            />
          </div>
        </section>

        {/* ── Summary ── */}
        <section>
          <SectionTitle>Tóm tắt</SectionTitle>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {[
              { label: "Tổng người xem",        value: analytics.totalViewerCount    },
              { label: "Đỉnh người xem",         value: analytics.peakViewerCount     },
              { label: "Tổng thời gian xem",     value: formatDuration(analytics.totalWatchSeconds) },
              { label: "TB thời gian / viewer",  value: formatDuration(avgWatchSeconds) },
              { label: "Câu hỏi Q&A",            value: analytics.qaQuestionCount     },
              { label: "Lượt trả lời poll",      value: analytics.pollResponseCount   },
              { label: "Lượt click ứng tuyển",   value: analytics.applyClickCount     },
              { label: "Lượt xem CV",            value: analytics.cvViewCount         },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] text-slate-500">{row.label}</span>
                <span className="text-[13px] font-semibold text-slate-800">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}