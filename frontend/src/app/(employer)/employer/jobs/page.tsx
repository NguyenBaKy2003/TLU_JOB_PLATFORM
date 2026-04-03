"use client";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function EmployerJobsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Tin tuyển dụng</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý tất cả tin đăng của bạn</p>
        </div>
        <Link href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm
            font-semibold rounded-xl hover:bg-violet-700 transition-colors">
          <PlusCircle size={16} />
          Đăng tin mới
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-sm text-gray-400">Danh sách tin tuyển dụng — coming soon</p>
      </div>
    </div>
  );
}