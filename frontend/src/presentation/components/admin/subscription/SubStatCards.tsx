// src/presentation/components/admin/subscription/SubStatCards.tsx
import { DollarSign, Zap, Users, BarChart2 } from "lucide-react";
import type { SubscriptionPlan }             from "@/domain/models/CompanySubscription";

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
      flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface Props { plans: SubscriptionPlan[]; totalSubs: number; }

export function SubStatCards({ plans, totalSubs }: Props) {
  const active = plans.filter(p => p.active).length;
  const free   = plans.filter(p => p.priceMonthly === 0).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={<DollarSign size={18} className="text-blue-600"   />}
        label="Tổng gói"      value={plans.length}              color="bg-blue-50"   />
      <StatCard icon={<Zap      size={18} className="text-green-600"  />}
        label="Đang active"   value={active}                    color="bg-green-50"  />
      <StatCard icon={<Users    size={18} className="text-purple-600" />}
        label="Subscriptions" value={totalSubs.toLocaleString()} color="bg-purple-50" />
      <StatCard icon={<BarChart2 size={18} className="text-amber-600" />}
        label="Gói miễn phí"  value={free}                      color="bg-amber-50"  />
    </div>
  );
}