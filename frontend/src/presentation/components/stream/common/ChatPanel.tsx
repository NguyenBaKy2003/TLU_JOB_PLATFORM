// components/stream/common/ChatPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

export interface ChatMessageData {
  id: string;
  senderName: string;
  content: string;
  type: "CHAT" | "Q_AND_A" | "SYSTEM";
  time: Date;
  isMe?: boolean;
}

interface ChatPanelProps {
  messages: ChatMessageData[];
  tabs?: { key: string; label: string; icon: React.ReactNode }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSend: (content: string) => void;
  sending: boolean;
  placeholder?: string;
  maxLength?: number;
  filterFn?: (msg: ChatMessageData, tab: string) => boolean;
  variant?: "candidate" | "employer";
}

export function ChatPanel({
  messages,
  tabs = [{ key: "chat", label: "Chat", icon: <MessageCircle className="w-3.5 h-3.5" /> }],
  activeTab = "chat",
  onTabChange,
  onSend,
  sending,
  placeholder = "Nhắn tin...",
  maxLength = 300,
  filterFn,
  variant = "candidate",
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmployer = variant === "employer";

  const filteredMessages = filterFn
    ? messages.filter(m => filterFn(m, activeTab))
    : messages;

  const handleSend = () => {
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#1e3a5f]">
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex p-1.5 gap-1 shrink-0 border-b border-white/10">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${isActive
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageCircle className="w-6 h-6 text-white/20" />
            <p className="text-[13px] text-white/30">Chưa có tin nhắn nào</p>
          </div>
        )}

        {filteredMessages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/15 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${input.trim() && !sending
                ? "bg-blue-400 text-white hover:bg-blue-500"
                : "bg-white/10 text-white/20 cursor-default"
              }
            `}
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble 
function MessageBubble({ message }: { message: ChatMessageData }) {
  const isQA = message.type === "Q_AND_A";
  const isSystem = message.type === "SYSTEM";

  // System message
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-[11px] text-white/40 bg-white/5 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed break-words
        ${message.isMe
          ? "bg-blue-400 text-white rounded-2xl rounded-br-md"
          : isQA
            ? "bg-amber-500/15 border border-amber-500/25 rounded-2xl rounded-bl-md"
            : "bg-white/10 border border-white/10 rounded-2xl rounded-bl-md"
        }
      `}>
        {/* Sender name */}
        {!message.isMe && (
          <p className={`text-[11px] font-semibold mb-1 flex items-center gap-1.5
            ${isQA ? "text-amber-300" : "text-white/60"}
          `}>
            {message.senderName}
            {isQA && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Q&A
              </span>
            )}
          </p>
        )}

        {/* Content */}
        <p className={`m-0 ${message.isMe ? "text-white" : "text-white/90"}`}>
          {message.content}
        </p>

        {/* Time */}
        <p className={`text-[10px] mt-1.5 ${
          message.isMe ? "text-white/60 text-right" : "text-white/30"
        }`}>
          {message.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}