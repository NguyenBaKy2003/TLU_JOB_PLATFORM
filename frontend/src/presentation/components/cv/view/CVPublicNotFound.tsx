"use client";

import Link from "next/link";
import { FileX2, ArrowLeft, Search } from "lucide-react";

export function CVPublicNotFound() {
  return (
    <div className="min-h-screen bg-[#F0EEE9] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-sm flex items-center justify-center">
            <FileX2 className="w-10 h-10 text-[#3D5A80]/40" strokeWidth={1.4} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
            <Search className="w-4 h-4 text-red-400" strokeWidth={1.8} />
          </div>
        </div>

        <h1 className="text-xl font-black text-gray-800 mb-2">
          Không tìm thấy CV
        </h1>
        <p className="text-[16px] text-gray-500 leading-relaxed mb-8">
          CV này không tồn tại, đã bị xóa, hoặc chủ sở hữu đã đặt chế độ riêng tư.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-[16px] font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-[16px] font-semibold text-white bg-[#3D5A80] hover:bg-[#2E4565] rounded-xl transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}