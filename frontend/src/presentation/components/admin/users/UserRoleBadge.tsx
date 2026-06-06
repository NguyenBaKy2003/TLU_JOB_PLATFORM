import type { AdminUserRole } from "@/domain/models/AdminUser";

const ROLE_CONFIG: Record<AdminUserRole, { label: string; className: string }> = {
  CANDIDATE:   { label: "Ứng viên",    className: "bg-blue-50   text-blue-700   border-blue-200"   },
  EMPLOYER:    { label: "Nhà tuyển",   className: "bg-purple-50 text-purple-700 border-purple-200" },
  ADMIN:       { label: "Admin",       className: "bg-red-50    text-red-700    border-red-200"     },
};

export function UserRoleBadge({ role }: { role: AdminUserRole }) {
  const cfg = ROLE_CONFIG[role] ?? { label: role, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px]
      font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}