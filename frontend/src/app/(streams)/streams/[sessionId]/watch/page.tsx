// presentation/components/stream/candidate/CandidateViewerPage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LiveKitRoom, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import { X, MessageCircle, HelpCircle } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useAuth } from "@/application/contexts/AuthContext";
import { VideoArea } from "@/presentation/components/stream/common/VideoArea";
import { ViewerCount } from "@/presentation/components/stream/common/ViewerCount";
import { ChatPanel, type ChatMessageData } from "@/presentation/components/stream/common/ChatPanel";
import { LiveIndicator } from "@/presentation/components/stream/common/LiveIndicator";
import { LoadingScreen } from "@/presentation/components/stream/common/LoadingScreen";
import { ErrorScreen } from "@/presentation/components/stream/common/ErrorScreen";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { PollBanner, SpotlightBanner } from "@/presentation/components/stream/candidate";

const service = new LiveStreamService(new LiveStreamRepository());

type TabType = "chat" | "qa";

interface WsChatMessagePayload {
  id: string; sessionId: string; senderId: string; senderName: string;
  senderRole: "CANDIDATE" | "EMPLOYER" | "SYSTEM"; content: string; sentAt: string;
}
interface WsQAQuestionPayload {
  id: string; sessionId: string; candidateId: string; candidateName: string;
  question: string; answered: boolean; askedAt: string;
}
type WsPayload<T> = { type: string; data: T; timestamp: string };

interface PollData {
  eventId: string; question: string; options: string[];
  responses: Record<number, number>; myAnswer: number | null;
}
interface SpotlightJob { jobPostId: string; title?: string }

export default function CandidateViewerPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { subscribeTopic, publishMessage } = useWebSocket();
  const { user } = useAuth();

  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [tab, setTab] = useState<TabType>("chat");
  const [sending, setSending] = useState(false);
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [spotlightJob, setSpotlightJob] = useState<SpotlightJob | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const currentUserId = user?.id;

  useEffect(() => {
    service.getSession(sessionId).then(s => { setSession(s); setViewerCount(s.viewerCount || 0); }).catch(console.error);
  }, [sessionId]);

  useEffect(() => {
    setJoining(true);
    service.joinStream(sessionId)
      .then(res => {
        setToken(res.viewerToken);
        setLivekitUrl(res.livekitUrl);
        setViewerCount(res.currentViewerCount);
        setCanPublish(res.canPublish);
      })
      .catch(() => setError("Không thể tham gia phiên stream này"))
      .finally(() => setJoining(false));
  }, [sessionId]);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => { return () => { service.leaveStream(sessionIdRef.current).catch(() => {}); }; }, []);

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
        return [...prev, { id: d.id, senderName: d.senderName, content: d.content, type: "CHAT", time: new Date(d.sentAt), isMe: d.senderId === currentUserId }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId]);

  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/qa`, (wsPayload: WsPayload<WsQAQuestionPayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, { id: d.id, senderName: d.candidateName, content: d.question, type: "Q_AND_A", time: new Date(d.askedAt), isMe: d.candidateId === currentUserId }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId]);

  useEffect(() => {
    const unsub = subscribeTopic(`/user/queue/stream-invite`, (invite: any) => { console.log("Invite:", invite); });
    return () => unsub();
  }, [subscribeTopic]);

  const handleSendChat = useCallback((msg: string) => {
    setSending(true);
    try { publishMessage(`/app/streams/${sessionId}/chat`, { content: msg }); }
    finally { setSending(false); }
  }, [sessionId, publishMessage]);

  const handleAskQuestion = useCallback(async (q: string) => {
    setSending(true);
    try { await service.submitQuestion(sessionId, q); }
    finally { setSending(false); }
  }, [sessionId]);

  const handlePollAnswer = useCallback(async (idx: number) => {
    if (!activePoll) return;
    setActivePoll(prev => prev ? { ...prev, myAnswer: idx } : prev);
    try { await service.respondToPoll(sessionId, activePoll.eventId, idx); } catch {}
  }, [sessionId, activePoll]);

  if (joining) return <LoadingScreen />;
  if (error || !token) return <ErrorScreen message={error ?? "Không thể kết nối"} onBack={() => router.back()} />;

  const messageCount = messages.filter(m => m.type !== "SYSTEM").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <LiveIndicator className="bg-red-500" />

          <span className="text-[13px] font-medium text-slate-800 truncate">
            {session?.title ?? "Live Stream"}
          </span>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {session?.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {canPublish && (
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden sm:inline">
              Mic & Cam
            </span>
          )}
          <ViewerCount count={viewerCount} variant="dark" />

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[13px] font-semibold hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            Rời
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex  flex-1 overflow-hidden">
        {/* Video side */}
        <div className="flex-1 p-5 flex flex-col min-w-0 gap-4">
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={token}
            connect
            video={canPublish}
            audio={canPublish}
            className="flex-1 flex  flex-col gap-4"
          >
            <div className="flex-1 min-h-0">
              <VideoArea
                viewerCount={viewerCount}
                showControls={false}
                canPublish={canPublish}
              />
            </div>

            {/* ControlBar + Banners */}
            <div className="shrink-0 flex flex-col gap-3">
              {canPublish && (
                <ControlBar
                  controls={{
                    microphone: true,
                    camera: true,
                    screenShare: false,
                    chat: false,
                    leave: false,
                  }}
                  className="!bg-white !rounded-xl !border !border-slate-200 !px-5 !py-2.5"
                />
              )}
              {activePoll && <PollBanner poll={activePoll} onAnswer={handlePollAnswer} />}
              {spotlightJob && (
                <SpotlightBanner
                  job={spotlightJob}
                  onApply={() => router.push(`/jobs/${spotlightJob.jobPostId}/apply?from=stream&session=${sessionId}`)}
                  onDismiss={() => setSpotlightJob(null)}
                />
              )}
            </div>
          </LiveKitRoom>
        </div>

        {/* Right panel */}
        <div className="w-[340px] shrink-0 border-l border-slate-200 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex p-2 gap-1 border-b border-slate-200 shrink-0">
            {(["chat", "qa"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
                  ${tab === t
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
                    <HelpCircle className="w-3.5 h-3.5" />
                    Q&A
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              onSend={(content) => tab === "chat" ? handleSendChat(content) : handleAskQuestion(content)}
              sending={sending}
              variant="candidate"
              placeholder={tab === "qa" ? "Đặt câu hỏi cho host..." : "Nhắn tin..."}
              maxLength={tab === "qa" ? 500 : 300}
              filterFn={(m, t) => t === "qa" ? m.type === "Q_AND_A" : m.type !== "Q_AND_A"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}