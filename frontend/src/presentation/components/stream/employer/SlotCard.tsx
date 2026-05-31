"use client";

import { useState } from "react";
import { Clock, UserPlus, CheckCircle2, User } from "lucide-react";
import { CandidatePickerModal } from "@/presentation/components/stream/employer/CandidatePickerModal";
import type { InterviewSlot } from "@/domain/models/LiveStream";

interface Props {
  slot:      InterviewSlot;
  index:     number;
  sessionId: string;
  onInvite:  (sessionId: string, candidateId: string, slotId: string) => Promise<void>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
  });
}

function calcEndTime(startIso: string, durationMinutes: number): string {
  const end = new Date(new Date(startIso).getTime() + durationMinutes * 60_000);
  return end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

// SlotStatus từ domain: "OPEN" | "ASSIGNED" | "DONE"
function slotStatusConfig(status: InterviewSlot["status"]) {
  switch (status) {
    case "OPEN":
      return {
        dot:       "bg-emerald-400",
        badge:     "bg-emerald-50 text-emerald-700 border-emerald-200",
        label:     "Còn trống",
        canInvite: true,
      };
    case "ASSIGNED":
      return {
        dot:       "bg-blue-400",
        badge:     "bg-blue-50 text-blue-700 border-blue-200",
        label:     "Đã gán",
        canInvite: false,
      };
    case "DONE":
      return {
        dot:       "bg-gray-300",
        badge:     "bg-gray-100 text-gray-500 border-gray-200",
        label:     "Hoàn thành",
        canInvite: false,
      };
    default:
      return {
        dot:       "bg-gray-300",
        badge:     "bg-gray-100 text-gray-500 border-gray-200",
        label:     status,
        canInvite: false,
      };
  }
}

export function SlotCard({ slot, index, sessionId, onInvite }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const cfg = slotStatusConfig(slot.status);

  const timeRange = slot.startTime
    ? `${formatTime(slot.startTime)} – ${calcEndTime(slot.startTime, slot.durationMinutes)}`
    : `Slot ${index + 1}`;

  const slotLabel = `Slot ${index + 1} – ${slot.startTime ? formatTime(slot.startTime) : ""}`;

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border
          transition-all duration-150
          ${cfg.canInvite
            ? "border-slate-200 hover:border-slate-300 hover:shadow-sm"
            : "border-slate-100 opacity-75"
          }`}
      >
        {/* Index badge */}
        <div className="flex items-center justify-center w-7 h-7 rounded-lg
          bg-slate-100 text-slate-500 text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>

        {/* Time range */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Clock size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-[13px] font-medium text-slate-700 truncate">
            {timeRange}
          </span>
          {slot.durationMinutes > 0 && (
            <span className="text-[11px] text-slate-400 flex-shrink-0">
              ({slot.durationMinutes} phút)
            </span>
          )}
        </div>

        {/* Candidate chip — khi đã ASSIGNED */}
        {slot.status === "ASSIGNED" && slot.candidateId && (
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600
            bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex-shrink-0">
            <User size={11} className="text-slate-400" />
            <span className="truncate max-w-[120px]">Đã gán ứng viên</span>
          </div>
        )}

        {/* Done chip */}
        {slot.status === "DONE" && (
          <div className="flex items-center gap-1 text-[12px] text-emerald-600
            bg-emerald-50 rounded-lg px-2.5 py-1 flex-shrink-0">
            <CheckCircle2 size={11} />
            <span>Xong</span>
          </div>
        )}

        {/* Status badge */}
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
          border flex items-center gap-1.5 flex-shrink-0 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </span>

        {/* Invite button — chỉ khi OPEN */}
        {cfg.canInvite && (
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
              font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95
              transition-all flex-shrink-0"
          >
            <UserPlus size={12} />
            Mời
          </button>
        )}
      </div>

      {/* Candidate picker modal */}
      {pickerOpen && (
        <CandidatePickerModal
          slotId={slot.slotId}
          slotLabel={slotLabel}
          sessionId={sessionId}
          onInvite={onInvite}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}