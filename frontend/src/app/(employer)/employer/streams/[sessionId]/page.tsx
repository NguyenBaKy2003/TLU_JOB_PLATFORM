// components/stream/employer/SessionDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Radio, Play, ExternalLink, ArrowLeft, Calendar, Users, Clock, Briefcase, Loader } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { StatusBanner } from "@/presentation/components/stream/employer/StatusBanner";
import { InfoRow } from "@/presentation/components/stream/employer/InfoRow";
import { ShareCard } from "@/presentation/components/stream/employer/ShareCard";
import { QuickActions } from "@/presentation/components/stream/employer/QuickActions";
import { SlotCard } from "@/presentation/components/stream/employer/SlotCard";
import { AnalyticsCard } from "@/presentation/components/stream/employer/AnalyticsCard";

const service = new LiveStreamService(new LiveStreamRepository());

export default function SessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service.getSession(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  const openStudio = () => {
    window.open(`/employer/streams/${sessionId}/studio`, "_blank", "noopener,noreferrer");
  };

  const handleInvite = async (sId: string, candidateId: string, slotId: string) => {
    await service.inviteToSlot(sId, { candidateId, slotId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const isLive = session.status === "LIVE";
  const isScheduled = session.status === "SCHEDULED";
  const isCancelled = session.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-800 truncate">{session.title}</h1>
            <p className="text-xs text-slate-400">
              {session.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
            </p>
          </div>
          {(isLive || isScheduled) && (
            <button
              onClick={openStudio}
              className={`inline-flex items-center gap-2 text-[16px] font-semibold px-5 py-2.5 rounded-xl
                ${isLive
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-slate-800 text-white hover:bg-slate-900"
                }`}
            >
              {isLive ? (
                <>
                  <Radio className="w-4 h-4" /> Vào Studio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Bắt đầu Stream
                </>
              )}
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Status */}
        <StatusBanner status={session.status} onStudioClick={isLive ? openStudio : undefined} />

        {/* Session info */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-2">
          <InfoRow icon={Calendar} label="Thời gian" value={new Date(session.scheduledAt).toLocaleString("vi-VN", {
            weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
          })} />
          <InfoRow icon={Users} label="Người xem" value={
            <span className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{session.viewerCount}</span>
              <span className="text-slate-400">/ {session.maxViewers} tối đa</span>
            </span>
          } />
          {session.sessionType === "INTERVIEW" && (
            <InfoRow icon={Clock} label="Interview slots" value={`${session.interviewSlots.length} slots`} />
          )}
          {session.description && (
            <InfoRow icon={Briefcase} label="Mô tả" value={session.description} border={false} />
          )}
        </div>

        {/* Share link */}
        {!isCancelled && <ShareCard sessionId={sessionId} />}

        {/* Quick actions */}
        {(isLive || isScheduled) && (
          <QuickActions
            isLive={isLive}
            onStudioClick={openStudio}
            onEditClick={() => router.push(`/employer/streams/${sessionId}/edit`)}
          />
        )}

        {/* Interview slots */}
        {session.sessionType === "INTERVIEW" && session.interviewSlots.length > 0 && (
          <div>
            <h2 className="text-[16px] font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Interview Slots
            </h2>
            <div className="space-y-2">
              {session.interviewSlots.map((slot, i) => (
                <SlotCard
                  key={slot.slotId}
                  slot={slot}
                  index={i}
                  sessionId={sessionId}
                  onInvite={handleInvite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analytics */}
        {session.status === "ENDED" && (
          <AnalyticsCard onClick={() => router.push(`/employer/streams/${sessionId}/analytics`)} />
        )}
      </div>
    </div>
  );
}