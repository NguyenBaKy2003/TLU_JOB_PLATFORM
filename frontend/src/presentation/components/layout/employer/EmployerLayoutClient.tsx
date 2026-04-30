// presentation/components/layout/employer/EmployerLayoutClient.tsx
"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/application/contexts/AuthContext";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { Header } from "../profile/Header";
import Sidebar from "../profile/Sidebar";

export default function EmployerLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { unreadCount } = useWebSocket();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const redirected = useRef(false);

  // Studio routes - full screen, no sidebar/header
  const isStudio = pathname?.includes("/studio");

  // Reset redirect flag when user changes
  useEffect(() => {
    redirected.current = false;
  }, [user]);

  // Auth check
  useEffect(() => {
    if (loading) return;
    if (redirected.current) return;

    if (!user) {
      redirected.current = true;
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
      redirected.current = true;
      router.replace("/candidate/profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg
          className="w-8 h-8 animate-spin text-blue-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  // ============================================
  // STUDIO MODE - Full screen, no sidebar/header
  // ============================================
  if (isStudio) {
    return (
      <div className="min-h-screen bg-slate-950">
        {children}
      </div>
    );
  }

  // ============================================
  // NORMAL EMPLOYER LAYOUT
  // ============================================
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeHref={pathname || undefined}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        notificationCount={unreadCount}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={getPageTitle(pathname)}
          subtitle={getPageSubtitle(pathname)}
          notificationCount={unreadCount}
          onMenuToggle={() => setMobileOpen((v) => !v)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Helper functions ─────────────────────────────────────────
function getPageTitle(pathname: string | null): string | undefined {
  if (!pathname) return undefined;

  if (pathname.includes("/streams/create")) return "Tạo phiên stream";
  if (pathname.includes("/streams") && pathname.includes("/analytics"))
    return "Analytics";
  if (pathname.includes("/streams")) return "Live Stream";
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/jobs")) return "Quản lý việc làm";
  if (pathname.includes("/candidates")) return "Ứng viên";
  if (pathname.includes("/settings")) return "Cài đặt";

  return undefined;
}

function getPageSubtitle(pathname: string | null): string | undefined {
  if (!pathname) return undefined;

  if (pathname.includes("/streams/create"))
    return "Tạo phiên Job Fair hoặc Phỏng vấn";
  if (pathname.includes("/streams"))
    return "Quản lý phiên tuyển dụng trực tiếp";
  if (pathname.includes("/dashboard")) return "Tổng quan hoạt động";

  return undefined;
}