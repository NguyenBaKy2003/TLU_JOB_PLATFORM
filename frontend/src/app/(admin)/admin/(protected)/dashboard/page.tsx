"use client";
import { useEffect }       from "react";
import { useRouter }       from "next/navigation";
import { useAdminAuth }    from "@/application/contexts/AdminAuthContext";
import { AdminDashboard }  from "@/presentation/components/admin-dashboard";

export default function AdminDashboardPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const router                      = useRouter();

  useEffect(() => {
    if (adminLoading) return;
    if (!adminUser || adminUser.role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [adminUser, adminLoading, router]);

  if (adminLoading || !adminUser || adminUser.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-600
            border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}