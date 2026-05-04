// src/presentation/components/messages/MessageBubble.tsx
import { Play, FileText } from "lucide-react";
import type { Message }   from "./types";

interface Props { msg: Message; }

export function MessageBubble({ msg }: Props) {
  const isMe = msg.fromMe;

  // ── Text ──────────────
  if (msg.type === "text") {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isMe
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
          {msg.content}
          <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
            {msg.time}
          </p>
        </div>
      </div>
    );
  }

  // ── Emoji ─────────────
  if (msg.type === "emoji") {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="text-4xl leading-none">{msg.content}</div>
      </div>
    );
  }

  // ── File ──────────────
  if (msg.type === "file") {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 max-w-[260px] shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{msg.fileName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{msg.fileSize}</p>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline mt-1">
                OPEN WITH
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-right mt-1">{msg.time}</p>
        </div>
      </div>
    );
  }

  // ── Audio ─────────────
  if (msg.type === "audio") {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl max-w-[300px]
          ${isMe
            ? "bg-blue-500 rounded-br-sm"
            : "bg-gray-100 rounded-bl-sm"}`}>
          <button className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
            ${isMe ? "bg-white/20" : "bg-blue-500"}`}>
            <Play size={14} className={isMe ? "text-white" : "text-white"} fill="currentColor" />
          </button>
          {/* Waveform */}
          <div className="flex items-center gap-px flex-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i}
                className={`rounded-full w-1 ${isMe ? "bg-white/60" : "bg-blue-400"}`}
                style={{ height: `${8 + Math.sin(i * 0.7) * 6 + Math.random() * 4}px` }}
              />
            ))}
          </div>
          <span className={`text-[11px] shrink-0 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
            {msg.duration}
          </span>
        </div>
      </div>
    );
  }

  return null;
}