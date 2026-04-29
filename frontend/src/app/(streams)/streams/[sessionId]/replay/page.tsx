"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Briefcase,
  Loader,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Tag,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ─── Types ────────────────────────────────────────────────────
interface ReplayData {
  videoUrl: string | null;
  aiSummary: string | null;
  topQuestions: string[];
  keyTopics: string[];
  hasApplyCTA: boolean;
}

// ─── Custom Video Player ──────────────────────────────────────
function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const fullscreen = () => videoRef.current?.requestFullscreen();

  return (
    <div
      className="relative w-full bg-black group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Play overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
            <Play className="w-7 h-7 text-slate-800 ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seekbar */}
        <div
          className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/bar"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-white rounded-full relative group-hover/bar:bg-red-400 transition-colors"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-white/80">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={toggleMute} className="text-white/60 hover:text-white">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-white/50 text-xs font-mono flex-1">
            {formatTime((progress / 100) * duration)} / {formatTime(duration)}
          </span>
          <button onClick={fullscreen} className="text-white/60 hover:text-white">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Summary Card ──────────────────────────────────────────
function AISummaryCard({ replay }: { replay: ReplayData }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/5">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">AI Tóm tắt</p>
          <p className="text-white/40 text-xs">Được tạo tự động từ nội dung stream</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-white/30 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Summary text */}
          {replay.aiSummary && (
            <p className="text-white/70 text-sm leading-relaxed">
              {replay.aiSummary}
            </p>
          )}

          {/* Top Questions */}
          {replay.topQuestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3" />
                Câu hỏi phổ biến
              </p>
              <div className="space-y-1.5">
                {replay.topQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-2 bg-white/5 rounded-lg px-3 py-2"
                  >
                    <span className="text-white/20 text-xs font-mono w-4 flex-shrink-0 pt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-white/60 text-sm">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Topics */}
          {replay.keyTopics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Chủ đề chính
              </p>
              <div className="flex flex-wrap gap-2">
                {replay.keyTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/50 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Processing State ─────────────────────────────────────────
function ProcessingCard() {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
        <Loader className="w-4 h-4 text-amber-500 animate-spin" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">AI đang xử lý</p>
        <p className="text-xs text-slate-400">
          Tóm tắt sẽ sẵn sàng sau vài phút. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}

// ─── Apply CTA ────────────────────────────────────────────────
function ApplyCTA({
  sessionId,
  onApply,
}: {
  sessionId: string;
  onApply: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            Quan tâm đến vị trí tuyển dụng?
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Ứng tuyển các vị trí được giới thiệu trong phiên này
          </p>
        </div>
      </div>
      <button
        onClick={onApply}
        className="w-full py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
      >
        <Briefcase className="w-4 h-4" />
        Xem vị trí tuyển dụng
      </button>
    </div>
  );
}

// ─── Main Replay Page ─────────────────────────────────────────
export default function StreamReplayPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);

  useEffect(() => {
    // Load session title from upcoming (may not be in list if ended)
    service.getUpcomingStreams().then((list) => {
      const s = list.find((x) => x.id === sessionId);
      if (s) setSession(s);
    });

    // Load replay data
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/streams/${sessionId}/replay`,
      { credentials: "include" }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Not ready");
        return r.json();
      })
      .then((json) => setReplay(json.data))
      .catch(() => setNotReady(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (notReady || !replay) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <Clock className="w-7 h-7 text-slate-300" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 mb-1">Replay chưa sẵn sàng</h2>
          <p className="text-slate-400 text-sm">
            Recording đang được xử lý. Vui lòng quay lại sau ít phút.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 underline hover:text-slate-700 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

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
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-800 truncate text-sm">
              {session?.title ?? "Xem lại phiên stream"}
            </h1>
            <p className="text-xs text-slate-400">Replay</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Video */}
        {replay.videoUrl ? (
          <VideoPlayer url={replay.videoUrl} />
        ) : (
          <div
            className="w-full bg-slate-200 flex items-center justify-center"
            style={{ aspectRatio: "16/9" }}
          >
            <div className="text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Video chưa sẵn sàng</p>
            </div>
          </div>
        )}

        <div className="px-4 py-6 space-y-4">
          {/* Session title */}
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {session?.title ?? "Phiên stream"}
            </h2>
            {session && (
              <p className="text-slate-400 text-sm mt-0.5">
                {new Date(session.scheduledAt).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* AI Summary */}
          {replay.aiSummary ? (
            <AISummaryCard replay={replay} />
          ) : (
            <ProcessingCard />
          )}

          {/* Apply CTA */}
          {replay.hasApplyCTA && (
            <ApplyCTA
              sessionId={sessionId}
              onApply={() => router.push(`/jobs?from=stream&session=${sessionId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}