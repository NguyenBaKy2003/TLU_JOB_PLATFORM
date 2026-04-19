import { Users } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { AdminPayment }   from "@/domain/models/AdminPayment";
import type { EmployerPayment } from "@/domain/models/EmployerPayment";

type AnyPayment = AdminPayment | EmployerPayment;

interface Column<T> {
  key:    string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T extends AnyPayment> {
  payments:      T[];
  columns:       Column<T>[];
  onView:        (id: string) => void;
  emptyLabel?:   string;
}

export function PaymentTable<T extends AnyPayment>({
  payments,
  columns,
  onView,
  emptyLabel = "Không có giao dịch nào",
}: Props<T>) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
        py-16 flex flex-col items-center gap-2 text-gray-400">
        <Users size={32} strokeWidth={1.2} />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/60">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-left text-xs font-semibold
                    text-gray-400 uppercase tracking-wide ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              <th className="px-5 py-3 text-right text-xs font-semibold
                text-gray-400 uppercase tracking-wide">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`px-5 py-3.5 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onView(row.id)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600
                      bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}