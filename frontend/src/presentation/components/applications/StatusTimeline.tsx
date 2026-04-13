// src/presentation/components/applications/StatusTimeline.tsx
import type { ApplicationStatusLog } from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS } from "@/domain/models/Application";
import { Clock } from "lucide-react";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props { logs: ApplicationStatusLog[]; loading?: boolean }

export function StatusTimeline({ logs, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 bg-gray-100 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) return (
    <p className="text-xs text-gray-400 italic">Chưa có lịch sử trạng thái</p>
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-1 top-2 bottom-2 w-px bg-gray-100" />
      <div className="flex flex-col gap-4">
        {logs.map((log, i) => (
          <div key={log.id} className="flex gap-3 relative">
            <div className={`w-2.5 h-2.5 rounded-full border-2 mt-1.5 shrink-0 z-10
              ${i === 0 ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${i === 0 ? "text-gray-900" : "text-gray-600"}`}>
                {APPLICATION_STATUS_LABELS[log.status]}
              </p>
              {log.note && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{log.note}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Clock size={10} /> {formatDateTime(log.changedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}