// src/presentation/components/messages/ChatWindow.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Star, MoreVertical, Paperclip,
  Smile, Mic, Send, ArrowLeft, WifiOff,
} from "lucide-react";
import { MessageBubble }        from "./MessageBubble";
import { MessageService }       from "@/application/services/MessageService";
import { MessageRepository }    from "@/infrastructure/repositories/MessageRepository";
import { useAuth }              from "@/application/contexts/AuthContext";
import { useWebSocket }         from "@/application/contexts/WebSocketContext";
import type { IncomingMessage } from "@/application/contexts/WebSocketContext";
import type { ConversationSummary, ConversationMessage } from "@/domain/models/Message";
import { extractErrorMessage }  from "@/lib/extractErrorMessage";

const service = new MessageService(new MessageRepository());

// ── Avatar ────────────────────────────────────────────────────────────────────
function ParticipantAvatar({ name, src }: { name: string; src?: string | null }) {
  const COLORS = [
    "from-red-400 to-red-600",    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600","from-purple-400 to-purple-600",
    "from-orange-400 to-orange-500","from-teal-400 to-teal-600",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  if (src) return <img src={src} alt={name} className="w-full h-full object-cover" />;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color}
      flex items-center justify-center text-white font-bold text-sm`}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse px-5 py-4">
      {[false, true, false, true, false].map((right, i) => (
        <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
          <div className={`h-10 rounded-2xl ${right ? "bg-blue-100 w-48" : "bg-gray-100 w-56"}`} />
        </div>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  conv:    ConversationSummary;
  onBack?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatWindow({ conv, onBack }: Props) {
  const { user }                                          = useAuth();
  const { subscribeToMessages, sendMessageWs, isConnected } = useWebSocket();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [text,     setText]     = useState("");
  const [error,    setError]    = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const hasLoaded  = useRef<string | null>(null);

  // ── Load messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const raw      = await service.getMessages(conv.id);
      const enriched = service.enrichMessages(raw, user?.id ?? "");
      setMessages(enriched);
      await service.markAsRead(conv.id);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải tin nhắn"));
    } finally { setLoading(false); }
  }, [conv.id, user?.id]);

  useEffect(() => {
    if (hasLoaded.current === conv.id) return;
    hasLoaded.current = conv.id;
    setMessages([]);
    loadMessages();
  }, [conv.id, loadMessages]);

  // ── WebSocket: nhận tin nhắn real-time ────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeToMessages((incoming: IncomingMessage) => {
      // Chỉ xử lý tin nhắn thuộc conversation đang mở
      if (incoming.conversationId !== conv.id) return;
      // Bỏ qua tin của chính mình — đã có optimistic bubble
      if (incoming.senderId === user?.id) return;

      setMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) return prev; // tránh duplicate
        return [...prev, {
          id:             incoming.id,
          conversationId: incoming.conversationId,
          senderId:       incoming.senderId,
          content:        incoming.content,
          type:           incoming.type,
          read:           incoming.read,
          readAt:         incoming.readAt,
          createdAt:      incoming.createdAt,
          fromMe:         false,
        }];
      });
    });

    return unsubscribe;
  }, [subscribeToMessages, conv.id, user?.id]);

  // Auto-scroll khi messages thay đổi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input khi chuyển conversation
  useEffect(() => {
    inputRef.current?.focus();
  }, [conv.id]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ConversationMessage = {
      id:             optimisticId,
      conversationId: conv.id,
      senderId:       user?.id ?? "",
      content:        trimmed,
      type:           "TEXT",
      read:           false,
      readAt:         null,
      createdAt:      new Date().toISOString(),
      fromMe:         true,
    };

    setMessages(prev => [...prev, optimistic]);
    setText("");
    setSending(true);

    try {
      if (isConnected) {
        // ✅ Gửi qua WebSocket — backend push lại qua /user/queue/messages
        sendMessageWs(conv.id, trimmed);
        // Optimistic bubble giữ nguyên; WS handler skip tin của mình (senderId check)
      } else {
        // Fallback REST khi WS mất kết nối
        const sent = await service.sendText(conv.id, trimmed);
        setMessages(prev =>
          prev.map(m => m.id === optimisticId ? { ...sent, fromMe: true } : m),
        );
      }
    } catch (e) {
      // Revert optimistic khi lỗi
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setText(trimmed);
      setError(extractErrorMessage(e, "Gửi thất bại, thử lại."));
    } finally {
      setSending(false);
    }
  }, [text, sending, conv.id, user?.id, isConnected, sendMessageWs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 shrink-0">
        {onBack && (
          <button onClick={onBack}
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500
              hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <ParticipantAvatar
              name={conv.otherParticipantName}
              src={conv.otherParticipantAvatar}
            />
          </div>
          {conv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400
              rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {conv.otherParticipantName}
          </p>
          <p className="text-xs text-gray-400">
            {conv.online
              ? <span className="text-green-500">Đang hoạt động</span>
              : conv.lastMessageAt
                ? `Hoạt động ${timeAgo(conv.lastMessageAt)}`
                : "Chưa hoạt động"
            }
          </p>
        </div>

        {/* Job tag */}
        {conv.jobTitle && (
          <div className="hidden sm:block shrink-0 px-3 py-1 bg-blue-50 text-blue-700
            text-[11px] font-semibold rounded-full border border-blue-200 max-w-[140px] truncate">
            {conv.jobTitle}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400
            hover:text-yellow-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Star size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400
            hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* WS connection status */}
        <div className="shrink-0 flex items-center gap-1.5">
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-green-400"
              title="Kết nối real-time" />
          ) : (
            <WifiOff size={13} className="text-gray-300" title="Đang dùng chế độ offline" />
          )}
        </div>
      </div>

      {/* ── Offline banner ── */}
      {!isConnected && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100
          text-xs text-amber-600 text-center">
          Mất kết nối real-time — tin nhắn sẽ được gửi qua REST
        </div>
      )}

      {/* ── Error bar ── */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-xs text-red-600 border-b border-red-100
          flex items-center justify-between gap-2">
          {error}
          <button onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-xs underline shrink-0">
            Đóng
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {loading
          ? <MessageSkeleton />
          : messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={{
                id:       msg.id,
                type:     msg.type.toLowerCase() as any,
                content:  msg.content,
                time:     formatTime(msg.createdAt),
                fromMe:   msg.fromMe ?? false,
                fileName: (msg as any).fileName,
                fileSize: (msg as any).fileSize,
                duration: (msg as any).duration,
              }}
            />
          ))
        }
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200
          rounded-2xl px-3 py-2 focus-within:border-blue-300 transition-colors">
          <button className="shrink-0 p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
            <Paperclip size={17} />
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn tin..."
            disabled={sending}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none min-w-0 disabled:opacity-60"
          />
          <button className="shrink-0 p-1.5 text-gray-400 hover:text-yellow-500 transition-colors">
            <Smile size={17} />
          </button>
          {text.trim() ? (
            <button onClick={sendMessage} disabled={sending}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500
                text-white rounded-full hover:bg-blue-600 disabled:opacity-60 transition-colors">
              {sending
                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                : <Send size={15} />
              }
            </button>
          ) : (
            <button className="shrink-0 p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
              <Mic size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}