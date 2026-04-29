"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  X, Send, MessageSquare, HelpCircle, ChevronDown,
  Users, Briefcase, ChevronUp, Loader, WifiOff, Eye,
} from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useAuth } from "@/application/contexts/AuthContext";

const service = new LiveStreamService(new LiveStreamRepository());

type TabType = "chat" | "qa";

// ── Khớp với ChatMessagePayload từ backend ──────────────────
interface WsChatMessagePayload {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: "CANDIDATE" | "EMPLOYER" | "SYSTEM";
  content: string;
  sentAt: string;
}

// ── Khớp với QAQuestionPayload từ backend ───────────────────
interface WsQAQuestionPayload {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  question: string;
  answered: boolean;
  askedAt: string;
}

// ── Viewer count event từ backend ───────────────────────────
interface WsViewerCountEvent {
  type: "VIEWER_COUNT_UPDATE";
  payload: {
    count: number;
  };
}

// ── WsPayload envelope từ backend ───────────────────────────
type WsPayload<T> = {
  type: string;
  data: T;
  timestamp: string;
};

interface ChatMsg {
  id: string;
  senderName: string;
  content: string;
  type: "CHAT" | "Q_AND_A" | "SYSTEM";
  time: string;
  isMe?: boolean;
}

interface PollData {
  eventId: string;
  question: string;
  options: string[];
  responses: Record<number, number>;
  myAnswer: number | null;
}

interface SpotlightJob {
  jobPostId: string;
  title?: string;
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
      <Eye className={`w-3.5 h-3.5 transition-all duration-300 ${isIncreasing ? 'text-emerald-400 scale-110' : 'text-white/40'}`} />
      <span className={`font-mono text-xs transition-all duration-300 ${isIncreasing ? 'text-emerald-400' : 'text-white/40'}`}>
        {animatedCount}
      </span>
    </div>
  );
}

// ─── Video Area ───────────────────────────────────────────────
function VideoArea({ viewerCount }: { viewerCount: number }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: true,
  });
  const mainTrack = tracks.find(
    (t) => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare
  );

  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
      {mainTrack ? (
        <VideoTrack trackRef={mainTrack} className="w-full h-full object-contain" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
          <Loader className="w-8 h-8 animate-spin mb-2" />
          <p className="text-xs">Đang kết nối...</p>
        </div>
      )}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          LIVE
        </div>
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2 py-1 rounded-full">
          <Users className="w-3 h-3" />
          <ViewerCountDisplay count={viewerCount} />
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

