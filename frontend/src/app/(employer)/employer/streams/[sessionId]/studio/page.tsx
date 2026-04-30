// presentation/components/stream/employer/EmployerStudioPage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { VideoArea } from "@/presentation/components/stream/common/VideoArea";
import { ViewerCount } from "@/presentation/components/stream/common/ViewerCount";
import { ChatPanel, type ChatMessageData } from "@/presentation/components/stream/common/ChatPanel";
import { LiveIndicator } from "@/presentation/components/stream/common/LiveIndicator";
import { LoadingScreen } from "@/presentation/components/stream/common/LoadingScreen";
import { globalStyles } from "@/presentation/components/stream/common/globalStyles";
import { IconChat, IconPin, IconSquare } from "@/presentation/components/stream/common/Icons";
import { ConfirmEndModal, SpotlightPanel, StartScreen } from "@/presentation/components/stream/employer";

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
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [spotlightedJobs, setSpotlightedJobs] = useState<string[]>([]);

  // Load session
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
      } catch (e) { console.error(e); }
    };
    loadSession();
  }, [sessionId]);

  // Start stream
  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await service.startStream(sessionId);
      setToken(res.hostToken);
      setLivekitUrl(res.livekitUrl);
    } finally { setStarting(false); }
  };

  // Timer
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
        }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

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
        }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  // Send message
  const handleSendMessage = useCallback((content: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content });
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  // Spotlight job
  const handleSpotlight = useCallback(async (jobId: string) => {
    setSpotlighting(true);
    try {
      await service.spotlightJob(sessionId, { jobPostId: jobId });
      setSpotlightedJobs(prev => [jobId, ...prev]);
    } finally {
      setSpotlighting(false);
    }
  }, [sessionId]);

  // End stream
  const handleEnd = async () => {
    setEnding(true);
    try {
      await service.endStream(sessionId);
      router.push(`/employer/streams/${sessionId}`);
    } finally {
      setEnding(false);
      setShowEndConfirm(false);
    }
  };

  // Loading state
  if (!session) return <LoadingScreen />;

  // Start screen
  if (!token) return <StartScreen session={session} onStart={handleStart} starting={starting} />;

  return (
    <>
      <style>{globalStyles}</style>
        <div style={{ 
    minHeight: "100svh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #1e3a8a 100%)",
    display: "flex",
    flexDirection: "column",
  }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <LiveIndicator style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              borderRadius: 20,
            }} />
            <span style={{
              fontFamily: "monospace", fontSize: 13,
              color: "rgba(255,255,255,0.4)", fontWeight: 600,
            }}>
              {formatElapsed(elapsed)}
            </span>
            <span style={{
              fontSize: 13, color: "rgba(255,255,255,0.25)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {session.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ViewerCount count={viewerCount} variant="dark" />
            <button
              onClick={() => setShowEndConfirm(true)}
              disabled={ending}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171", borderRadius: 10, padding: "7px 14px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <IconSquare size={14} />
              Kết thúc
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Video side */}
          <div style={{
            flex: 1, padding: 16,
            display: "flex", flexDirection: "column", minWidth: 0,
          }}>
            <LiveKitRoom
              serverUrl={livekitUrl}
              token={token}
              connect
              video
              audio
              style={{ flex: 1, display: "flex", flexDirection: "column" ,gap: 12 }}
            >
              <div style={{ flex: 1, minHeight: 0 }}>
                <VideoArea viewerCount={viewerCount} showControls />
              </div>
              <div style={{ flexShrink: 0 }}>
                <ControlBar style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px",
                }} />
              </div>
            </LiveKitRoom>
          </div>

          {/* Right panel */}
          <div style={{
            width: 300, flexShrink: 0,
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column",
            background: "#fffff",
          }}>
            {/* Panel tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {(["chat", "spotlight"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                    padding: "12px 0", border: "none",
                    background: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    color: activeTab === t ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                    borderBottom: activeTab === t
                      ? "2px solid rgba(255,255,255,0.35)"
                      : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {t === "chat" ? (
                    <>
                      <IconChat size={14} />
                      Chat &amp; Q&amp;A
                      {messages.length > 0 && (
                        <span style={{
                          background: "rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.7)",
                          fontSize: 10, padding: "1px 7px", borderRadius: 20,
                        }}>
                          {messages.length}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <IconPin size={14} />
                      Spotlight
                      {spotlightedJobs.length > 0 && (
                        <span style={{
                          background: "rgba(234,179,8,0.2)",
                          color: "#fbbf24",
                          fontSize: 10, padding: "1px 7px", borderRadius: 20,
                        }}>
                          {spotlightedJobs.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
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
          <ConfirmEndModal
            onConfirm={handleEnd}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
      </div>
    </>
  );
}