"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  topbarTitle?: string;
  topbarSubtitle?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({
  children,
  activeHref,
  topbarTitle,
  topbarSubtitle,
  user,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeHref={activeHref}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={topbarTitle}
          subtitle={topbarSubtitle}
          user={user}
          notificationCount={6}
          messageCount={6}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}