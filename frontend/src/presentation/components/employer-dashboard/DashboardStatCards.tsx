// src/presentation/components/employer-dashboard/DashboardStatCards.tsx
import { ExternalLink, Users, MessageSquare, Calendar } from "lucide-react";
import type { StatCardData } from "./types";

const STAT_CARDS: StatCardData[] = [
  { label: "Ứng viên cần xem xét", value: 76, delta: "+8.4",  icon: <Users size={20} />         },
  { label: "Tin nhắn đã nhận",     value: 34, delta: "+12.1", icon: <MessageSquare size={20} /> },
  { label: "Lịch phỏng vấn",       value: 12, delta: "+3.2",  icon: <Calendar size={20} />      },
];

function Card({ label, value, icon }: StatCardData) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100
      px-5 py-4 hover:shadow-md transition-shadow group">
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center
        text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
      <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center
        justify-center text-gray-400 transition-colors">
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

export function DashboardStatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {STAT_CARDS.map(s => <Card key={s.label} {...s} />)}
    </div>
  );
}