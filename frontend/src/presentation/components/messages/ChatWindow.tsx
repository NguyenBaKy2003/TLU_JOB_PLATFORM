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
    "from-red-400 to-red-600", "from-blue-400 to-blue-600",
    "from-green-400 to-green-600", "from-purple-400 to-purple-600",
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  conv: ConversationSummary;
  role: "EMPLOYER" | "CANDIDATE";
  onBack?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatWindow({ conv, role, onBack }: Props) {
  const { user } = useAuth();
  const { subscribeToMessages, sendMessageWs, isConnected } = useWebSocket();

  // 🎯 Xác định người đối diện dựa vào role
  const other =
    role === "EMPLOYER" ? conv.candidate : conv.employer;

  const displayName  = other?.fullName ?? "Unknown";
  const displayAvatar = other?.avatarUrl ?? null;

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

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeToMessages((incoming: IncomingMessage) => {
      if (incoming.conversationId !== conv.id) return;
      if (incoming.senderId === user?.id) return;

      setMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) return prev;

        return [
          ...prev,
          {
            id: incoming.id,
            conversationId: incoming.conversationId,
            senderId: incoming.senderId,
            content: incoming.content,
            type: incoming.type,
            read: incoming.read,
            readAt: incoming.readAt,
            createdAt: incoming.createdAt,
            fromMe: false,
          },
        ];
      });
    });

    return unsubscribe;
  }, [subscribeToMessages, conv.id, user?.id]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conv.id]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const optimisticId = `opt-${Date.now()}`;

    const optimistic: ConversationMessage = {
      id: optimisticId,
      conversationId: conv.id,
      senderId: user?.id ?? "",
      content: trimmed,
      type: "TEXT",
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      fromMe: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setText("");
    setSending(true);

    try {
      if (isConnected) {
        sendMessageWs(conv.id, trimmed);
      } else {
        const sent = await service.sendText(conv.id, trimmed);
        setMessages(prev =>
          prev.map(m => m.id === optimisticId ? { ...sent, fromMe: true } : m),
        );
      }
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setText(trimmed);
      setError(extractErrorMessage(e, "Gửi thất bại"));
    } finally {
      setSending(false);
    }
  }, [text, sending, conv.id, user?.id, isConnected, sendMessageWs]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">

        {onBack && (
          <button onClick={onBack} className="md:hidden">
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="w-10 h-10 rounded-full overflow-hidden">
          <ParticipantAvatar name={displayName} src={displayAvatar} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-gray-400">
            {conv.lastMessageAt
              ? `Hoạt động ${timeAgo(conv.lastMessageAt)}`
              : "Chưa hoạt động"}
          </p>
        </div>

        {!isConnected && <WifiOff size={14} />}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={{
              id: msg.id,
              content: msg.content,
              type: msg.type.toLowerCase() as any,
              time: formatTime(msg.createdAt),
              fromMe: msg.fromMe ?? false,
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Nhắn tin..."
        />
        <button onClick={sendMessage}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Đang hoạt động"; // 👈 thêm dòng này
  if (mins < 60) return `${mins} phút trước`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;

  return `${Math.floor(hrs / 24)} ngày trước`;
}