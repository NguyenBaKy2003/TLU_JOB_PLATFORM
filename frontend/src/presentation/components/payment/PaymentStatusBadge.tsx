import type { PaymentStatus } from "@/domain/models/AdminPayment";

const CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:  { label: "Chờ xử lý", className: "bg-amber-50 text-amber-600 border-amber-200"  },
  SUCCESS:  { label: "Thành công", className: "bg-green-50 text-green-600 border-green-200" },
  FAILED:   { label: "Thất bại",   className: "bg-red-50 text-red-500 border-red-200"       },
  REFUNDED: { label: "Hoàn tiền",  className: "bg-purple-50 text-purple-600 border-purple-200" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = CONFIG[status] ?? {
    label: status, className: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
      font-medium border ${className}`}>
      {label}
    </span>
  );
}