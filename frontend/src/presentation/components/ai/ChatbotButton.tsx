"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, X, Send, Maximize2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { ChatMessage } from "@/domain/models/Ai";
import { ChatMessageItem } from "@/presentation/components/ai/ChatMessage";
import { ChatTypingIndicator } from "@/presentation/components/ai/ChatTypingIndicator";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useAuth } from "@/application/contexts/AuthContext";

const service = new AiService(new AiRepository());

export function ChatbotButton() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ref của vùng scroll messages — KHÔNG dùng window scroll
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLTextAreaElement>(null);

  // Scroll nội bộ trong popup, không ảnh hưởng trang ngoài
  useEffect(() => {
    if (!open) return;
    const area = scrollAreaRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [messages, sending, open]);

  // Focus input khi mở
  useEffect(() => {
    if (open && isAuthenticated) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, isAuthenticated]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setError(null);
    setSending(true);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: sessionId ?? "",
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const reply = await service.sendMessage(content, sessionId);
      if (!sessionId) setSessionId(reply.sessionId);
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempMsg.id),
        { ...tempMsg, sessionId: reply.sessionId },
        { id: reply.id, sessionId: reply.sessionId, role: reply.role, content: reply.content, createdAt: reply.createdAt },
      ]);
    } catch (e) {
      setError(extractErrorMessage(e));
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  }, [input, sending, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openFullPage = () => {
    router.push(sessionId ? `/chatbot?session=${sessionId}` : "/chatbot");
    setOpen(false);
  };

  return (
    <>
      {/* ── Floating button ───────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Mở Career Advisor"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center transition-all duration-200
          ${open
            ? "bg-gray-700 hover:bg-blue-800"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
          }`}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-30 pointer-events-none" />
        )}
      </button>

      {/* ── Chat popup ───────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96
            flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200
            overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">TLU Career Advisor</p>
              <p className="text-xs text-blue-100">● Trực tuyến</p>
            </div>
            {isAuthenticated && (
              <button onClick={openFullPage} title="Mở rộng"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* ── Chưa đăng nhập ───────────────── */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Bot className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Đăng nhập để tiếp tục</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Bạn cần đăng nhập để sử dụng<br />TLU Career Advisor
                </p>
              </div>
              <button
                onClick={() => { router.push("/auth/login"); setOpen(false); }}
                className="inline-flex items-center gap-2 px-5 py-2.5
                  bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                  rounded-xl transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              {/* Messages — scroll nội bộ, không scroll trang */}
              <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center text-center gap-3 py-6">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Xin chào! 👋</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tôi có thể giúp bạn tư vấn nghề nghiệp, viết CV và chuẩn bị phỏng vấn.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      {["Làm sao viết CV hiệu quả?", "Lộ trình Backend Developer", "Tips phỏng vấn xin việc"].map(q => (
                        <button
                          key={q}
                          onClick={() => { setInput(q); inputRef.current?.focus(); }}
                          className="text-xs px-3 py-2 bg-gray-50 hover:bg-blue-50
                            hover:text-blue-600 border border-gray-200 hover:border-blue-200
                            rounded-xl text-gray-600 text-left transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <ChatMessageItem
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    createdAt={msg.createdAt}
                  />
                ))}

                {sending && <ChatTypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Error */}
              {error && (
                <p className="px-4 py-1.5 text-xs text-red-500 bg-red-50 border-t border-red-100 shrink-0">
                  {error}
                </p>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent outline-none
                      text-sm text-gray-800 placeholder:text-gray-400
                      disabled:opacity-50 max-h-[80px] leading-relaxed"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-7 h-7 rounded-full bg-blue-600 flex items-center
                      justify-center hover:bg-blue-700 disabled:opacity-40
                      disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">
                  Enter gửi · Shift+Enter xuống dòng
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}