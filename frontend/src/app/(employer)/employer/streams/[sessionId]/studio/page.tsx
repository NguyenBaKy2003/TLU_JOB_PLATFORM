// presentation/components/stream/employer/EmployerStudioPage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LiveKitRoom, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import { MessageCircle, Pin, Square } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { VideoArea } from "@/presentation/components/stream/common/VideoArea";
import { ViewerCount } from "@/presentation/components/stream/common/ViewerCount";
import { ChatPanel, type ChatMessageData } from "@/presentation/components/stream/common/ChatPanel";
import { LiveIndicator } from "@/presentation/components/stream/common/LiveIndicator";
import { LoadingScreen } from "@/presentation/components/stream/common/LoadingScreen";
import { ConfirmEndModal, SpotlightPanel, StartScreen } from "@/presentation/components/stream/employer";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const service = new LiveStreamService(new LiveStreamRepository());

interface WsChatMessagePayload {
  id: string; sessionId: string; senderId: string; senderName: string;
  senderRole: "CANDIDATE" | "EMPLOYER" | "SYSTEM"; content: string; sentAt: string;
}
interface WsQAQuestionPayload {
  id: string; sessionId: string; candidateId: string; candidateName: string;
  question: string; answered: boolean; askedAt: string;
}
type WsPayload<T> = { type: string; data: T; timestamp: string };

export default function EmployerStudioPage() {
  const params    = useParams<{ sessionId: string }>();
  const router    = useRouter();
  const sessionId = params.sessionId;
  const { subscribeTopic, publishMessage } = useWebSocket();
  const { error: toastError, success: toastSuccess, warning: toastWarning } = useToast();

  const [session,         setSession]         = useState<LiveStreamSession | null>(null);
  const [token,           setToken]           = useState<string | null>(null);
  const [livekitUrl,      setLivekitUrl]      = useState("");
  const [starting,        setStarting]        = useState(false);
  const [ending,          setEnding]          = useState(false);
  const [sending,         setSending]         = useState(false);
  const [spotlighting,    setSpotlighting]    = useState(false);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  const [activeTab,       setActiveTab]       = useState<"chat" | "spotlight">("chat");
  const [messages,        setMessages]        = useState<ChatMessageData[]>([]);
  const [viewerCount,     setViewerCount]     = useState(0);
  const [elapsed,         setElapsed]         = useState(0);
  const [spotlightedJobs, setSpotlightedJobs] = useState<string[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const s = await service.getSession(sessionId);
        setSession(s);
        setViewerCount(s.viewerCount || 0);
      } catch (e) {
        toastError("Không thể tải phiên", extractErrorMessage(e));
      }
    };
    loadSession();
  }, [sessionId]);

  const sessionIdRef = useRef(sessionId);
  const isLiveRef    = useRef(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await service.startStream(sessionId);
      setToken(res.hostToken);
      setLivekitUrl(res.livekitUrl);
      isLiveRef.current = true;
      toastSuccess("Đã bắt đầu stream", "Phiên tuyển dụng trực tiếp đang phát sóng");
    } catch (e) {
      toastError("Không thể bắt đầu", extractErrorMessage(e));
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isLiveRef.current) {
        service.endStream(sessionIdRef.current).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [token]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    const unsub = subscribeTopic(`/topic/stream/${sessionId}/events`, (event: any) => {
      if (event.type === "VIEWER_COUNT_UPDATE") setViewerCount(event.payload.count);
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/chat`, (wsPayload: WsPayload<WsChatMessagePayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, { id: d.id, senderName: d.senderName, content: d.content, type: "CHAT", time: new Date(d.sentAt) }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/qa`, (wsPayload: WsPayload<WsQAQuestionPayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, { id: d.id, senderName: d.candidateName, content: d.question, type: "Q_AND_A", time: new Date(d.askedAt) }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  const handleSendMessage = useCallback((content: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content });
    } catch (e) {
      toastError("Gửi tin thất bại", extractErrorMessage(e));
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  const handleSpotlight = useCallback(async (jobId: string) => {
    setSpotlighting(true);
    try {
      await service.spotlightJob(sessionId, { jobPostId: jobId });
      setSpotlightedJobs(prev => [jobId, ...prev]);
      toastSuccess("Đã spotlight", "Tin tuyển dụng đã được ghim lên màn hình khán giả");
    } catch (e) {
      toastError("Spotlight thất bại", extractErrorMessage(e));
    } finally {
      setSpotlighting(false);
    }
  }, [sessionId]);

  const handleEnd = async () => {
    setEnding(true);
    try {
      await service.endStream(sessionId);
      isLiveRef.current = false;
      toastSuccess("Đã kết thúc stream", "Phiên tuyển dụng đã kết thúc thành công");
      router.push(`/employer/streams/${sessionId}`);
    } catch (e) {
      toastError("Kết thúc thất bại", extractErrorMessage(e));
    } finally {
      setEnding(false);
      setShowEndConfirm(false);
    }
  };

  if (!session) return <LoadingScreen />;
  if (!token)   return <StartScreen session={session} onStart={handleStart} starting={starting} />;

  const messageCount = messages.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <LiveIndicator className="bg-red-500" />

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[13px] font-semibold text-slate-700">
              {formatElapsed(elapsed)}
            </span>
          </div>

          <span className="text-[13px] font-medium text-slate-500 truncate">
            {session.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <ViewerCount count={viewerCount} variant="dark" />
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={ending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200
              rounded-lg text-red-500 text-[13px] font-semibold hover:bg-red-100 disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Kết thúc
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video side */}
        <div className="flex-1 p-5 flex flex-col min-w-0 gap-4">
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={token}
            connect video audio
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex-1 min-h-0">
              <VideoArea viewerCount={viewerCount} showControls />
            </div>
            <div className="shrink-0">
              <ControlBar
                controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: false }}
                className="!bg-white !rounded-xl !border !border-slate-200 !px-5 !py-2.5"
              />
            </div>
          </LiveKitRoom>
        </div>

        {/* Right panel */}
        <div className="w-[340px] shrink-0 border-l border-slate-200 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex p-2 gap-1 border-b border-slate-200 shrink-0">
            {(["chat", "spotlight"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
                  ${activeTab === t
                    ? "bg-slate-100 text-slate-800"
                    : "bg-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {t === "chat" ? (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                    {messageCount > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                        {messageCount}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5" />
                    Jobs
                    {spotlightedJobs.length > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                        {spotlightedJobs.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "chat" ? (
              <ChatPanel
                messages={messages}
                onSend={handleSendMessage}
                sending={sending}
                variant="employer"
                placeholder="Nhắn tin với khán giả..."
              />
            ) : (
              <SpotlightPanel
                sessionId={sessionId}
                onSpotlight={handleSpotlight}
                spotlighting={spotlighting}
                spotlightedJobs={spotlightedJobs}
                onRemove={id => setSpotlightedJobs(p => p.filter(j => j !== id))}
              />
            )}
          </div>
        </div>
      </div>

      {showEndConfirm && (
        <ConfirmEndModal onConfirm={handleEnd} onCancel={() => setShowEndConfirm(false)} />
      )}
    </div>
  );
}