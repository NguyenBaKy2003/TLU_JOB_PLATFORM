import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      px-5 py-4 flex items-center gap-3">
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

interface Props {
  totalRevenue:  number;
  totalCount:    number;
  successCount:  number;
  failedCount:   number;
  currency?:     string;
}

export function PaymentStatCards({
  totalRevenue, totalCount, successCount, failedCount, currency = "VND",
}: Props) {
  const fmt = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={<DollarSign   size={18} className="text-blue-600"  />}
        label="Doanh thu"   value={fmt(totalRevenue)}
        color="bg-blue-50"
      />
      <StatCard
        icon={<Clock        size={18} className="text-amber-500" />}
        label="Tổng giao dịch" value={totalCount.toLocaleString()}
        color="bg-amber-50"
      />
      <StatCard
        icon={<CheckCircle  size={18} className="text-green-600" />}
        label="Thành công"  value={successCount.toLocaleString()}
        color="bg-green-50"
      />
      <StatCard
        icon={<XCircle      size={18} className="text-red-500"   />}
        label="Thất bại"    value={failedCount.toLocaleString()}
        color="bg-red-50"
      />
    </div>
  );
}