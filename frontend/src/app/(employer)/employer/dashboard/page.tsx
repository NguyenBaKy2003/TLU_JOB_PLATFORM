// src/app/(employer)/dashboard/page.tsx
"use client";
import { useEffect }         from "react";
import { useRouter }         from "next/navigation";
import { useAuth }           from "@/application/contexts/AuthContext";
import { EmployerDashboard } from "@/presentation/components/employer-dashboard";

export default function EmployerDashboardPage() {
  const { user, loading } = useAuth();
  const router            = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Nếu đăng nhập nhưng không phải EMPLOYER → redirect về trang phù hợp
    if (user.role !== "EMPLOYER") {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    }
  }, [user, loading, router]);

  // Loading state
  if (loading || !user || user.role !== "EMPLOYER") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600
            border-t-transparent animate-spin" />
          <p className="text-[16px] text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <EmployerDashboard />;
}