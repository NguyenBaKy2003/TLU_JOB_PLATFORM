// presentation/components/stream/candidate/CandidateViewerPage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useAuth } from "@/application/contexts/AuthContext";
import { VideoArea } from "@/presentation/components/stream/common/VideoArea";
import { ViewerCount } from "@/presentation/components/stream/common/ViewerCount";
import { ChatPanel, type ChatMessageData } from "@/presentation/components/stream/common/ChatPanel";
import { LoadingScreen } from "@/presentation/components/stream/common/LoadingScreen";
import { ErrorScreen } from "@/presentation/components/stream/common/ErrorScreen";
import { globalStyles } from "@/presentation/components/stream/common/globalStyles";
import { IconX, IconChat, IconQA } from "@/presentation/components/stream/common/Icons";
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
  const currentUserId = user?.id;

  // Load session
  useEffect(() => {
    service.getSession(sessionId)
      .then(s => { setSession(s); setViewerCount(s.viewerCount || 0); })
      .catch(console.error);
  }, [sessionId]);

  // Join stream
  useEffect(() => {
    setJoining(true);
    service.joinStream(sessionId)
      .then(res => {
        setToken(res.viewerToken);
        setLivekitUrl(res.livekitUrl);
        setViewerCount(res.currentViewerCount);
      })
      .catch(() => setError("Không thể tham gia phiên stream này"))
      .finally(() => setJoining(false));
  }, [sessionId]);

  // Cleanup
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    return () => {
      service.leaveStream(sessionIdRef.current).catch(() => {});
    };
  }, []);

  // Viewer count realtime
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/stream/${sessionId}/events`, (event: any) => {
      if (event.type === "VIEWER_COUNT_UPDATE") setViewerCount(event.payload.count);
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  // Chat messages
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/chat`, (wsPayload: WsPayload<WsChatMessagePayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, {
          id: d.id,
          senderName: d.senderName,
          content: d.content,
          type: "CHAT",
          time: new Date(d.sentAt),
          isMe: d.senderId === currentUserId,
        }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId]);

  // Q&A messages
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/qa`, (wsPayload: WsPayload<WsQAQuestionPayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, {
          id: d.id,
          senderName: d.candidateName,
          content: d.question,
          type: "Q_AND_A",
          time: new Date(d.askedAt),
          isMe: d.candidateId === currentUserId,
        }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic, currentUserId]);

  // Stream invite
  useEffect(() => {
    const unsub = subscribeTopic(`/user/queue/stream-invite`, (invite: any) => {
      console.log("Invite:", invite);
    });
    return () => unsub();
  }, [subscribeTopic]);

  // Send chat message
  const handleSendChat = useCallback((msg: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content: msg });
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  // Ask question
  const handleAskQuestion = useCallback(async (q: string) => {
    setSending(true);
    try {
      await service.submitQuestion(sessionId, q);
    } finally {
      setSending(false);
    }
  }, [sessionId]);

  // Poll answer
  const handlePollAnswer = useCallback(async (idx: number) => {
    if (!activePoll) return;
    setActivePoll(prev => prev ? { ...prev, myAnswer: idx } : prev);
    try {
      await service.respondToPoll(sessionId, activePoll.eventId, idx);
    } catch { /* ignore */ }
  }, [sessionId, activePoll]);

  if (joining) return <LoadingScreen />;
  if (error || !token) {
    return (
      <ErrorScreen
        message={error ?? "Không thể kết nối"}
        onBack={() => router.back()}
      />
    );
  }

  const messageCount = messages.filter(m => m.type !== "SYSTEM").length;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: "100svh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(20px)",
        }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36, height: 36,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <IconX size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "#f8fafc",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}>
              {session?.title ?? "Live Stream"}
            </h1>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 2,
            }}>
              <p style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
              }}>
                {session?.sessionType === "JOB_FAIR" ? "🎯 Job Fair" : "💼 Phỏng vấn trực tiếp"}
              </p>
            </div>
          </div>
          <ViewerCount count={viewerCount} variant="dark" />
        </div>

        {/* Main layout */}
        <div style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}>
          {/* Left - Video & Content */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "auto",
          }}>
            <LiveKitRoom
              serverUrl={livekitUrl}
              token={token}
              connect
              video={false}
              audio={false}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {/* Video */}
              <div style={{ flexShrink: 0, padding: 16 }}>
                <VideoArea viewerCount={viewerCount} />
              </div>

              {/* Content area */}
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "0 16px 16px",
              }}>
                {/* Poll */}
                {activePoll && <PollBanner poll={activePoll} onAnswer={handlePollAnswer} />}

                {/* Spotlight */}
                {spotlightJob && (
                  <SpotlightBanner
                    job={spotlightJob}
                    onApply={() => router.push(`/jobs/${spotlightJob.jobPostId}/apply?from=stream&session=${sessionId}`)}
                    onDismiss={() => setSpotlightJob(null)}
                  />
                )}
              </div>

              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>

          {/* Right - Chat Panel */}
          <div style={{
            width: 340,
            flexShrink: 0,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
          }}>
            {/* Chat header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}>
                  <IconChat size={14} />
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}>
                  Chat &amp; Q&amp;A
                </span>
                {messageCount > 0 && (
                  <span style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}>
                    {messageCount}
                  </span>
                )}
              </div>
            </div>

            {/* Chat content */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ChatPanel
                messages={messages}
                tabs={[
                  { key: "chat", label: "Chat", icon: <IconChat size={14} /> },
                  { key: "qa", label: "Q&A", icon: <IconQA size={14} /> },
                ]}
                activeTab={tab}
                onTabChange={(t) => setTab(t as TabType)}
                onSend={(content) => {
                  if (tab === "chat") handleSendChat(content);
                  else handleAskQuestion(content);
                }}
                sending={sending}
                placeholder={tab === "qa" ? "Đặt câu hỏi cho host..." : "Nhắn tin..."}
                maxLength={tab === "qa" ? 500 : 300}
                filterFn={(m, t) => {
                  if (t === "qa") return m.type === "Q_AND_A";
                  return m.type !== "Q_AND_A";
                }}
                variant="candidate"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}