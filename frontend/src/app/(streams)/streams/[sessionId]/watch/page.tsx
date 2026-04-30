"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useAuth } from "@/application/contexts/AuthContext";

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
interface ChatMsg {
  id: string; senderName: string; content: string;
  type: "CHAT" | "Q_AND_A" | "SYSTEM"; time: Date; isMe?: boolean;
}
interface PollData {
  eventId: string; question: string; options: string[];
  responses: Record<number, number>; myAnswer: number | null;
}
interface SpotlightJob { jobPostId: string; title?: string }

// ── Icons ────────────────────────────────────────────────────
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconQA = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconEye = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const IconChevron = ({ up }: { up?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {up ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
  </svg>
);
const IconWifi = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
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
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <IconEye className={flash ? "flash" : ""} />
      <span style={{
        fontFamily: "monospace", fontSize: 13, fontWeight: 600,
        color: flash ? "#10b981" : "rgba(255,255,255,0.5)",
        transition: "color 0.3s",
      }}>
        {display.toLocaleString()}
      </span>
    </div>
  );
}

// ── VideoArea ─────────────────────────────────────────────────
function VideoArea({ viewerCount }: { viewerCount: number }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: true });
  const main = tracks.find(t => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare);

  return (
    <div style={{ position: "relative", width: "100%", background: "#000", aspectRatio: "16/9" }}>
      {main
        ? <VideoTrack trackRef={main} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, border: "2px solid rgba(255,255,255,0.15)", borderTop: "2px solid rgba(255,255,255,0.6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Đang kết nối stream...</p>
          </div>
        )
      }
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s ease-in-out infinite" }} />
          LIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 10px" }}>
          <ViewerCount count={viewerCount} />
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

