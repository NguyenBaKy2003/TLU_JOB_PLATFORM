// src/presentation/components/employer-dashboard/DashboardSchedule.tsx
import { Calendar }            from "lucide-react";
import { MOCK_INTERVIEWS, SCHEDULE_DAYS, avatarColor } from "./types";

export function DashboardSchedule() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Lịch trình</h3>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg
          hover:bg-gray-100 text-gray-400 transition-colors">
          <Calendar size={14} />
        </button>
      </div>

      {/* Day picker */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {SCHEDULE_DAYS.map(d => (
          <button key={d.date}
            className={`flex flex-col items-center py-2.5 rounded-xl transition-all ${
              d.active
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-gray-100 text-gray-500"
            }`}>
            <span className="text-[10px] font-medium mb-1 opacity-70">{d.label}</span>
            <span className="text-sm font-bold">{d.date}</span>
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-900 mb-3">Lịch phỏng vấn hôm nay</p>

      <div className="space-y-2">
        {MOCK_INTERVIEWS.map((iv, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl
            hover:bg-gray-50 transition-colors cursor-pointer">
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              text-white text-xs font-bold shrink-0 ${avatarColor(i)}`}>
              {iv.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                Phỏng vấn {iv.name}
              </p>
              <p className="text-[10px] text-gray-400">{iv.time}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50
                text-blue-600 text-[10px] font-medium rounded-full">
                {iv.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}