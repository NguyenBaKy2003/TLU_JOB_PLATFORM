import { Building2, RotateCcw } from "lucide-react";
import type { VerificationStatus } from "@/domain/models/AdminCompany";

interface Props {
  status:        VerificationStatus | "";
  totalElements: number;
  onStatus:      (v: VerificationStatus | "") => void;
  onReset:       () => void;
}

const STATUS_OPTIONS: { value: VerificationStatus | ""; label: string }[] = [
  { value: "",          label: "Tất cả"     },
  { value: "UNVERIFIED",   label: "Chờ duyệt"  },
  { value: "VERIFIED",  label: "Đã duyệt"   },
  { value: "REJECTED",  label: "Từ chối"    },
  { value: "SUSPENDED", label: "Đã khoá"    },
];

export function CompanyFilters({ status, totalElements, onStatus, onReset }: Props) {
  const isFiltering = status !== "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
      flex flex-col sm:flex-row sm:items-center gap-3">

      {/* Icon + label */}
      <div className="flex items-center gap-2 text-gray-400 shrink-0">
        <Building2 size={16} />
        <span className="text-sm font-medium text-gray-500">
          {totalElements.toLocaleString()} công ty
        </span>
      </div>

      <div className="flex-1" />

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 shrink-0">Trạng thái:</span>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onStatus(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${status === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {isFiltering && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
            text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <RotateCcw size={13} />
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}