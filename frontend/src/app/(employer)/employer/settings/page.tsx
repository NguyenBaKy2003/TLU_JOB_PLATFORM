// src/employer/settings/page.tsx
"use client";
import { useAuth }              from "@/application/contexts/AuthContext";
import { NameSection }          from "@/presentation/components/settings/NameSection";
import { AccountSection }       from "@/presentation/components/settings/AccountSection";
import { NotificationSection }  from "@/presentation/components/settings/NotificationSection";
import { DeleteAccountSection } from "@/presentation/components/settings/DeleteAccountSection";
import { Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

// ── Employer-specific info panel ──────────────────────────────────────────────

function EmployerInfoPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <Building2 size={16} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-800">Tài khoản doanh nghiệp</h2>
      </div>
      <div className="px-5 py-4 flex flex-col gap-2">
        <Link
          href="/employer/profile"
          className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Hồ sơ doanh nghiệp</p>
            <p className="text-xs text-gray-400 mt-0.5">Logo, mô tả, địa chỉ công ty</p>
          </div>
          <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Link>
        <Link
          href="/employer/jobs"
          className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Quản lý tin tuyển dụng</p>
            <p className="text-xs text-gray-400 mt-0.5">Xem, chỉnh sửa và đóng tin đăng</p>
          </div>
          <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Link>
        <Link
          href="/employer/applications"
          className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Đơn ứng tuyển</p>
            <p className="text-xs text-gray-400 mt-0.5">Xem và xử lý hồ sơ ứng viên</p>
          </div>
          <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

      {/* Left — shared setting sections */}
      <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
        <NameSection firstName={user?.fullName ?? ""} />
        <AccountSection email={user?.email ?? ""} />
        <NotificationSection />
        <DeleteAccountSection />
      </div>

      {/* Right — employer-specific quick links */}
      <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">
        <EmployerInfoPanel />
      </div>

    </div>
  );
}