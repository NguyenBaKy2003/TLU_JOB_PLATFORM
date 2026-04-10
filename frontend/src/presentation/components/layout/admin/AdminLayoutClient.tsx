// src/presentation/components/layout/admin/AdminLayoutClient.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter }                  from "next/navigation";
import { useAuth }                    from "@/application/contexts/AuthContext";
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
  const router            = useRouter();
  const { user, loading } = useAuth();
  const { unreadCount }   = useWebSocket();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Auth + role guard ─────────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") {
      const fallback = user.role === "EMPLOYER" ? "/employer/dashboard" : "/profile";
      router.replace(fallback);
    }
  }, [user, loading, router]);

  // ── Loading spinner ───────────────────────────────────────────────────────

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // Đang redirect — không render để tránh flash
  if (user.role !== "ADMIN") return null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        activeHref={activeHref}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        notificationCount={unreadCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title={topbarTitle}
          subtitle={topbarSubtitle}
          onMenuToggle={() => setMobileOpen(v => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}