// ── PollBanner ────────────────────────────────────────────────
function PollBanner({ poll, onAnswer }: { poll: PollData; onAnswer: (i: number) => void }) {
  const total = Object.values(poll.responses).reduce((a, b) => a + b, 0);
  return (
    <div style={{ margin: "0 16px", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 16 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>📊 Poll</p>
      <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{poll.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.options.map((opt, i) => {
          const cnt = poll.responses[i] ?? 0;
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const chosen = poll.myAnswer === i;
          return (
            <button key={i} onClick={() => poll.myAnswer === null && onAnswer(i)} disabled={poll.myAnswer !== null}
              style={{
                position: "relative", textAlign: "left", border: chosen ? "1.5px solid #334155" : "1px solid #e2e8f0",
                borderRadius: 10, padding: "8px 12px", background: "#fff",
                cursor: poll.myAnswer === null ? "pointer" : "default",
                fontSize: 13, color: chosen ? "#1e293b" : "#475569", fontWeight: chosen ? 600 : 400, overflow: "hidden",
              }}>
              {poll.myAnswer !== null && (
                <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${pct}%`, background: "#f1f5f9", transition: "width 0.5s ease" }} />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{opt}</span>
              {poll.myAnswer !== null && (
                <span style={{ position: "relative", zIndex: 1, float: "right", fontSize: 12, color: "#94a3b8" }}>{pct}%</span>
              )}
            </button>
          );
        })}
      </div>
      {poll.myAnswer === null && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>Chọn đáp án để tham gia</p>}
    </div>
  );
}

// ── SpotlightBanner ───────────────────────────────────────────
function SpotlightBanner({ job, onApply, onDismiss }: { job: SpotlightJob; onApply: () => void; onDismiss: () => void }) {
  return (
    <div style={{ margin: "0 16px", background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1px solid #fde68a", borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#92400e" }}>
        <IconBriefcase />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#92400e" }}>Vị trí đang tuyển</p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1c1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {job.title ?? `Job #${job.jobPostId.slice(0, 8)}`}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={onApply} style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Apply
        </button>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#a16207", padding: 4, display: "flex" }}>
          <IconX />
        </button>
      </div>
    </div>
  );
}

// ── ChatPanel ─────────────────────────────────────────────────
function ChatPanel({ messages, tab, onTabChange, onSend, onAsk, sending }: {
  messages: ChatMsg[]; tab: TabType; onTabChange: (t: TabType) => void;
  onSend: (m: string) => void; onAsk: (q: string) => void; sending: boolean;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const filtered = messages.filter(m => tab === "qa" ? m.type === "Q_AND_A" : m.type !== "Q_AND_A");

  const handleSend = () => {
    if (!input.trim() || sending) return;
    tab === "chat" ? onSend(input.trim()) : onAsk(input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", borderRadius: 20, overflow: "hidden" }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        {(["chat", "qa"] as TabType[]).map(t => (
          <button key={t} onClick={() => onTabChange(t)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px 0", border: "none", background: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600,
            color: tab === t ? "#0f172a" : "#94a3b8",
            borderBottom: tab === t ? "2px solid #0f172a" : "2px solid transparent",
            transition: "all 0.2s",
          }}>
            {t === "chat" ? <><IconChat />Chat</> : <><IconQA />Q&amp;A</>}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
        {filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#cbd5e1", fontSize: 13, gap: 8 }}>
            {tab === "qa" ? <><IconQA />Chưa có câu hỏi nào</> : <><IconChat />Chưa có tin nhắn</>}
          </div>
        )}
        {filtered.map(m => m.type === "SYSTEM"
          ? (
            <div key={m.id} style={{ textAlign: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8", background: "#f8fafc", padding: "3px 10px", borderRadius: 20 }}>{m.content}</span>
            </div>
          ) : (
            <div key={m.id} style={{ display: "flex", justifyContent: m.isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", borderRadius: m.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "8px 12px",
                background: m.isMe ? "#0f172a" : tab === "qa" ? "#fffbeb" : "#f8fafc",
                border: tab === "qa" && !m.isMe ? "1px solid #fde68a" : "none",
              }}>
                {!m.isMe && (
                  <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: tab === "qa" ? "#92400e" : "#64748b" }}>{m.senderName}</p>
                )}
                <p style={{ margin: 0, fontSize: 13, color: m.isMe ? "#fff" : "#334155", lineHeight: 1.5 }}>{m.content}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: m.isMe ? "rgba(255,255,255,0.4)" : "#94a3b8", textAlign: "right" }}>
                  {m.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={tab === "qa" ? "Đặt câu hỏi cho host..." : "Nhắn tin..."}
            maxLength={tab === "qa" ? 500 : 300}
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", background: "#f8fafc",
              fontSize: 13, color: "#334155", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#94a3b8")}
            onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: input.trim() && !sending ? "#0f172a" : "#e2e8f0",
              color: input.trim() && !sending ? "#fff" : "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !sending ? "pointer" : "default",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >
            {sending
              ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid currentColor", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <IconSend />}
          </button>
        </div>
        {tab === "qa" && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8", textAlign: "right" }}>{input.length}/500</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
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
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [tab, setTab] = useState<TabType>("chat");
  const [chatOpen, setChatOpen] = useState(true);
  const [sending, setSending] = useState(false);
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [spotlightJob, setSpotlightJob] = useState<SpotlightJob | null>(null);
  const currentUserId = user?.id;

  useEffect(() => {
    service.getSession(sessionId)
      .then(s => { setSession(s); setViewerCount(s.viewerCount || 0); })
      .catch(console.error);
  }, [sessionId]);

  useEffect(() => {
    setJoining(true);
    service.joinStream(sessionId)
      .then(res => { setToken(res.viewerToken); setLivekitUrl(res.livekitUrl); setViewerCount(res.currentViewerCount); })
      .catch(() => setError("Không thể tham gia phiên stream này"))
      .finally(() => setJoining(false));
  }, [sessionId]);
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    return () => {
      service.leaveStream(sessionIdRef.current).catch(() => {/* ignore */});
    };
  }, []);

  // Viewer count realtime
  useEffect(() => {
    const unsub = subscribeTopic(`/topic/stream/${sessionId}/events`, (event: any) => {
      if (event.type === "VIEWER_COUNT_UPDATE") setViewerCount(event.payload.count);
    });
    return () => unsub();
  }, [sessionId, subscribeTopic]);

  // ── Chat: không dùng optimistic, chỉ dedup bằng id từ server ──
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

  // ── Q&A: dedup bằng id ──
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

  useEffect(() => {
    const unsub = subscribeTopic(`/user/queue/stream-invite`, invite => console.log("Invite:", invite));
    return () => unsub();
  }, [subscribeTopic]);

  // ── Send chat: không optimistic, chờ server echo về (giống EmployerStudioPage) ──
  const handleSendChat = useCallback((msg: string) => {
    setSending(true);
    try {
      publishMessage(`/app/streams/${sessionId}/chat`, { content: msg });
    } finally {
      setSending(false);
    }
  }, [sessionId, publishMessage]);

  const handleAskQuestion = useCallback(async (q: string) => {
    setSending(true);
    try { await service.submitQuestion(sessionId, q); }
    finally { setSending(false); }
  }, [sessionId]);

  const handlePollAnswer = useCallback(async (idx: number) => {
    if (!activePoll) return;
    setActivePoll(prev => prev ? { ...prev, myAnswer: idx } : prev);
    try { await service.respondToPoll(sessionId, activePoll.eventId, idx); } catch { /* ignore */ }
  }, [sessionId, activePoll]);

  const styles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  `;

  if (joining) return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: 0 }}>Đang kết nối...</p>
      </div>
    </>
  );

  if (error || !token) return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 24px", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.15)" }}><IconWifi /></div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>{error ?? "Không thể kết nối"}</p>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
          Quay lại
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100svh", background: "#0f172a", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
            <IconX />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session?.title ?? "Live Stream"}
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {session?.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn trực tiếp"}
            </p>
          </div>
          <ViewerCount count={viewerCount} />
        </div>

        <LiveKitRoom serverUrl={livekitUrl} token={token} connect video={false} audio={false}
          style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
            <VideoArea viewerCount={viewerCount} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {activePoll && (
              <div style={{ padding: "12px 0 0" }}>
                <PollBanner poll={activePoll} onAnswer={handlePollAnswer} />
              </div>
            )}

            {spotlightJob && (
              <div style={{ padding: "10px 0 0" }}>
                <SpotlightBanner job={spotlightJob}
                  onApply={() => router.push(`/jobs/${spotlightJob.jobPostId}/apply?from=stream&session=${sessionId}`)}
                  onDismiss={() => setSpotlightJob(null)} />
              </div>
            )}

            {/* Chat toggle */}
            <div style={{ padding: "10px 16px 6px", flexShrink: 0 }}>
              <button onClick={() => setChatOpen(v => !v)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <IconChat />
                  Chat &amp; Q&amp;A
                  {messages.filter(m => m.type !== "SYSTEM").length > 0 && (
                    <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", fontSize: 11, padding: "1px 7px", borderRadius: 20 }}>
                      {messages.filter(m => m.type !== "SYSTEM").length}
                    </span>
                  )}
                </span>
                <IconChevron up={chatOpen} />
              </button>
            </div>

            {chatOpen && (
              <div style={{ flex: 1, overflow: "hidden", margin: "0 16px 16px", animation: "fadeUp 0.2s ease" }}>
                <ChatPanel messages={messages} tab={tab} onTabChange={setTab}
                  onSend={handleSendChat} onAsk={handleAskQuestion} sending={sending} />
              </div>
            )}
          </div>
        </LiveKitRoom>
      </div>
    </>
  );
}