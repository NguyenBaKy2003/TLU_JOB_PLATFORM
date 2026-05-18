"use client";
import { Eye, Power }      from "lucide-react";
import type { AdminUser }  from "@/domain/models/AdminUser";
import { UserRoleBadge }   from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  users:       AdminUser[];
  togglingId:  string | null;
  onView:      (user: AdminUser) => void;
  onToggle:    (user: AdminUser) => void;
}

export function UserTable({ users, togglingId, onView, onToggle }: Props) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="py-20 text-center text-[16px] text-gray-400">Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-50">
              {["Người dùng", "Role", "Trạng thái", "Ngày tạo", "Đăng nhập cuối", ""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold
                  text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}
                className={`border-b border-gray-50 transition-colors
                  ${user.active ? "hover:bg-gray-50/60" : "bg-gray-50/40 hover:bg-gray-100/60"}`}>

                {/* Avatar + name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                      text-xs font-bold shrink-0
                      ${user.active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                      {initials(user.fullName)}
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-[11px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4"><UserRoleBadge role={user.role} /></td>
                <td className="px-5 py-4"><UserStatusBadge active={user.active} /></td>
                <td className="px-5 py-4 text-xs text-gray-600">{fmt(user.createdAt)}</td>
                <td className="px-5 py-4 text-xs text-gray-600">{fmt(user.lastLoginAt)}</td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                        rounded-lg transition-colors" title="Xem chi tiết">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onToggle(user)}
                      disabled={togglingId === user.id}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40
                        ${user.active
                          ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                      title={user.active ? "Khoá tài khoản" : "Mở khoá"}>
                      {togglingId === user.id
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300
                            border-t-gray-600 rounded-full animate-spin block" />
                        : <Power size={14} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}