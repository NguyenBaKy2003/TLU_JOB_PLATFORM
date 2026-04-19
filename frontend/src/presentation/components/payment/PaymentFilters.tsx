import type { PaymentStatus } from "@/domain/models/AdminPayment";

const STATUS_FILTERS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "",         label: "Tất cả"     },
  { value: "PENDING",  label: "Chờ xử lý"  },
  { value: "SUCCESS",  label: "Thành công" },
  { value: "FAILED",   label: "Thất bại"   },
  { value: "REFUNDED", label: "Hoàn tiền"  },
];

interface Props {
  status:        PaymentStatus | "";
  totalElements: number;
  onStatus:      (s: PaymentStatus | "") => void;
  extra?:        React.ReactNode; // slot cho nút SUPER_ADMIN
}

export function PaymentFilters({ status, totalElements, onStatus, extra }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onStatus(f.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
              ${status === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {totalElements.toLocaleString()} giao dịch
        </span>
        {extra}
      </div>
    </div>
  );
}