"use client";

import React, { useState, useEffect } from "react"; // ← gom import
import { useRouter }                  from "next/navigation";
import { Sidebar }                    from "./Sidebar";
import { Topbar }                     from "./Topbar";
import { useAuth }                    from "@/application/contexts/AuthContext";

interface DashboardLayoutProps {
  children:        React.ReactNode;
  activeHref?:     string;
  topbarTitle?:    string;
  topbarSubtitle?: string;
}

export function DashboardLayout({
  children,
  activeHref,
  topbarTitle,
  topbarSubtitle,
}: DashboardLayoutProps) {
  const router                    = useRouter();
  const { user, loading }         = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-500"
             viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeHref={activeHref}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={topbarTitle}
          subtitle={topbarSubtitle}
          notificationCount={6}
          messageCount={6}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}