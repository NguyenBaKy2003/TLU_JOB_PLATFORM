"use client";
import { Search, X } from "lucide-react";
import type { AdminUserRole } from "@/domain/models/AdminUser";

const ROLES: { value: AdminUserRole | ""; label: string }[] = [
  { value: "",            label: "Tất cả role"  },
  { value: "CANDIDATE",  label: "Ứng viên"      },
  { value: "EMPLOYER",   label: "Nhà tuyển dụng"},
  { value: "ADMIN",      label: "Admin"          },
];

interface Props {
  keyword:    string;
  role:       AdminUserRole | "";
  totalElements: number;
  onKeyword:  (v: string) => void;
  onRole:     (v: AdminUserRole | "") => void;
  onReset:    () => void;
}

export function UserFilters({ keyword, role, totalElements, onKeyword, onRole, onReset }: Props) {
  const hasFilter = !!keyword || !!role;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={e => onKeyword(e.target.value)}
          placeholder="Tìm email hoặc tên..."
          className="w-full pl-9 pr-4 py-2 text-[16px] border border-gray-200 rounded-xl
            bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20
            focus:border-red-400 transition-all"
        />
        {keyword && (
          <button onClick={() => onKeyword("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
              hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Role filter */}
      <select value={role} onChange={e => onRole(e.target.value as AdminUserRole | "")}
        className="px-3 py-2 text-[16px] border border-gray-200 rounded-xl bg-white
          focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer">
        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {/* Reset */}
      {hasFilter && (
        <button onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium
            text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl
            hover:bg-gray-50 transition-colors">
          <X size={12} /> Xoá lọc
        </button>
      )}

      <p className="ml-auto text-xs text-gray-400">
        <strong className="text-gray-700">{totalElements.toLocaleString()}</strong> người dùng
      </p>
    </div>
  );
}