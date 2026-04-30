// components/stream/employer/SlotCard.tsx
"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";

interface SlotCardProps {
  slot: LiveStreamSession["interviewSlots"][0];
  index: number;
  onInvite: (sessionId: string, candidateId: string, slotId: string) => Promise<void>;
  sessionId: string;
}

export function SlotCard({ slot, index, onInvite, sessionId }: SlotCardProps) {
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(!!slot.candidateId);

  const handleInvite = async () => {
    if (!candidateId.trim()) return;
    setLoading(true);
    try {
      await onInvite(sessionId, candidateId.trim(), slot.slotId);
      setInvited(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border ${
        invited
          ? "bg-emerald-50 border-emerald-100"
          : slot.status === "OPEN"
          ? "bg-white border-slate-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            invited ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {invited ? "✓" : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">
              {new Date(slot.startTime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
            <span className="text-xs text-slate-400">{slot.durationMinutes} phút</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto ${
                invited
                  ? "bg-emerald-100 text-emerald-600"
                  : slot.status === "OPEN"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              {invited ? "Đã mời" : slot.status === "OPEN" ? "Trống" : "Đã đặt"}
            </span>
          </div>

          {!invited && slot.status === "OPEN" && (
            <div className="flex gap-2 mt-2">
              <input
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="Candidate ID"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
              <button
                onClick={handleInvite}
                disabled={loading || !candidateId.trim()}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50 font-medium"
              >
                {loading ? <Loader className="w-3 h-3 animate-spin" /> : "Mời"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}