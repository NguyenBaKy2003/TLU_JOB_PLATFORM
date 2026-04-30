// components/stream/candidate/PollBanner.tsx
import React from "react";

interface PollData {
  eventId: string;
  question: string;
  options: string[];
  responses: Record<number, number>;
  myAnswer: number | null;
}

interface PollBannerProps {
  poll: PollData;
  onAnswer: (i: number) => void;
}

export function PollBanner({ poll, onAnswer }: PollBannerProps) {
  const total = Object.values(poll.responses).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      margin: "0 16px", background: "#fff",
      border: "1px solid #f1f5f9", borderRadius: 16, padding: 16,
    }}>
      <p style={{
        margin: "0 0 4px", fontSize: 11, fontWeight: 700,
        color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        📊 Poll
      </p>
      <p style={{
        margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#1e293b",
      }}>
        {poll.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.options.map((opt, i) => {
          const cnt = poll.responses[i] ?? 0;
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const chosen = poll.myAnswer === i;
          return (
            <button
              key={i}
              onClick={() => poll.myAnswer === null && onAnswer(i)}
              disabled={poll.myAnswer !== null}
              style={{
                position: "relative", textAlign: "left",
                border: chosen ? "1.5px solid #334155" : "1px solid #e2e8f0",
                borderRadius: 10, padding: "8px 12px", background: "#fff",
                cursor: poll.myAnswer === null ? "pointer" : "default",
                fontSize: 13,
                color: chosen ? "#1e293b" : "#475569",
                fontWeight: chosen ? 600 : 400,
                overflow: "hidden",
              }}
            >
              {poll.myAnswer !== null && (
                <div style={{
                  position: "absolute", inset: "0 auto 0 0",
                  width: `${pct}%`, background: "#f1f5f9",
                  transition: "width 0.5s ease",
                }} />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{opt}</span>
              {poll.myAnswer !== null && (
                <span style={{
                  position: "relative", zIndex: 1, float: "right",
                  fontSize: 12, color: "#94a3b8",
                }}>
                  {pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      {poll.myAnswer === null && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Chọn đáp án để tham gia
        </p>
      )}
    </div>
  );
}