"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AiService }         from "@/application/services/AiService";
import { AiRepository }      from "@/infrastructure/repositories/AiRepository";
import { ChatMessage, ChatSession } from "@/domain/models/Ai";
import { ChatMessageItem }   from "@/presentation/components/ai/ChatMessage";
import { ChatInput }         from "@/presentation/components/ai/ChatInput";
import { ChatTypingIndicator } from "@/presentation/components/ai/ChatTypingIndicator";
import { ChatSessionList }   from "@/presentation/components/ai/ChatSessionList";
import { Bot, Menu, X }      from "lucide-react";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const service = new AiService(new AiRepository());

export default function ChatbotPage() {
  const [sessions,         setSessions]         = useState<ChatSession[]>([]);
  const [activeSessionId,  setActiveSessionId]  = useState<string | null>(null);
  const [messages,         setMessages]         = useState<ChatMessage[]>([]);
  const [sending,          setSending]          = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load danh sách sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await service.listSessions();
      setSessions(res.content ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Load messages khi chọn session
  const selectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setActiveSessionId(sessionId);
    setSidebarOpen(false);
    try {
      const session = await service.getSession(sessionId);
      setMessages(session.messages ?? []);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo session mới
  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
    setError(null);
  }, []);

  // Xóa session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await service.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  }, [activeSessionId, startNewChat]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (content: string) => {
    setError(null);
    setSending(true);

    // Optimistic UI — hiển thị tin nhắn user ngay
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: activeSessionId ?? "",
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await service.sendMessage(content, activeSessionId);

      // Nếu là session mới → cập nhật sessionId và load lại sessions
      if (!activeSessionId) {
        setActiveSessionId(reply.sessionId);
        await loadSessions();
      }

      // Thêm reply từ AI
      const assistantMsg: ChatMessage = {
        id: reply.id,
        sessionId: reply.sessionId,
        role: reply.role,
        content: reply.content,
        createdAt: reply.createdAt,
      };
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        { ...tempUserMsg, sessionId: reply.sessionId },
        assistantMsg,
      ]);

    } catch (e) {
      setError(extractErrorMessage(e));
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  }, [activeSessionId, loadSessions]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">

      {/* ── Sidebar ───────────── */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Header sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Career Advisor</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <ChatSessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={selectSession}
          onNew={startNewChat}
          onDelete={deleteSession}
        />
      </aside>

      {/* ── Main chat area ─────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">TLU Career Advisor</p>
              <p className="text-xs text-emerald-600">● Trực tuyến</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

          {/* Welcome message */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bot className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Xin chào! 👋</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Tôi là TLU Career Advisor. Tôi có thể giúp bạn tư vấn nghề nghiệp,
                  viết CV, chuẩn bị phỏng vấn và nhiều hơn nữa.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Làm sao viết CV hiệu quả?",
                  "Lộ trình trở thành Backend Developer",
                  "Cách trả lời câu hỏi phỏng vấn",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200
                      rounded-full hover:border-blue-400 hover:text-blue-600
                      transition-colors text-gray-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading session */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent
                rounded-full animate-spin" />
            </div>
          )}

          {/* Message list */}
          {!loading && messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              role={msg.role}
              content={msg.content}
              createdAt={msg.createdAt}
            />
          ))}

          {/* Typing indicator */}
          {sending && <ChatTypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200
            rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <ChatInput onSend={sendMessage} disabled={sending || loading} />
          <p className="text-center text-xs text-gray-400 mt-2">
            AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  );
}