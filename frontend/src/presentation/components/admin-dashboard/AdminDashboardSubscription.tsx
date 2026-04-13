import Link from "next/link";
import { CreditCard } from "lucide-react";

const PLAN_STATS = [
  { label: "Free",       count: 210, color: "bg-gray-200"   },
  { label: "Basic",      count: 98,  color: "bg-blue-400"   },
  { label: "Pro",        count: 57,  color: "bg-violet-500" },
  { label: "Enterprise", count: 27,  color: "bg-amber-500"  },
];

const total = PLAN_STATS.reduce((s, p) => s + p.count, 0);

export function AdminDashboardSubscription() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <CreditCard size={13} className="text-violet-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Subscription</p>
          <p className="text-[10px] text-gray-400">{total} công ty đang dùng</p>
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
        {PLAN_STATS.map(p => (
          <div key={p.label} className={`${p.color} rounded-full`}
            style={{ width: `${(p.count / total) * 100}%` }} />
        ))}
      </div>

      <div className="space-y-1.5 mb-3">
        {PLAN_STATS.map(p => (
          <div key={p.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${p.color}`} />
              <span className="text-gray-600">{p.label}</span>
            </div>
            <span className="font-semibold text-gray-900">{p.count}</span>
          </div>
        ))}
      </div>

      <Link href="/admin/subscription"
        className="block w-full text-center py-2 rounded-xl border border-gray-200
          text-xs font-semibold text-gray-700 hover:border-red-300 hover:text-red-600
          hover:bg-red-50 transition-all">
        Quản lý gói dịch vụ
      </Link>
    </div>
  );
}