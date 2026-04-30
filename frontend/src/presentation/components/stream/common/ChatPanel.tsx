// components/stream/common/ChatPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconChat, IconSend } from "./Icons";

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
  tabs = [{ key: "chat", label: "Chat", icon: <IconChat size={14} /> }],
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
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: isEmployer ? "transparent" : "#ffffff",
      borderRadius: isEmployer ? 0 : 20,
      overflow: "hidden",
      boxShadow: isEmployer ? "none" : "0 4px 20px rgba(0,0,0,0.03)",
    }}>
      {/* Tabs */}
      {tabs.length > 1 && (
        <div style={{
          display: "flex",
          background: isEmployer ? "rgba(255,255,255,0.02)" : "#f8fafc",
          borderBottom: `1px solid ${isEmployer ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
          flexShrink: 0,
          padding: "4px",
          gap: 4,
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 0",
                  border: "none",
                  background: isActive
                    ? (isEmployer ? "rgba(59,130,246,0.2)" : "#ffffff")
                    : "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive
                    ? (isEmployer ? "#60a5fa" : "#3b82f6")
                    : (isEmployer ? "rgba(255,255,255,0.3)" : "#94a3b8"),
                  transition: "all 0.2s",
                  boxShadow: isActive && !isEmployer ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 0,
      }}>
        {filteredMessages.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 12,
          }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: isEmployer
                ? "rgba(255,255,255,0.04)"
                : "linear-gradient(135deg, #f0f9ff, #e0e7ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isEmployer ? "rgba(255,255,255,0.2)" : "#93c5fd",
            }}>
              <IconChat size={20} />
            </div>
            <p style={{
              margin: 0,
              fontSize: 13,
              color: isEmployer ? "rgba(255,255,255,0.2)" : "#94a3b8",
            }}>
              Chưa có tin nhắn nào
            </p>
          </div>
        )}

        {filteredMessages.map(m => (
          <div key={m.id} style={{ animation: "fadeUp 0.3s ease" }}>
            <MessageBubble message={m} variant={variant} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: `1px solid ${isEmployer ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
        flexShrink: 0,
        background: isEmployer ? "transparent" : "#f8fafc",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={placeholder}
            maxLength={maxLength}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 14,
              border: isEmployer
                ? "1px solid rgba(255,255,255,0.1)"
                : "1.5px solid #e2e8f0",
              background: isEmployer
                ? "rgba(255,255,255,0.06)"
                : "#ffffff",
              fontSize: 13,
              color: isEmployer ? "#e2e8f0" : "#334155",
              outline: "none",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onFocus={e => {
              e.target.style.borderColor = isEmployer ? "#60a5fa" : "#3b82f6";
              e.target.style.boxShadow = isEmployer
                ? "0 0 0 3px rgba(96, 165, 250, 0.15)"
                : "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = isEmployer
                ? "rgba(255,255,255,0.1)"
                : "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40,
              borderRadius: 13,
              border: "none",
              background: input.trim() && !sending
                ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                : (isEmployer ? "rgba(255,255,255,0.06)" : "#f1f5f9"),
              color: input.trim() && !sending
                ? "#ffffff"
                : (isEmployer ? "rgba(255,255,255,0.2)" : "#94a3b8"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !sending ? "pointer" : "default",
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow: input.trim() && !sending
                ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                : "none",
            }}
          >
            {sending ? (
              <div style={{
                width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid currentColor",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : (
              <IconSend size={15} />
            )}
          </button>
        </div>
        {maxLength > 300 && (
          <p style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: isEmployer ? "rgba(255,255,255,0.2)" : "#94a3b8",
            textAlign: "right",
          }}>
            {input.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Message Bubble (cập nhật) ──────────────────────────────────
function MessageBubble({ message, variant }: { message: ChatMessageData; variant: string }) {
  const isEmployer = variant === "employer";
  const isQA = message.type === "Q_AND_A";

  return (
    <div style={{
      display: "flex",
      justifyContent: message.isMe && !isEmployer ? "flex-end" : "flex-start",
    }}>
      <div style={{
        maxWidth: "80%",
        borderRadius: message.isMe && !isEmployer
          ? "18px 18px 6px 18px"
          : "18px 18px 18px 6px",
        padding: "10px 14px",
        background: isEmployer
          ? (isQA
            ? "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))"
            : "rgba(255,255,255,0.06)")
          : (message.isMe
            ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
            : (isQA
              ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
              : "#f8fafc")),
        border: isEmployer
          ? (isQA ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(255,255,255,0.08)")
          : (isQA && !message.isMe ? "1px solid #fde68a" : "1px solid #f1f5f9"),
        boxShadow: message.isMe && !isEmployer
          ? "0 4px 12px rgba(59, 130, 246, 0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Sender name */}
        {(!message.isMe || isEmployer) && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}>
            {/* Avatar placeholder */}
            <div style={{
              width: 22, height: 22,
              borderRadius: 8,
              background: isQA
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}>
              {message.senderName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: isEmployer
                ? (isQA ? "#fbbf24" : "#e2e8f0")
                : (isQA ? "#92400e" : "#475569"),
            }}>
              {message.senderName}
            </span>
            {isQA && (
              <span style={{
                fontSize: 10,
                background: isEmployer
                  ? "rgba(251, 191, 36, 0.2)"
                  : "rgba(245, 158, 11, 0.15)",
                color: isEmployer ? "#fbbf24" : "#92400e",
                padding: "2px 8px",
                borderRadius: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}>
                Q&A
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <p style={{
          margin: 0,
          fontSize: 13,
          color: isEmployer
            ? "#e2e8f0"
            : (message.isMe ? "#ffffff" : "#334155"),
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}>
          {message.content}
        </p>

        {/* Time */}
        <p style={{
          margin: "6px 0 0",
          fontSize: 10,
          color: isEmployer
            ? "rgba(255,255,255,0.25)"
            : (message.isMe ? "rgba(255,255,255,0.7)" : "#94a3b8"),
          textAlign: message.isMe && !isEmployer ? "right" : "left",
          letterSpacing: "0.03em",
        }}>
          {message.time.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}