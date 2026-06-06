"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LiveKitRoom, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import { X, MessageCircle, HelpCircle, Play, ChevronDown } from "lucide-react";
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
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import type { SubmitApplicationRequest } from "@/domain/models/Application";
import { ApplyModal } from "@/presentation/components/job-detail/ApplyModal";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const service         = new LiveStreamService(new LiveStreamRepository());
const applicationRepo = new ApplicationRepository();

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
  const params    = useParams<{ sessionId: string }>();
  const router    = useRouter();
  const sessionId = params.sessionId;

  const { subscribeTopic, publishMessage, isConnected } = useWebSocket();
  const { user } = useAuth();
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  const [session,          setSession]          = useState<LiveStreamSession | null>(null);
  const [token,            setToken]            = useState<string | null>(null);
  const [livekitUrl,       setLivekitUrl]       = useState("");
  const [loadingSession,   setLoadingSession]   = useState(true);
  const [joining,          setJoining]          = useState(false);
  const [hasJoined,        setHasJoined]        = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [viewerCount,      setViewerCount]      = useState(0);
  const [messages,         setMessages]         = useState<ChatMessageData[]>([]);
  const [tab,              setTab]              = useState<TabType>("chat");
  const [sending,          setSending]          = useState(false);
  const [activePoll,       setActivePoll]       = useState<PollData | null>(null);
  const [spotlightJob,     setSpotlightJob]     = useState<SpotlightJob | null>(null);
  const [canPublish,       setCanPublish]       = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [applyModalOpen,   setApplyModalOpen]   = useState(false);

  const currentUserId = user?.id;

  // ── Load session ───────────────────────────────────────────────
  useEffect(() => {
    service.getSession(sessionId)
      .then(s => { setSession(s); setViewerCount(s.viewerCount || 0); })
      .catch(e => setError(extractErrorMessage(e, "Không thể tải phiên stream")))
      .finally(() => setLoadingSession(false));
  }, [sessionId]);

  // ── Join ───────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      const res = await service.joinStream(sessionId);
      setToken(res.viewerToken);
      setLivekitUrl(res.livekitUrl);
      setViewerCount(res.currentViewerCount);
      setCanPublish(res.canPublish);
      setHasJoined(true);
    } catch (e) {
      toastError("Không thể tham gia", extractErrorMessage(e));
      setError(extractErrorMessage(e, "Không thể tham gia phiên stream này"));
    } finally {
      setJoining(false);
    }
  }, [sessionId]);

  // ── Leave on unmount ───────────────────────────────────────────
  const sessionIdRef = useRef(sessionId);
  const hasJoinedRef = useRef(hasJoined);
  useEffect(() => { hasJoinedRef.current = hasJoined; }, [hasJoined]);
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current) {
        service.leaveStream(sessionIdRef.current).catch(() => {});
      }
    };
  }, []);

  // ── Stream events ──────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const unsub = subscribeTopic(
      `/topic/streams/${sessionId}/events`,
      (event: any) => {
        const payload = event.payload ?? event.data ?? {};
        switch (event.type) {
          case "VIEWER_COUNT_UPDATE":
            setViewerCount(payload.count ?? 0);
            break;

          case "JOB_SPOTLIGHT": {
            const d = typeof payload === "string" ? JSON.parse(payload) : payload;
            if (d?.jobPostId) {
              setSpotlightJob({
                jobPostId:   d.jobPostId,
                title:       d.title       ?? "Việc làm nổi bật",
                companyName: d.companyName ?? "",
                location:    d.location    ?? "",
                salaryRange: d.salaryRange ?? "",
              });
              toastInfo("Việc làm mới!", `${d.title ?? "Việc làm nổi bật"} vừa được giới thiệu`);
            }
            break;
          }

          case "POLL_STARTED":
            setActivePoll({
              eventId:   payload.eventId ?? payload.id,
              question:  payload.question,
              options:   payload.options ?? [],
              responses: {},
              myAnswer:  null,
            });
            break;

          case "POLL_ENDED":
            setActivePoll(null);
            break;
        }
      }
    );
    return () => unsub();
  }, [sessionId, subscribeTopic, isConnected]);

  // ── Chat messages ──────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const unsub = subscribeTopic(
      `/topic/streams/${sessionId}/chat`,
      (wsPayload: WsPayload<WsChatMessagePayload>) => {
        const d = wsPayload.data;
        setMessages(prev => {
          if (prev.some(m => m.id === d.id)) return prev;
          return [...prev, {
            id: d.id, senderName: d.senderName, content: d.content,
            type: "CHAT" as const, time: new Date(d.sentAt),
            isMe: d.senderId === currentUserId,
          }];
        });
      }
    );
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId, isConnected]);

  // ── Q&A messages ───────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const unsub = subscribeTopic(
      `/topic/streams/${sessionId}/qa`,
      (wsPayload: WsPayload<WsQAQuestionPayload>) => {
        const d = wsPayload.data;
        setMessages(prev => {
          if (prev.some(m => m.id === d.id)) return prev;
          return [...prev, {
            id: d.id, senderName: d.candidateName, content: d.question,
            type: "Q_AND_A" as const, time: new Date(d.askedAt),
            isMe: d.candidateId === currentUserId,
          }];
        });
      }
    );
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId, isConnected]);

  // ── Interview invite ───────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const unsub = subscribeTopic(
      `/user/queue/stream-invite`,
      (invite: any) => { console.log("Invite:", invite); }
    );
    return () => unsub();
  }, [subscribeTopic, isConnected]);

  // ── Send handlers ──────────────────────────────────────────────
  const handleSendChat = useCallback((msg: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content: msg });
    } catch (e) {
      toastError("Gửi tin thất bại", extractErrorMessage(e));
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  const handleAskQuestion = useCallback((q: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/qa`, { question: q });
    } catch (e) {
      toastError("Gửi câu hỏi thất bại", extractErrorMessage(e));
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  const handlePollAnswer = useCallback(async (idx: number) => {
    if (!activePoll) return;
    setActivePoll(prev => prev ? { ...prev, myAnswer: idx } : prev);
    try {
      await service.respondToPoll(sessionId, activePoll.eventId, idx);
    } catch (e) {
      toastError("Gửi câu trả lời thất bại", extractErrorMessage(e));
    }
  }, [sessionId, activePoll]);

  const handleLeave = useCallback(async () => {
    if (hasJoined) {
      try { await service.leaveStream(sessionId); } catch {}
    }
    router.back();
  }, [sessionId, hasJoined, router]);

  // ── Apply from stream ──────────────────────────────────────────
  const handleApplyFromStream = useCallback(
    async (cvUrl: string, coverLetter: string, expectedSalary: string) => {
      if (!spotlightJob) return;
      try {
        const req: SubmitApplicationRequest = {
          jobPostId:      spotlightJob.jobPostId,
          cvUrl,
          coverLetter:    coverLetter    || undefined,
          expectedSalary: expectedSalary || undefined,
        };
        await applicationRepo.submit(req);
        toastSuccess("Ứng tuyển thành công", `Đã nộp đơn cho "${spotlightJob.title ?? "việc làm này"}"`);
        setApplyModalOpen(false);
        setSpotlightJob(null);
      } catch (e) {
        toastError("Ứng tuyển thất bại", extractErrorMessage(e));
      }
    },
    [spotlightJob],
  );

  // ── Guards ─────────────────────────────────────────────────────
  if (loadingSession) return <LoadingScreen />;
  if (error)          return <ErrorScreen message={error} onBack={() => router.back()} />;

  // ── Màn hình chờ ───────────────────────────────────────────────
  if (!hasJoined || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <LiveIndicator className="bg-red-500" />
            <span className="text-[13px] font-medium text-slate-800 truncate">
              {session?.title ?? "Live Stream"}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {session?.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ViewerCount count={viewerCount} variant="dark" />
            <button
              onClick={handleLeave}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[13px] font-semibold hover:bg-slate-200"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
              <Play className="w-8 h-8 text-red-500 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                {session?.title ?? "Live Stream"}
              </h2>
              <p className="text-[16px] text-slate-500">
                Bấm vào xem để tham gia phiên live stream này
              </p>
            </div>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-500 text-white
                rounded-xl font-semibold text-[16px] hover:bg-red-600
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {joining ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang kết nối...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Vào xem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Live viewer ────────────────────────────────────────────────
  const chatMessages = messages.filter(m => m.type === "CHAT" || m.type === "SYSTEM");
  const qaMessages   = messages.filter(m => m.type === "Q_AND_A");
  const messageCount = messages.filter(m => m.type !== "SYSTEM").length;

  const panelContent = (
    <>
      <div className="flex p-2 gap-1 border-b border-slate-200 shrink-0">
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
            ${tab === "chat" ? "bg-slate-100 text-slate-800" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
          {chatMessages.length > 0 && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
              {chatMessages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("qa")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
            ${tab === "qa" ? "bg-slate-100 text-slate-800" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Q&A
          {qaMessages.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
              {qaMessages.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <ChatPanel
          messages={tab === "chat" ? chatMessages : qaMessages}
          onSend={tab === "chat" ? handleSendChat : handleAskQuestion}
          sending={sending}
          variant="candidate"
          placeholder={tab === "qa" ? "Đặt câu hỏi cho host..." : "Nhắn tin..."}
          maxLength={tab === "qa" ? 500 : 300}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <LiveIndicator className="bg-red-500" />
          <span className="text-[13px] font-medium text-slate-800 truncate">
            {session?.title ?? "Live Stream"}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {session?.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canPublish && (
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden sm:inline">
              Mic & Cam
            </span>
          )}
          <ViewerCount count={viewerCount} variant="dark" />

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="relative inline-flex items-center gap-1.5 p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-200 md:hidden"
            aria-label="Mở chat"
          >
            <MessageCircle className="w-4 h-4" />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {messageCount > 9 ? "9+" : messageCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[13px] font-semibold hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rời</span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-5 gap-3 sm:gap-4">
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={token}
            connect
            video={canPublish}
            audio={canPublish}
            className="flex-1 flex flex-col gap-3 sm:gap-4"
          >
            <div className="flex-1 min-h-0">
              <VideoArea viewerCount={viewerCount} showControls={false} canPublish={canPublish} />
            </div>
            <div className="shrink-0 flex flex-col gap-2 sm:gap-3">
              {canPublish && (
                <ControlBar
                  controls={{ microphone: true, camera: true, screenShare: false, chat: false, leave: false }}
                  className="!bg-white !rounded-xl !border !border-slate-200 !px-3 sm:!px-5 !py-2 sm:!py-2.5"
                />
              )}
              {activePoll && <PollBanner poll={activePoll} onAnswer={handlePollAnswer} />}

              {spotlightJob && (
                <>
                  <SpotlightBanner
                    job={spotlightJob}
                    onApply={() => setApplyModalOpen(true)}
                    onDismiss={() => setSpotlightJob(null)}
                  />
                  {applyModalOpen && (
                    <ApplyModal
                      jobTitle={spotlightJob.title ?? "Việc làm nổi bật"}
                      onClose={() => setApplyModalOpen(false)}
                      onSubmit={handleApplyFromStream}
                    />
                  )}
                </>
              )}
            </div>
          </LiveKitRoom>
        </div>

        {/* Desktop: right panel */}
        <div className="hidden md:flex w-[340px] shrink-0 border-l border-slate-200 flex-col bg-white">
          {panelContent}
        </div>
      </div>

      {/* Mobile: backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          mobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* Mobile: bottom sheet */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white rounded-t-2xl shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${mobileDrawerOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ height: "70dvh" }}
      >
        <div className="relative flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100 shrink-0">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 bg-slate-200 rounded-full" />
          <span className="text-[13px] font-semibold text-slate-700">
            {tab === "chat" ? "Chat" : "Q&A"}
          </span>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          {panelContent}
        </div>
      </div>
    </div>
  );
}