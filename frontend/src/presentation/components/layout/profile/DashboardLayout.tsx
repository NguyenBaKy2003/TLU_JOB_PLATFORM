"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter }    from "next/navigation";
import { useAuth }      from "@/application/contexts/AuthContext";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { Header }       from "./Header";
import Sidebar          from "./Sidebar";

interface Props {
  children:        React.ReactNode;
  activeHref?:     string;
  topbarTitle?:    string;
  topbarSubtitle?: string;
  requiredRole?:   "CANDIDATE" | "EMPLOYER" | "ADMIN";
}

export function DashboardLayout({
  children, activeHref, topbarTitle, topbarSubtitle, requiredRole,
}: Props) {
  const router            = useRouter();
  const { user, loading } = useAuth();
  // unreadCount chỉ cần cho Sidebar — Header tự lấy từ useWebSocket()
  const { unreadCount }   = useWebSocket();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const redirected = useRef(false);

  useEffect(() => {
    redirected.current = false;
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (redirected.current) return;

    if (!user) {
      redirected.current = true;
      router.replace("/auth/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      redirected.current = true;
      const fallback =
        user.role === "EMPLOYER" ? "/employer/dashboard"
        : user.role === "ADMIN"  ? "/admin/dashboard"
        : "/candidate/profile";
      router.replace(fallback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, requiredRole]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        activeHref={activeHref}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        notificationCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header tự lấy unreadCount từ useWebSocket() — không cần truyền prop */}
        <Header
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