// components/stream/employer/create/ReviewStep.tsx
import React from "react";
import { Clock } from "lucide-react";
import type { CreateSessionRequest } from "@/domain/models/LiveStream";

interface ReviewStepProps {
  data: Partial<CreateSessionRequest>;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const infoItems = [
    { label: "Tiêu đề", value: data.title },
    {
      label: "Loại phiên",
      value: data.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn trực tiếp",
    },
    {
      label: "Thời gian bắt đầu",
      value: data.scheduledAt
        ? new Date(data.scheduledAt).toLocaleString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    { label: "Mô tả", value: data.description || "Không có" },
  ];

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
        {infoItems.map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-4 py-3.5">
            <span className="text-xs text-slate-400 w-28 shrink-0 pt-0.5 font-medium">
              {label}
            </span>
            <span className="text-sm text-slate-700 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Interview slots */}
      {data.sessionType === "INTERVIEW" && data.interviewSlots && data.interviewSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              {data.interviewSlots.length} Interview Slots
            </p>
          </div>
          <div className="space-y-2">
            {data.interviewSlots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1">
                  {new Date(slot.startTime).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                <span className="text-slate-400 text-xs">{slot.durationMinutes} phút</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}