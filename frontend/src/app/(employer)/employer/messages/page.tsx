// src/app/messages/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList }         from "@/presentation/components/messages/ConversationList";
import { ChatWindow }               from "@/presentation/components/messages/ChatWindow";
import { EmptyChat }                from "@/presentation/components/messages/EmptyChat";
import { MessageService }           from "@/application/services/MessageService";
import { MessageRepository }        from "@/infrastructure/repositories/MessageRepository";
import type { ConversationSummary } from "@/domain/models/Message";
import { extractErrorMessage }      from "@/lib/extractErrorMessage";
import { useWebSocket }             from "@/application/contexts/WebSocketContext";
import type { IncomingMessage }     from "@/application/contexts/WebSocketContext";

const service = new MessageService(new MessageRepository());

export default function EmployerMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [activeId,      setActiveId]      = useState<string | null>(null);
  const [flashId,       setFlashId]       = useState<string | null>(null);

  const hasLoaded   = useRef(false);
  const activeIdRef = useRef<string | null>(null); // tránh stale closure trong WS handler

  const { subscribeToMessages } = useWebSocket();

  // Sync activeIdRef với state
  useEffect(() => { activeIdRef.current = activeId }, [activeId]);

  // ── Load inbox ─────────────────────────────────────────────────────────────

  const loadInbox = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await service.getInbox(0, 50);
      setConversations(res.conversations);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải hộp thư"));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadInbox();
  }, [loadInbox]);

  // ── WebSocket: nhận tin mới → cập nhật inbox real-time ────────────────────

  useEffect(() => {
    const unsubscribe = subscribeToMessages((incoming: IncomingMessage) => {
      const convId = incoming.conversationId;

      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === convId);

        if (idx === -1) {
          // Conversation hoàn toàn mới → reload để lấy đầy đủ metadata
          loadInbox();
          return prev;
        }

        const updated = [...prev];
        const conv    = { ...updated[idx] };

        // Cập nhật preview & timestamp
        conv.lastMessagePreview = incoming.content;
        conv.lastMessageAt      = incoming.createdAt;

        // Tăng unread chỉ khi KHÔNG đang xem conversation này
        if (activeIdRef.current !== convId) {
          conv.unreadCount = (conv.unreadCount ?? 0) + 1;
        }

        // Đẩy conversation lên đầu danh sách
        updated.splice(idx, 1);
        return [conv, ...updated];
      });

      // Flash highlight conversation vừa có tin mới (chỉ khi không đang xem)
      if (activeIdRef.current !== convId) {
        setFlashId(convId);
        // Reset sau 1.5s (ConversationList cũng tự reset nhưng đây là source of truth)
        setTimeout(() => setFlashId(f => f === convId ? null : f), 1500);
      }
    });

    return unsubscribe;
  }, [subscribeToMessages, loadInbox]);

  // ── Select conversation ────────────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setFlashId(null);
    // Optimistic: reset unread khi mở conversation
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c),
    );
  }, []);

  const activeConv = conversations.find(c => c.id === activeId) ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-65px)] -m-4 sm:-m-6 overflow-hidden
      rounded-xl border border-gray-100 shadow-sm">

      {/* Conversation list — ẩn trên mobile khi đang chat */}
      <div className={`${activeId ? "hidden md:flex" : "flex"}
        w-full md:w-80 lg:w-96 shrink-0 flex-col`}>
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          role="EMPLOYER" 
          activeId={activeId}
          onSelect={handleSelect}
          onRetry={loadInbox}
          flashId={flashId}
        />
      </div>

      {/* Chat area */}
      <div className={`${activeId ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col`}>
        {activeConv
          ? <ChatWindow role="EMPLOYER"  conv={activeConv} onBack={() => setActiveId(null)} />
          : <EmptyChat />
        }
      </div>
    </div>
  );
}