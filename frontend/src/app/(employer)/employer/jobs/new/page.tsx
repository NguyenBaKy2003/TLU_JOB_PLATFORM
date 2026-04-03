"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Quay lại
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Đăng tin tuyển dụng</h2>
        <p className="text-sm text-gray-400">Điền thông tin vị trí tuyển dụng</p>
      </div>
    </div>
  );
}