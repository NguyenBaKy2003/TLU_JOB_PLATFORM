"use client";

import Link from "next/link";

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterSuccessStep() {
  return (
    <div className="w-full max-w-[300px] mx-auto text-center">
      {/* Check icon */}
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg
          width="32" height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tài khoản của bạn đã được xác thực.<br />
        Hãy đăng nhập để bắt đầu.
      </p>

      <Link
        href="/auth/login"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded text-sm font-semibold transition-colors text-center"
      >
        Đăng nhập ngay
      </Link>
    </div>
  );
}