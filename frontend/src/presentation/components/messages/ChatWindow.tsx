// src/presentation/components/messages/ChatWindow.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  Star, MoreVertical, Paperclip,
  Smile, Mic, Send,
} from "lucide-react";
import { MessageBubble }  from "./MessageBubble";
import type { Conversation, Message } from "./types";
import { MOCK_MESSAGES }  from "./mockData";

interface Props { conv: Conversation; }

function CompanyAvatar({ name }: { name: string }) {
  const colors = [
    "from-red-400 to-red-600",   "from-blue-400 to-blue-600",
    "from-green-400 to-green-600","from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600","from-teal-400 to-teal-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ChatWindow({ conv }: Props) {
  const [messages,  setMessages]  = useState<Message[]>(MOCK_MESSAGES);
  const [text,      setText]      = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(), type: "text", content: trimmed,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      fromMe: true,
    }]);
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <div className="relative">
          <CompanyAvatar name={conv.company} />
          {conv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{conv.company}</p>
          <p className="text-xs text-gray-400">
            {conv.online ? <span className="text-green-500">Hoạt động {conv.time}</span> : conv.time}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Star size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
          <button className="shrink-0 p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
            <Paperclip size={17} />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Nhắn tin"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none min-w-0"
          />
          <button className="shrink-0 p-1.5 text-gray-400 hover:text-yellow-500 transition-colors">
            <Smile size={17} />
          </button>
          {text.trim() ? (
            <button onClick={sendMessage}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500
                text-white rounded-full hover:bg-blue-600 transition-colors">
              <Send size={15} />
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