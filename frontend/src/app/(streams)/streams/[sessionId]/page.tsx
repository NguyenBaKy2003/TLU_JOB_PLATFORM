"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Radio,
  Calendar,
  Users,
  Clock,
  Briefcase,
  Mic,
  ChevronRight,
  Play,
  Film,
  Loader,
  Share2,
} from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)} ngày nữa`;
  if (h > 0) return `${h} giờ ${m} phút nữa`;
  return `${m} phút nữa`;
}

// ─── Countdown Badge ──────────────────────────────────────────
function CountdownBadge({ scheduledAt }: { scheduledAt: string }) {
  const [countdown, setCountdown] = useState(getCountdown(scheduledAt));

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown(scheduledAt)), 30000);
    return () => clearInterval(t);
  }, [scheduledAt]);

  if (!countdown) return null;
  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" />
      {countdown}
    </div>
  );
}

// ─── Info Block ───────────────────────────────────────────────
function InfoBlock({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-700">{children}</div>
      </div>
    </div>
  );
}

// ─── Interview Slot List ──────────────────────────────────────
function SlotList({ slots }: { slots: LiveStreamSession["interviewSlots"] }) {
  const open = slots.filter((s) => s.status === "OPEN");
  if (open.length === 0) {
    return <p className="text-sm text-slate-400">Tất cả slots đã được đặt</p>;
  }
  return (
    <div className="space-y-2">
      {open.map((slot, i) => (
        <div
          key={slot.slotId}
          className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg"
        >
          <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span>
            {new Date(slot.startTime).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
          <span className="text-slate-300">•</span>
          <span>{slot.durationMinutes} phút</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────
export default function CandidateStreamDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    service
      .getUpcomingStreams()
      .then((list) => {
        const s = list.find((x) => x.id === sessionId);
        setSession(s ?? null);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: session?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <Radio className="w-12 h-12 text-slate-200" />
        <p className="text-slate-500 font-medium">Không tìm thấy phiên stream</p>
        <button onClick={() => router.back()} className="text-sm text-slate-400 underline">
          Quay lại
        </button>
      </div>
    );
  }

  const isLive = session.status === "LIVE";
  const isEnded = session.status === "ENDED";
  const TypeIcon = session.sessionType === "JOB_FAIR" ? Briefcase : Mic;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {shared && (
            <span className="absolute top-14 right-4 text-xs text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded-lg shadow-sm">
              Đã copy link!
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <TypeIcon className="w-6 h-6 text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    LIVE
                  </span>
                )}
                {!isLive && !isEnded && (
                  <CountdownBadge scheduledAt={session.scheduledAt} />
                )}
                <span className="inline-flex items-center gap-1 text-white/40 text-xs">
                  <TypeIcon className="w-3 h-3" />
                  {session.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn"}
                </span>
              </div>
              <h1 className="text-white font-bold text-xl leading-tight">
                {session.title}
              </h1>
              {session.description && (
                <p className="text-white/40 text-sm mt-2 leading-relaxed">
                  {session.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {isLive
                ? `${session.viewerCount} đang xem`
                : `Tối đa ${session.maxViewers} người`}
            </span>
            {session.sessionType === "INTERVIEW" && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {session.interviewSlots.filter((s) => s.status === "OPEN").length} slots trống
              </span>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <InfoBlock icon={Calendar} label="Thời gian">
            {formatDate(session.scheduledAt)}
          </InfoBlock>
          <InfoBlock icon={Users} label="Số người tham dự">
            Tối đa {session.maxViewers} viewer
          </InfoBlock>
          {session.sessionType === "INTERVIEW" && (
            <InfoBlock icon={Clock} label="Interview slots">
              <SlotList slots={session.interviewSlots} />
            </InfoBlock>
          )}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          {isLive && (
            <button
              onClick={() => router.push(`/streams/${sessionId}/watch`)}
              className="w-full flex items-center justify-center gap-2.5 bg-red-500 text-white font-semibold py-4 rounded-2xl hover:bg-red-600 transition-colors text-base shadow-lg shadow-red-500/20"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Tham gia ngay
            </button>
          )}

          {!isLive && !isEnded && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-semibold py-4 rounded-2xl cursor-not-allowed text-base"
            >
              <Clock className="w-5 h-5" />
              Chưa bắt đầu
            </button>
          )}

          {isEnded && (
            <button
              onClick={() => router.push(`/streams/${sessionId}/replay`)}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-semibold py-4 rounded-2xl hover:bg-slate-700 transition-colors text-base"
            >
              <Film className="w-5 h-5" />
              Xem lại (Replay)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}