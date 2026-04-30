"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, VideoTrack, useTracks,
  ControlBar, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";

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
interface ChatMessage {
  id: string; senderId: string; senderName: string;
  content: string; type: "CHAT" | "Q_AND_A" | "SYSTEM"; time: Date;
}

// ── Icons ────────────────────────────────────────────────────
const IconRadio = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
  </svg>
);
const IconSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconPin = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconX = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ── ViewerCount ───────────────────────────────────────────────
function ViewerCount({ count }: { count: number }) {
  const [display, setDisplay] = useState(count);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (count !== display) {
      setFlash(true);
      const t = setTimeout(() => { setDisplay(count); setFlash(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [count, display]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
      <IconEye />
      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: flash ? "#10b981" : "rgba(255,255,255,0.6)", transition: "color 0.3s" }}>
        {display.toLocaleString()}
      </span>
    </div>
  );
}

// ── StudioInner ───────────────────────────────────────────────
function StudioInner() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", borderRadius: 16, overflow: "hidden" }}>
      {tracks.length > 0
        ? <VideoTrack trackRef={tracks[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "rgba(255,255,255,0.2)" }}>
            <IconRadio size={48} />
            <p style={{ margin: 0, fontSize: 13 }}>Camera chưa bật</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>Dùng controls bên dưới để bật</p>
          </div>
        )
      }
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s ease-in-out infinite" }} />
          LIVE
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

