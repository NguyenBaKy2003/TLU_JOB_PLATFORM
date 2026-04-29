"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Radio,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  Play,
  BarChart2,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  ChevronRight,
  Copy,
} from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ─── Status banner ────────────────────────────────────────────
const STATUS_BANNERS = {
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
};

// ─── Info Row ─────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-700">{value}</div>
      </div>
    </div>
  );
}

// ─── Interview Slot Card ──────────────────────────────────────
function SlotCard({
  slot,
  index,
  sessionId,
}: {
  slot: LiveStreamSession["interviewSlots"][0];
  index: number;
  sessionId: string;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(!!slot.candidateId);

  const handleInvite = async () => {
    if (!candidateId.trim()) return;
    setLoading(true);
    try {
      await service.inviteToSlot(sessionId, {
        candidateId: candidateId.trim(),
        slotId: slot.slotId,
      });
      setInvited(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        invited
          ? "bg-emerald-50 border-emerald-100"
          : slot.status === "OPEN"
          ? "bg-white border-slate-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            invited ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {invited ? "✓" : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">
              {new Date(slot.startTime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
            <span className="text-xs text-slate-400">{slot.durationMinutes} phút</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto ${
                invited
                  ? "bg-emerald-100 text-emerald-600"
                  : slot.status === "OPEN"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              {invited ? "Đã mời" : slot.status === "OPEN" ? "Trống" : "Đã đặt"}
            </span>
          </div>

          {!invited && slot.status === "OPEN" && (
            <div className="flex gap-2 mt-2">
              <input
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="Candidate ID"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:border-slate-400"
              />
              <button
                onClick={handleInvite}
                disabled={loading || !candidateId.trim()}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : "Mời"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Share Card ───────────────────────────────────────────────
function ShareCard({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/streams/${sessionId}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs font-medium text-slate-500 mb-2">Link chia sẻ</p>
      <div className="flex gap-2">
        <code className="flex-1 text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100 truncate">
          {url}
        </code>
        <button
          onClick={copy}
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors text-xs flex items-center gap-1"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Đã copy" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────
export default function SessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service
      .getSession(sessionId)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const banner = STATUS_BANNERS[session.status];
  const BannerIcon = banner.icon;
  const isLive = session.status === "LIVE";
  const isScheduled = session.status === "SCHEDULED";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-800 truncate">{session.title}</h1>
            <p className="text-xs text-slate-400">
              {session.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn"}
            </p>
          </div>
          {(isLive || isScheduled) && (
            <button
              onClick={() =>
                router.push(`/employer/streams/${sessionId}/studio`)
              }
              className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                isLive
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {isLive ? (
                <>
                  <Radio className="w-4 h-4" />
                  Vào Studio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Bắt đầu
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Status Banner */}
        <div className={`rounded-2xl border p-4 ${banner.bg} ${banner.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${banner.bg} border ${banner.border} flex items-center justify-center`}>
              <BannerIcon className={`w-5 h-5 ${banner.color}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${banner.color}`}>
                {banner.label}
              </p>
              <p className="text-xs text-slate-500">{banner.desc}</p>
            </div>
            {isLive && (
              <ChevronRight
                className="w-4 h-4 text-slate-400 ml-auto cursor-pointer"
                onClick={() => router.push(`/employer/streams/${sessionId}/studio`)}
              />
            )}
          </div>
        </div>

        {/* Session info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-2">
          <InfoRow
            icon={Calendar}
            label="Thời gian"
            value={new Date(session.scheduledAt).toLocaleString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <InfoRow
            icon={Users}
            label="Viewers"
            value={`${session.viewerCount} / ${session.maxViewers} tối đa`}
          />
          {session.sessionType === "INTERVIEW" && (
            <InfoRow
              icon={Clock}
              label="Interview slots"
              value={`${session.interviewSlots.length} slots`}
            />
          )}
          {session.description && (
            <InfoRow
              icon={Briefcase}
              label="Mô tả"
              value={session.description}
            />
          )}
        </div>

        {/* Share link */}
        {session.status !== "CANCELLED" && (
          <ShareCard sessionId={sessionId} />
        )}

        {/* Interview slots */}
        {session.sessionType === "INTERVIEW" &&
          session.interviewSlots.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
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
                  />
                ))}
              </div>
            </div>
          )}

        {/* Analytics link (for ended sessions) */}
        {session.status === "ENDED" && (
          <button
            onClick={() =>
              router.push(`/employer/streams/${sessionId}/analytics`)
            }
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-700 text-sm">
                Xem Analytics
              </p>
              <p className="text-xs text-slate-400">
                Viewers, apply rate, AI summary
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>
    </div>
  );
}