// ─── Poll Banner ──────────────────────────────────────────────
function PollBanner({ poll, onAnswer }: { poll: PollData; onAnswer: (idx: number) => void }) {
  const total = Object.values(poll.responses).reduce((a, b) => a + b, 0);
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 mx-4 shadow-md">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">📊 Poll</p>
      <p className="font-semibold text-slate-800 text-sm mb-3">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const count = poll.responses[i] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const chosen = poll.myAnswer === i;
          return (
            <button
              key={i}
              onClick={() => poll.myAnswer === null && onAnswer(i)}
              disabled={poll.myAnswer !== null}
              className={`w-full text-left rounded-lg overflow-hidden transition-all ${
                poll.myAnswer !== null ? "cursor-default" : "hover:border-slate-300"
              }`}
            >
              <div className={`relative flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
                chosen ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white"
              }`}>
                {poll.myAnswer !== null && (
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-100 rounded-l-lg transition-all"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className={`relative z-10 flex-1 ${chosen ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                  {opt}
                </span>
                {poll.myAnswer !== null && (
                  <span className="relative z-10 text-xs text-slate-400 font-mono">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {poll.myAnswer === null && (
        <p className="text-xs text-slate-400 mt-2">Chọn một đáp án để tham gia</p>
      )}
    </div>
  );
}

// ─── Spotlight Banner ─────────────────────────────────────────
function SpotlightBanner({
  job,
  onApply,
  onDismiss,
}: {
  job: SpotlightJob;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mx-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-amber-700 font-semibold">Vị trí đang tuyển</p>
        <p className="text-sm font-bold text-slate-800 truncate">
          {job.title ?? `Job #${job.jobPostId.slice(0, 8)}`}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onApply}
          className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────
function ChatPanel({
  messages,
  tab,
  onTabChange,
  onSend,
  onAsk,
  sending,
}: {
  messages: ChatMsg[];
  tab: TabType;
  onTabChange: (t: TabType) => void;
  onSend: (msg: string) => void;
  onAsk: (q: string) => void;
  sending: boolean;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = messages.filter((m) =>
    tab === "qa" ? m.type === "Q_AND_A" : m.type !== "Q_AND_A"
  );

  const handleSend = () => {
    if (!input.trim() || sending) return;
    if (tab === "chat") onSend(input.trim());
    else onAsk(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b border-slate-100 flex-shrink-0">
        {(["chat", "qa"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              tab === t
                ? "text-slate-800 border-b-2 border-slate-800"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "chat" ? (
              <><MessageSquare className="w-3.5 h-3.5" />Chat</>
            ) : (
              <><HelpCircle className="w-3.5 h-3.5" />Q&A</>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 text-xs text-center pt-8">
            {tab === "qa" ? (
              <><HelpCircle className="w-8 h-8 mb-2" />Chưa có câu hỏi nào<br />Hãy là người đầu tiên đặt câu hỏi!</>
            ) : (
              <><MessageSquare className="w-8 h-8 mb-2" />Chưa có tin nhắn</>
            )}
          </div>
        )}
        {filtered.map((m) =>
          m.type === "SYSTEM" ? (
            <div key={m.id} className="text-center">
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                {m.content}
              </span>
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  m.isMe
                    ? "bg-slate-800 text-white rounded-br-sm"
                    : tab === "qa"
                    ? "bg-amber-50 border border-amber-100 text-slate-700 rounded-bl-sm"
                    : "bg-slate-50 text-slate-700 rounded-bl-sm"
                }`}
              >
                {!m.isMe && (
                  <p className="text-xs font-semibold mb-0.5 opacity-60">{m.senderName}</p>
                )}
                <p className="leading-relaxed">{m.content}</p>
                <p className={`text-xs mt-1 ${m.isMe ? "text-white/40" : "text-slate-400"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={tab === "qa" ? "Đặt câu hỏi cho host..." : "Nhắn tin..."}
            maxLength={tab === "qa" ? 500 : 300}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-slate-400 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 disabled:opacity-40 transition-all flex-shrink-0"
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        {tab === "qa" && (
          <p className="text-xs text-slate-300 mt-1.5 text-right">{input.length}/500</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Viewer Page ─────────────────────────────────────────
export default function CandidateViewerPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { subscribeTopic, publishMessage } = useWebSocket();
  const { user } = useAuth(); // Lấy user từ auth context

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [tab, setTab] = useState<TabType>("chat");
  const [chatOpen, setChatOpen] = useState(true);
  const [sending, setSending] = useState(false);

  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [spotlightJob, setSpotlightJob] = useState<SpotlightJob | null>(null);

  // Lấy current user ID từ auth context
  const currentUserId = user?.id;

  // Load session info
  useEffect(() => {
    const loadSession = async () => {
      try {
        const s = await service.getSession(sessionId);
        setSession(s);
        setViewerCount(s.viewerCount || 0);
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };
    loadSession();
  }, [sessionId]);

  // Join stream
  useEffect(() => {
    setJoining(true);
    service
      .joinStream(sessionId)
      .then((res) => {
        setToken(res.viewerToken);
        setLivekitUrl(res.livekitUrl);
        setViewerCount(res.currentViewerCount);
      })
      .catch((err) => {
        console.error("Failed to join stream:", err);
        setError("Không thể tham gia phiên stream này");
      })
      .finally(() => setJoining(false));
  }, [sessionId]);

  // ── Subscribe to realtime viewer count events ─────────────────
  // Backend publishes to: /topic/stream/{sessionId}/events
  // Event format: { type: "VIEWER_COUNT_UPDATE", payload: { count: number } }
  useEffect(() => {
    const unsubEvents = subscribeTopic(
      `/topic/stream/${sessionId}/events`,
      (event: WsViewerCountEvent) => {
        if (event.type === "VIEWER_COUNT_UPDATE") {
          setViewerCount(event.payload.count);
        }
      }
    );
    return () => unsubEvents();
  }, [sessionId, subscribeTopic]);

  // ── Subscribe /topic/streams/{id}/chat ─────────────────────
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
              senderName: d.senderName,
              content: d.content,
              type: "CHAT",
              time: new Date(d.sentAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: d.senderId === currentUserId,
            },
          ];
        });
      }
    );

    return () => unsubChat();
  }, [sessionId, subscribeTopic, currentUserId]);

  // ── Subscribe /topic/streams/{id}/qa ───────────────────────
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
              senderName: d.candidateName,
              content: d.question,
              type: "Q_AND_A",
              time: new Date(d.askedAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: d.candidateId === currentUserId,
            },
          ];
        });
      }
    );

    return () => unsubQA();
  }, [sessionId, subscribeTopic, currentUserId]);

  // ── Subscribe invite slot (user-specific) ──────────────────
  useEffect(() => {
    const unsubInvite = subscribeTopic(
      `/user/queue/stream-invite`,
      (invite) => {
        console.log("Interview invite received:", invite);
        // TODO: show invite modal
      }
    );
    return () => unsubInvite();
  }, [subscribeTopic]);

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

  // ── Gửi chat qua WebSocket ─────────────────────────────────
  const handleSendChat = useCallback(
    (msg: string) => {
      setSending(true);
      try {
        publishMessage(`/app/streams/${sessionId}/chat`, {
          content: msg,
        });
        // Optimistic update
        setMessages((prev) => [
          ...prev,
          {
            id: `opt-${Date.now()}`,
            senderName: "Bạn",
            content: msg,
            type: "CHAT" as const,
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: true,
          },
        ]);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setSending(false);
      }
    },
    [sessionId, publishMessage]
  );

  // ── Gửi Q&A qua REST ──────────────────────────────────────
  const handleAskQuestion = useCallback(
    async (q: string) => {
      setSending(true);
      try {
        await service.submitQuestion(sessionId, q);
      } catch (error) {
        console.error("Failed to submit question:", error);
      } finally {
        setSending(false);
      }
    },
    [sessionId]
  );

  const handlePollAnswer = useCallback(
    async (idx: number) => {
      if (!activePoll) return;
      setActivePoll((prev) => (prev ? { ...prev, myAnswer: idx } : prev));
      try {
        await service.respondToPoll(sessionId, activePoll.eventId, idx);
      } catch (error) {
        console.error("Failed to respond to poll:", error);
      }
    },
    [sessionId, activePoll]
  );

  if (joining) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Đang kết nối...</p>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <WifiOff className="w-12 h-12 text-white/20" />
        <p className="text-white/60 font-medium">{error ?? "Không thể kết nối"}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-white/40 underline hover:text-white/60 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">
            {session?.title ?? "Live Stream"}
          </h1>
          <p className="text-xs text-white/30">
            {session?.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn"}
          </p>
        </div>
        <ViewerCountDisplay count={viewerCount} />
      </div>

      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        video={false}
        audio={false}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="flex-shrink-0">
          <VideoArea viewerCount={viewerCount} />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {activePoll && (
            <div className="py-3 flex-shrink-0">
              <PollBanner poll={activePoll} onAnswer={handlePollAnswer} />
            </div>
          )}

          {spotlightJob && (
            <div className="pb-3 flex-shrink-0">
              <SpotlightBanner
                job={spotlightJob}
                onApply={() =>
                  router.push(
                    `/jobs/${spotlightJob.jobPostId}/apply?from=stream&session=${sessionId}`
                  )
                }
                onDismiss={() => setSpotlightJob(null)}
              />
            </div>
          )}

          <div className="px-4 py-2 flex-shrink-0">
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat & Q&A
                {messages.filter((m) => m.type !== "SYSTEM").length > 0 && (
                  <span className="bg-white/20 text-white text-xs px-1.5 rounded-full">
                    {messages.filter((m) => m.type !== "SYSTEM").length}
                  </span>
                )}
              </span>
              {chatOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {chatOpen && (
            <div className="flex-1 overflow-hidden mx-4 mb-4 rounded-2xl border border-white/5 shadow-lg">
              <ChatPanel
                messages={messages}
                tab={tab}
                onTabChange={setTab}
                onSend={handleSendChat}
                onAsk={handleAskQuestion}
                sending={sending}
              />
            </div>
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
}