// ── ChatPanel ─────────────────────────────────────────────────
function ChatPanel({ messages, onSendMessage, sending }: {
  messages: ChatMessage[]; onSendMessage: (c: string) => void; sending: boolean;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, paddingTop: 32 }}>Chưa có tin nhắn</div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ animation: "fadeUp 0.2s ease" }}>
            {m.type === "SYSTEM"
              ? <div style={{ textAlign: "center" }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20 }}>{m.content}</span></div>
              : (
                <div style={{
                  padding: "8px 12px", borderRadius: 12,
                  background: m.type === "Q_AND_A" ? "rgba(234,179,8,0.12)" : "rgba(255,255,255,0.06)",
                  border: m.type === "Q_AND_A" ? "1px solid rgba(234,179,8,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.type === "Q_AND_A" ? "#fbbf24" : "rgba(255,255,255,0.6)" }}>
                      {m.senderName}
                    </span>
                    {m.type === "Q_AND_A" && (
                      <span style={{ fontSize: 10, background: "rgba(234,179,8,0.2)", color: "#fbbf24", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>Q&A</span>
                    )}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                      {m.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{m.content}</p>
                </div>
              )
            }
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Nhắn tin với khán giả..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", fontSize: 13, color: "rgba(255,255,255,0.8)", outline: "none" }}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending} style={{
            width: 36, height: 36, borderRadius: 10, border: "none",
            background: input.trim() ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
            color: input.trim() ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s", flexShrink: 0,
          }}>
            {sending
              ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid currentColor", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <IconSend />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SpotlightPanel ────────────────────────────────────────────
function SpotlightPanel({ sessionId, onSpotlight, spotlighting, spotlightedJobs, onRemove }: {
  sessionId: string; onSpotlight: (id: string) => void; spotlighting: boolean;
  spotlightedJobs: string[]; onRemove: (id: string) => void;
}) {
  const [jobId, setJobId] = useState("");
  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Nhập Job Post ID để ghim lên stream</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={jobId}
          onChange={e => setJobId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && jobId.trim() && onSpotlight(jobId.trim()) && setJobId("")}
          placeholder="Job Post ID..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", fontSize: 13, color: "rgba(255,255,255,0.8)", outline: "none" }}
        />
        <button
          onClick={() => { if (jobId.trim()) { onSpotlight(jobId.trim()); setJobId(""); } }}
          disabled={spotlighting || !jobId.trim()}
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: jobId.trim() ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.05)", color: jobId.trim() ? "#fbbf24" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: jobId.trim() ? "pointer" : "default", flexShrink: 0 }}>
          {spotlighting
            ? <div style={{ width: 12, height: 12, border: "2px solid rgba(251,191,36,0.3)", borderTop: "2px solid #fbbf24", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            : <IconPin />}
        </button>
      </div>
      {spotlightedJobs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Đang ghim</p>
          {spotlightedJobs.map(id => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, padding: "7px 10px" }}>
              <IconPin size={12} />
              <span style={{ flex: 1, fontSize: 12, color: "#fbbf24", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id}</span>
              <button onClick={() => onRemove(id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", display: "flex", padding: 2 }}>
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ConfirmEndModal ───────────────────────────────────────────
function ConfirmEndModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px 28px 24px", maxWidth: 360, width: "100%", animation: "fadeUp 0.2s ease" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#ef4444" }}>
          <IconAlert />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Kết thúc stream?</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Stream sẽ kết thúc ngay lập tức. Hệ thống sẽ tự động xử lý recording và tạo AI summary.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Huỷ
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
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

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await service.startStream(sessionId);
      setToken(res.hostToken);
      setLivekitUrl(res.livekitUrl);
    } finally { setStarting(false); }
  };

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

  // Chat
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/chat`, (wsPayload: WsPayload<WsChatMessagePayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, { id: d.id, senderId: d.senderId, senderName: d.senderName, content: d.content, type: "CHAT", time: new Date(d.sentAt) }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  // Q&A
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/streams/${sessionId}/qa`, (wsPayload: WsPayload<WsQAQuestionPayload>) => {
      const d = wsPayload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === d.id)) return prev;
        return [...prev, { id: d.id, senderId: d.candidateId, senderName: d.candidateName, content: d.question, type: "Q_AND_A", time: new Date(d.askedAt) }];
      });
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  const handleSendMessage = useCallback((content: string) => {
    setSending(true);
    try { publishMessage(`/app/streams/${sessionId}/chat`, { content }); }
    finally { setSending(false); }
  }, [sessionId, publishMessage]);

  const handleSpotlight = useCallback(async (jobId: string) => {
    setSpotlighting(true);
    try {
      await service.spotlightJob(sessionId, { jobPostId: jobId });
      setSpotlightedJobs(prev => [jobId, ...prev]);
    } finally { setSpotlighting(false); }
  }, [sessionId]);

  const handleEnd = async () => {
    setEnding(true);
    try { await service.endStream(sessionId); router.push(`/employer/streams/${sessionId}`); }
    finally { setEnding(false); setShowEndConfirm(false); }
  };

  const styles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  `;

  if (!session) return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid rgba(255,255,255,0.6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    </>
  );

  if (!token) return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "0 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)" }}>
          <IconRadio size={36} />
        </div>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>{session.title}</h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Bắt đầu stream khi bạn đã sẵn sàng</p>
        </div>
        <button onClick={handleStart} disabled={starting} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: starting ? "rgba(239,68,68,0.3)" : "#ef4444",
          color: "#fff", border: "none", borderRadius: 14,
          padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: starting ? "default" : "pointer",
          transition: "all 0.2s",
        }}>
          {starting
            ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            : <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
          }
          {starting ? "Đang kết nối..." : "Bắt đầu stream"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "4px 10px", flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: "0.05em" }}>LIVE</span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{formatElapsed(elapsed)}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ViewerCount count={viewerCount} />
            <button onClick={() => setShowEndConfirm(true)} disabled={ending} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", borderRadius: 10, padding: "7px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              <IconSquare />
              Kết thúc
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Video side */}
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <LiveKitRoom serverUrl={livekitUrl} token={token} connect video audio
              style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <StudioInner />
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
          <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", background: "#111827" }}>
            {/* Panel tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {(["chat", "spotlight"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px 0", border: "none", background: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  color: activeTab === t ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                  borderBottom: activeTab === t ? "2px solid rgba(255,255,255,0.35)" : "2px solid transparent",
                  transition: "all 0.2s",
                }}>
                  {t === "chat"
                    ? (
                      <>
                        <IconChat />
                        Chat &amp; Q&amp;A
                        {messages.length > 0 && (
                          <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 10, padding: "1px 7px", borderRadius: 20 }}>
                            {messages.length}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <IconPin />
                        Spotlight
                        {spotlightedJobs.length > 0 && (
                          <span style={{ background: "rgba(234,179,8,0.2)", color: "#fbbf24", fontSize: 10, padding: "1px 7px", borderRadius: 20 }}>
                            {spotlightedJobs.length}
                          </span>
                        )}
                      </>
                    )
                  }
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              {activeTab === "chat"
                ? <ChatPanel messages={messages} onSendMessage={handleSendMessage} sending={sending} />
                : <SpotlightPanel sessionId={sessionId} onSpotlight={handleSpotlight} spotlighting={spotlighting}
                    spotlightedJobs={spotlightedJobs} onRemove={id => setSpotlightedJobs(p => p.filter(j => j !== id))} />
              }
            </div>
          </div>
        </div>

        {showEndConfirm && <ConfirmEndModal onConfirm={handleEnd} onCancel={() => setShowEndConfirm(false)} />}
      </div>
    </>
  );
}