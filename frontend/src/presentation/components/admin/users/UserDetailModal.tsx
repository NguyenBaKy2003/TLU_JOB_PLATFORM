"use client";
import { useState }           from "react";
import { X, Mail, Calendar, Clock, Shield } from "lucide-react";
import type { AdminUser, AdminUserRole } from "@/domain/models/AdminUser";
import { UserRoleBadge }      from "./UserRoleBadge";
import { UserStatusBadge }    from "./UserStatusBadge";

const ALL_ROLES: AdminUserRole[] = ["CANDIDATE", "EMPLOYER", "ADMIN", "SUPER_ADMIN"];
const ROLE_LABELS: Record<AdminUserRole, string> = {
  CANDIDATE: "Ứng viên", EMPLOYER: "Nhà tuyển dụng",
  ADMIN: "Admin", SUPER_ADMIN: "Super Admin",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  user:         AdminUser;
  onClose:      () => void;
  onToggle:     (user: AdminUser) => Promise<void>;
  onChangeRole: (user: AdminUser, role: AdminUserRole) => Promise<void>;
}

export function UserDetailModal({ user, onClose, onToggle, onChangeRole }: Props) {
  const [busyToggle, setBusyToggle] = useState(false);
  const [busyRole,   setBusyRole]   = useState(false);
  const [newRole,    setNewRole]    = useState<AdminUserRole>(user.role);

  const handleToggle = async () => {
    setBusyToggle(true);
    try { await onToggle(user); } finally { setBusyToggle(false); }
  };

  const handleChangeRole = async () => {
    if (newRole === user.role) return;
    setBusyRole(true);
    try { await onChangeRole(user, newRole); } finally { setBusyRole(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Chi tiết người dùng</h2>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center
              justify-center shrink-0">
              <span className="text-red-700 font-bold text-lg">{initials(user.fullName)}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{user.fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge active={user.active} />
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-gray-600">
              <Mail size={14} className="text-gray-400 shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <span>Tạo lúc: {fmt(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <span>Đăng nhập cuối: {fmt(user.lastLoginAt)}</span>
            </div>
          </div>

          {/* Change role */}
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-gray-500" />
              <p className="text-xs font-semibold text-gray-700">Thay đổi quyền</p>
            </div>
            <div className="flex gap-2">
              <select value={newRole}
                onChange={e => setNewRole(e.target.value as AdminUserRole)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl
                  bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer">
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <button onClick={handleChangeRole}
                disabled={busyRole || newRole === user.role}
                className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white
                  rounded-xl hover:bg-gray-800 disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors">
                {busyRole ? "..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={handleToggle} disabled={busyToggle}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold
              rounded-xl border transition-colors disabled:opacity-50
              ${user.active
                ? "border-red-200 text-red-600 hover:bg-red-50"
                : "border-green-200 text-green-700 hover:bg-green-50"
              }`}>
            {busyToggle && (
              <span className="w-3 h-3 border-2 border-current border-t-transparent
                rounded-full animate-spin" />
            )}
            {user.active ? "Khoá tài khoản" : "Mở khoá tài khoản"}
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}