// src/presentation/components/cv/CVAuthRequired.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileText, LogIn, UserPlus, ShieldAlert } from "lucide-react";

interface CVAuthRequiredProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

export function CVAuthRequired({ 
  isAuthenticated = false, 
  userRole 
}: CVAuthRequiredProps) {
  const router = useRouter();

  const isNotLoggedIn = !isAuthenticated;
  const isWrongRole = isAuthenticated && userRole !== "CANDIDATE";

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6">
          {isNotLoggedIn ? (
            <LogIn className="w-10 h-10 text-[#3D5A80]" />
          ) : (
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {isNotLoggedIn ? "Đăng nhập để tiếp tục" : "Không có quyền truy cập"}
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-8">
          {isNotLoggedIn ? (
            "Vui lòng đăng nhập với tài khoản ứng viên để tạo và quản lý CV của bạn."
          ) : (
            <>
              Chỉ tài khoản <span className="font-semibold text-[#3D5A80]">Ứng viên (Candidate)</span> mới có thể sử dụng tính năng này.
              {userRole && (
                <>
                  <br />
                  Vai trò hiện tại của bạn: <span className="font-semibold text-gray-700">{userRole}</span>
                </>
              )}
            </>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isNotLoggedIn ? (
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D5A80] hover:bg-[#2E4565] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
              <button
                onClick={() => router.push("/auth/signup")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-[#3D5A80] text-sm font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Tạo tài khoản mới
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D5A80] hover:bg-[#2E4565] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Về trang chủ
              </button>
              <button
                onClick={() => router.push("/jobs")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                Xem tin tuyển dụng
              </button>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="mt-6 text-xs text-gray-400">
          {isNotLoggedIn
            ? "Bạn chưa có tài khoản? Đăng ký ngay để bắt đầu tạo CV chuyên nghiệp."
            : "Bạn là nhà tuyển dụng? Hãy chuyển sang khu vực dành cho Employer."}
        </p>
      </div>
    </div>
  );
}