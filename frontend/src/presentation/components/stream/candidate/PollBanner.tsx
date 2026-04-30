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
  const isAnswered = poll.myAnswer !== null;

  return (
    <div className="mx-4  bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
        📊 Poll {isAnswered && "• Đã trả lời"}
      </p>
      <p className="text-sm font-semibold text-slate-800 mb-3">
        {poll.question}
      </p>
      <div className="flex flex-col gap-2">
        {poll.options.map((opt, i) => {
          const cnt = poll.responses[i] ?? 0;
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const chosen = poll.myAnswer === i;

          return (
            <button
              key={i}
              onClick={() => !isAnswered && onAnswer(i)}
              disabled={isAnswered}
              className={`relative text-left w-full rounded-lg px-3.5 py-2.5 text-[13px] overflow-hidden
                ${chosen 
                  ? "border-2 border-blue-500 bg-blue-50 text-blue-800 font-semibold" 
                  : "border border-slate-200 bg-white text-slate-600"
                }
                ${isAnswered ? "cursor-default" : "cursor-pointer hover:border-slate-300"}
              `}
            >
              {isAnswered && (
                <div 
                  className={`absolute inset-y-0 left-0 ${chosen ? "bg-blue-100" : "bg-slate-100"}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative z-10">{opt}</span>
              {isAnswered && (
                <span className="relative z-10 float-right text-xs text-slate-400">
                  {pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400 text-center">
        {isAnswered ? `Tổng ${total} phiếu` : "Chọn đáp án để tham gia"}
      </p>
    </div>
  );
}