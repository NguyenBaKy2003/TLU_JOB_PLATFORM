"use client";

import React, { useState, useEffect } from "react";
import { useRouter }                  from "next/navigation";
import { useAuth }                    from "@/application/contexts/AuthContext";
import { Header }                     from "./Header";
import Sidebar from "./Sidebar";

interface Props {
  children:        React.ReactNode;
  activeHref?:     string;
  topbarTitle?:    string;
  topbarSubtitle?: string;
}

export function DashboardLayout({ children, activeHref, topbarTitle, topbarSubtitle }: Props) {
  const router                      = useRouter();
  const { user, loading }           = useAuth();
  const [collapsed,   setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auth guard
  useEffect(() => {
    if (!loading && user === null) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      <Sidebar
        activeHref={activeHref}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right: header + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={topbarTitle}
          subtitle={topbarSubtitle}
          notificationCount={6}
          messageCount={6}
          onMenuToggle={() => setMobileOpen(v => !v)}
        />
        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

    </div>
  );
}