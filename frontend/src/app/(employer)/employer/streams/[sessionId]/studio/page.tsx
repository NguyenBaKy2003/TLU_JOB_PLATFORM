"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, VideoTrack, useTracks,
  ControlBar, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  Radio, Square, Users, Briefcase, MessageSquare,
  Pin, X, AlertTriangle, Eye, Send,
} from "lucide-react";

import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";

const service = new LiveStreamService(new LiveStreamRepository());

// ── Types khớp backend payload ──────────────────────────────
interface WsChatMessagePayload {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: "CANDIDATE" | "EMPLOYER" | "SYSTEM";
  content: string;
  sentAt: string;
}

interface WsQAQuestionPayload {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  question: string;
  answered: boolean;
  askedAt: string;
}

interface WsViewerCountEvent {
  type: "VIEWER_COUNT_UPDATE";
  payload: {
    count: number;
  };
}

type WsPayload<T> = {
  type: string;
  data: T;
  timestamp: string;
};

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "CHAT" | "Q_AND_A" | "SYSTEM";
  time: Date;
}

// ─── Viewer Count Component with Animation ───────────────────
function ViewerCountDisplay({ count }: { count: number }) {
  const [animatedCount, setAnimatedCount] = useState(count);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (count > animatedCount) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), 500);
      return () => clearTimeout(timer);
    }
    setAnimatedCount(count);
  }, [count, animatedCount]);

  useEffect(() => {
    if (animatedCount !== count) {
      const timer = setTimeout(() => {
        setAnimatedCount(animatedCount + (count > animatedCount ? 1 : -1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animatedCount, count]);

  return (
    <div className="flex items-center gap-1.5">
      <Eye className={`w-4 h-4 transition-all duration-300 ${isIncreasing ? 'text-emerald-400 scale-110' : 'text-white/60'}`} />
      <span className={`font-mono transition-all duration-300 ${isIncreasing ? 'text-emerald-400' : 'text-white/60'}`}>
        {animatedCount}
      </span>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────
function ChatPanel({ 
  messages, 
  onSendMessage,
  sending 
}: { 
  messages: ChatMessage[]; 
  onSendMessage: (content: string) => void;
  sending: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || sending) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-8">
            Chưa có tin nhắn
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.type === "SYSTEM" ? "text-center" : ""}>
            {m.type === "SYSTEM" ? (
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                {m.content}
              </span>
            ) : (
              <div
                className={`p-2.5 rounded-xl text-sm ${
                  m.type === "Q_AND_A"
                    ? "bg-amber-50 border border-amber-100"
                    : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-semibold text-xs text-slate-700">
                    {m.senderName}
                  </span>
                  {m.type === "Q_AND_A" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      Q&A
                    </span>
                  )}
                  <span className="text-xs text-slate-300 ml-auto">
                    {m.time.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{m.content}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || sending}
            className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spotlight Panel ──────────────────────────────────────────
function SpotlightPanel({
  sessionId,
  onSpotlight,
  spotlighting,
}: {
  sessionId: string;
  onSpotlight: (jobId: string) => void;
  spotlighting: boolean;
}) {
  const [jobId, setJobId] = useState("");

  const handleSpotlight = async () => {
    if (!jobId.trim() || spotlighting) return;
    onSpotlight(jobId.trim());
    setJobId("");
  };

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs text-slate-400">Nhập Job Post ID để ghim lên stream</p>
      <div className="flex gap-2">
        <input
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="Job Post ID"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-slate-400"
        />
        <button
          onClick={handleSpotlight}
          disabled={spotlighting || !jobId.trim()}
          className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {spotlighting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Confirm End Modal ────────────────────────────────────────
function ConfirmEndModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">Kết thúc stream?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Stream sẽ kết thúc ngay lập tức. Hệ thống sẽ tự động xử lý recording và tạo AI summary.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Studio Inner ─────────────────────────────────────────────
function StudioInner({ session }: { session: LiveStreamSession }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {tracks.length > 0 ? (
        <VideoTrack trackRef={tracks[0]} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
          <Radio className="w-16 h-16 mb-3" />
          <p className="text-sm">Camera chưa bật</p>
          <p className="text-xs mt-1">Dùng controls bên dưới để bật camera</p>
        </div>
      )}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          LIVE
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

// ─── Main Studio Page ─────────────────────────────────────────
export default function EmployerStudioPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { subscribeTopic, publishMessage } = useWebSocket();

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState("");
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [sending, setSending] = useState(false);
  const [spotlighting, setSpotlighting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "spotlight">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [spotlightedJobs, setSpotlightedJobs] = useState<string[]>([]);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        const s = await service.getSession(sessionId);
        setSession(s);
        setViewerCount(s.viewerCount || 0);
        
        if (s.status === "LIVE") {
          const res = await service.startStream(sessionId);
          setToken(res.hostToken);
          setLivekitUrl(res.livekitUrl);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };
    
    loadSession();
  }, [sessionId]);

  const handleStart = async () => {
    if (!session) return;
    setStarting(true);
    try {
      const res = await service.startStream(sessionId);
      setToken(res.hostToken);
      setLivekitUrl(res.livekitUrl);
    } catch (error) {
      console.error("Failed to start stream:", error);
    } finally {
      setStarting(false);
    }
  };

  // Timer for stream duration
  useEffect(() => {
    if (!token) return;
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(t);
  }, [token]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── Subscribe to realtime viewer count events ─────────────────
  useEffect(() => {
    const unsubEvents = subscribeTopic(
      `/topic/stream/${sessionId}/events`,
      (event: any) => {
        if (event.type === "VIEWER_COUNT_UPDATE") {
          setViewerCount(event.payload.count);
        }
      }
    );
    return () => unsubEvents();
  }, [sessionId, subscribeTopic]);

  // ── Subscribe to chat messages ───────────────────────────────
  useEffect(() => {
    const unsubChat = subscribeTopic(
      `/topic/streams/${sessionId}/chat`,
      (wsPayload: WsPayload<WsChatMessagePayload>) => {
        const d = wsPayload.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === d.id)) return prev;
          return [
            ...prev,
            {
              id: d.id,
              senderId: d.senderId,
              senderName: d.senderName,
              content: d.content,
              type: "CHAT",
              time: new Date(d.sentAt),
            },
          ];
        });
      }
    );
    return () => unsubChat();
  }, [sessionId, subscribeTopic]);

  // ── Subscribe to Q&A messages ────────────────────────────────
  useEffect(() => {
    const unsubQA = subscribeTopic(
      `/topic/streams/${sessionId}/qa`,
      (wsPayload: WsPayload<WsQAQuestionPayload>) => {
        const d = wsPayload.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === d.id)) return prev;
          return [
            ...prev,
            {
              id: d.id,
              senderId: d.candidateId,
              senderName: d.candidateName,
              content: d.question,
              type: "Q_AND_A",
              time: new Date(d.askedAt),
            },
          ];
        });
      }
    );
    return () => unsubQA();
  }, [sessionId, subscribeTopic]);

  // ── Send chat message ────────────────────────────────────────
  const handleSendMessage = useCallback((content: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content });
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  // ── Handle spotlight ─────────────────────────────────────────
  const handleSpotlight = useCallback(async (jobId: string) => {
    setSpotlighting(true);
    try {
      await service.spotlightJob(sessionId, { jobPostId: jobId });
      setSpotlightedJobs((prev) => [jobId, ...prev]);
    } catch (error) {
      console.error("Failed to spotlight job:", error);
    } finally {
      setSpotlighting(false);
    }
  }, [sessionId]);

  // ── Periodically fetch viewer count as fallback ──────────────
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchViewerCount = async () => {
      const count = await service.getViewerCount(sessionId);
      setViewerCount(count);
    };

    fetchViewerCount();
    const interval = setInterval(fetchViewerCount, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleEnd = async () => {
    setEnding(true);
    try {
      await service.endStream(sessionId);
      router.push(`/employer/streams/${sessionId}`);
    } catch (error) {
      console.error("Failed to end stream:", error);
    } finally {
      setEnding(false);
      setShowEndConfirm(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Radio className="w-9 h-9 text-white/40" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>
        <p className="text-white/40 text-sm mb-8">Bắt đầu stream khi bạn đã sẵn sàng</p>
        <button
          onClick={handleStart}
          disabled={starting}
          className="inline-flex items-center gap-2.5 bg-red-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors text-base"
        >
          {starting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
          )}
          {starting ? "Đang kết nối..." : "Bắt đầu stream"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
            </span>
            LIVE
          </div>
          <span className="text-white/60 text-sm font-mono">{formatElapsed(elapsed)}</span>
          <span className="text-white/40 text-sm truncate hidden sm:block">{session.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <ViewerCountDisplay count={viewerCount} />
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={ending}
            className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Kết thúc
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={token}
            connect={true}
            video={true}
            audio={true}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex-1 min-h-0">
              <StudioInner session={session} />
            </div>
            <div className="flex-shrink-0">
              <ControlBar className="bg-white/5 rounded-xl border border-white/10 px-4 py-2" />
            </div>
          </LiveKitRoom>
        </div>

        {/* Right panel */}
        <div className="w-80 flex-shrink-0 border-l border-white/5 flex flex-col">
          <div className="flex border-b border-white/5">
            {(["chat", "spotlight"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "text-white border-b-2 border-white/40"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {tab === "chat" ? (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat & Q&A
                    {messages.length > 0 && (
                      <span className="bg-white/20 text-white text-xs px-1.5 rounded-full">
                        {messages.length}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5" />
                    Spotlight
                    {spotlightedJobs.length > 0 && (
                      <span className="bg-amber-500/50 text-amber-300 text-xs px-1.5 rounded-full">
                        {spotlightedJobs.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden bg-slate-800/50">
            {activeTab === "chat" && (
              <ChatPanel 
                messages={messages} 
                onSendMessage={handleSendMessage}
                sending={sending}
              />
            )}
            {activeTab === "spotlight" && (
              <SpotlightPanel
                sessionId={sessionId}
                onSpotlight={handleSpotlight}
                spotlighting={spotlighting}
              />
            )}
          </div>

          {activeTab === "spotlight" && spotlightedJobs.length > 0 && (
            <div className="border-t border-white/5 p-3 space-y-2">
              <p className="text-xs text-white/40">Đang ghim</p>
              {spotlightedJobs.map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300 flex-1 truncate font-mono">{id}</span>
                  <button
                    onClick={() => setSpotlightedJobs((p) => p.filter((j) => j !== id))}
                    className="text-white/20 hover:text-white/50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEndConfirm && (
        <ConfirmEndModal
          onConfirm={handleEnd}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  );
}