"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Users, UserCheck, UserX, Shield }           from "lucide-react";
import { AdminUserService }                          from "@/application/services/AdminUserService";
import { AdminUserRepository }                       from "@/infrastructure/repositories/AdminUserRepository";
import { UserTable }                                 from "@/presentation/components/admin/users/UserTable";
import { UserFilters }                               from "@/presentation/components/admin/users/UserFilters";
import { UserDetailModal }                           from "@/presentation/components/admin/users/UserDetailModal";
import { Pagination }                                from "@/presentation/components/common/Pagination";
import { useToast }                                  from "@/presentation/components/ui/toast";
import { extractErrorMessage }                       from "@/lib/extractErrorMessage";
import type { AdminUser, AdminUserRole }             from "@/domain/models/AdminUser";

const service = new AdminUserService(new AdminUserRepository());

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
      flex items-center gap-3">
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

// ── Skeleton ───────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-2.5 bg-gray-100 rounded w-48" />
          </div>
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="flex gap-1">
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const toast = useToast();

  const [users,         setUsers]         = useState<AdminUser[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [keyword,       setKeyword]       = useState("");
  const [role,          setRole]          = useState<AdminUserRole | "">("");
  const [loading,       setLoading]       = useState(true);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);
  const [selectedUser,  setSelectedUser]  = useState<AdminUser | null>(null);

  // debounce keyword
  const keywordRef  = useRef(keyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, kw: string, r: AdminUserRole | "") => {
    setLoading(true);
    try {
      const res = await service.listUsers({ page: p, size: PAGE_SIZE, keyword: kw, role: r });
      setUsers(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load khi page / role thay đổi
  useEffect(() => { load(page, keywordRef.current, role); }, [page, role, load]);

  // Debounce keyword
  const handleKeyword = (v: string) => {
    setKeyword(v);
    keywordRef.current = v;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, v, role);
    }, 400);
  };

  const handleRole = (v: AdminUserRole | "") => {
    setRole(v);
    setPage(0);
  };

  const handleReset = () => {
    setKeyword("");
    setRole("");
    setPage(0);
    keywordRef.current = "";
    load(0, "", "");
  };

  // ── Toggle active ─────────────────────────────────────────────────────────

  const handleToggle = useCallback(async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      const updated = await service.toggleActive(user.id);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      // Cập nhật modal nếu đang mở
      setSelectedUser(prev => prev?.id === updated.id ? updated : prev);
      toast.success(
        updated.active ? "Đã mở khoá" : "Đã khoá",
        `Tài khoản ${user.fullName} đã được ${updated.active ? "mở khoá" : "khoá"}.`,
      );
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setTogglingId(null);
    }
  }, [toast]);

  // ── Change role ───────────────────────────────────────────────────────────

  const handleChangeRole = useCallback(async (user: AdminUser, newRole: AdminUserRole) => {
    try {
      const updated = await service.changeRole(user.id, newRole);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setSelectedUser(prev => prev?.id === updated.id ? updated : prev);
      toast.success("Đã cập nhật", `Role của ${user.fullName} đã được thay đổi.`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      throw e;
    }
  }, [toast]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const activeCount = users.filter(u => u.active).length;
  const lockedCount = users.filter(u => !u.active).length;
  const adminCount  = users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  return (
    <div className="flex flex-col gap-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users     size={18} className="text-blue-600"  />} label="Tổng users"    value={totalElements.toLocaleString()} color="bg-blue-50"  />
        <StatCard icon={<UserCheck size={18} className="text-green-600" />} label="Đang hoạt động" value={activeCount}                    color="bg-green-50" />
        <StatCard icon={<UserX    size={18} className="text-red-500"   />} label="Bị khoá"        value={lockedCount}                    color="bg-red-50"   />
        <StatCard icon={<Shield   size={18} className="text-purple-600"/>} label="Admin"          value={adminCount}                     color="bg-purple-50"/>
      </div>

      {/* Filters */}
      <UserFilters
        keyword={keyword} role={role}
        totalElements={totalElements}
        onKeyword={handleKeyword}
        onRole={handleRole}
        onReset={handleReset}
      />

      {/* Table */}
      {loading
        ? <TableSkeleton />
        : <UserTable
            users={users}
            togglingId={togglingId}
            onView={setSelectedUser}
            onToggle={handleToggle}
          />
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={page + 1}
            total={totalPages}
            onChange={p => setPage(p - 1)}
          />
        </div>
      )}

      {/* Detail modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggle={handleToggle}
          onChangeRole={handleChangeRole}
        />
      )}
    </div>
  );
}