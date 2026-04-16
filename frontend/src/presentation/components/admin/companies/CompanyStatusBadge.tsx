import type { VerificationStatus } from "@/domain/models/AdminCompany";

const CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  UNVERIFIED:   { label: "Chờ duyệt",  className: "bg-amber-50  text-amber-700  ring-amber-200"  },
  VERIFIED:  { label: "Đã duyệt",   className: "bg-green-50  text-green-700  ring-green-200"  },
  REJECTED:  { label: "Từ chối",    className: "bg-red-50    text-red-600    ring-red-200"    },
  SUSPENDED: { label: "Đã khoá",    className: "bg-gray-100  text-gray-600   ring-gray-200"   },
};

export function CompanyStatusBadge({ status }: { status: VerificationStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.UNVERIFIED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
      font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}