import { Users, Briefcase, DollarSign, Building2 } from "lucide-react";
import type { StatCardData } from "./types";

const STAT_CARDS: StatCardData[] = [
  { label: "Tổng người dùng",     value: "12,340", delta: "+5.2",  icon: <Users      size={20} /> },
  { label: "Tin đăng đang hoạt động", value: 847,  delta: "+11.3", icon: <Briefcase  size={20} /> },
  { label: "Doanh thu tháng này",  value: "₫84M",  delta: "+18.7", icon: <DollarSign size={20} /> },
  { label: "Công ty đã đăng ký",  value: 392,      delta: "+3.1",  icon: <Building2  size={20} /> },
];

function Card({ label, value, delta, icon }: StatCardData) {
  const positive = String(delta).startsWith("+");
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100
      px-5 py-4 hover:shadow-md transition-shadow group">
      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center
        text-red-600 shrink-0 group-hover:bg-red-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
      <span className={`text-xs font-semibold ${positive ? "text-emerald-500" : "text-red-500"}`}>
        {delta}%
      </span>
    </div>
  );
}

export function AdminDashboardStatCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {STAT_CARDS.map(s => <Card key={s.label} {...s} />)}
    </div>
  );
}