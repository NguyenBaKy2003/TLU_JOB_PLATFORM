"use client";
// src/presentation/components/layout/admin/AdminLayoutClient.tsx

import React, { useState, useEffect } from "react";
import { useRouter }                  from "next/navigation";
import { useAdminAuth }               from "@/application/contexts/AdminAuthContext";
import { useWebSocket }               from "@/application/contexts/WebSocketContext";
import AdminSidebar                   from "./AdminSidebar";
import { AdminHeader }                from "./AdminHeader";

interface Props {
  children:        React.ReactNode;
  activeHref?:     string;
  topbarTitle?:    string;
  topbarSubtitle?: string;
}

export default function AdminLayoutClient({
  children, activeHref, topbarTitle, topbarSubtitle,
}: Props) {
  const router                                    = useRouter();
  const { adminUser, adminLoading, adminLogout }  = useAdminAuth();
  const { unreadCount }                           = useWebSocket();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Đóng mobile sidebar khi resize lên desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Admin auth guard ──

  useEffect(() => {
    if (adminLoading) return;
    if (!adminUser || adminUser.role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [adminUser, adminLoading, router]);

  // ── Loading ───────────

  if (adminLoading || !adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (adminUser.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        activeHref={activeHref}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        notificationCount={unreadCount}
        onLogout={adminLogout}  
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title={topbarTitle}
          subtitle={topbarSubtitle}
          onMenuToggle={() => setMobileOpen(v => !v)}
          adminUser={adminUser}
          onLogout={adminLogout} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}