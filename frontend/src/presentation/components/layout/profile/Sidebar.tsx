"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User,
  Bell,
  MessageSquare,
  Settings,
  Activity,
  LogOut,
  HelpCircle,
  ChevronLeft,
  Briefcase,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  active?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: "Hồ sơ của tôi", icon: <User size={18} />, href: "/profile", active: true },
  { label: "Thông báo", icon: <Bell size={18} />, href: "/notifications", badge: 6 },
  { label: "Tin nhắn", icon: <MessageSquare size={18} />, href: "/messages", badge: 6 },
  { label: "Cài đặt tài khoản", icon: <Settings size={18} />, href: "/settings" },
  { label: "Hoạt động", icon: <Activity size={18} />, href: "/activity" },
];

const bottomNavItems: NavItem[] = [
  { label: "Đăng xuất", icon: <LogOut size={18} />, href: "/logout" },
  { label: "Trợ giúp", icon: <HelpCircle size={18} />, href: "/help" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg shrink-0">
          <Briefcase size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900">Job</p>
            <p className="text-xs text-gray-400">Bảng điều kiển</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-14 z-10 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft
          size={12}
          className={`text-gray-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-4 flex-1">
        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Main
          </p>
        )}
        {mainNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
              item.active
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && item.badge !== undefined && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-0.5 px-2 pb-4 border-t border-gray-100 pt-3">
        {bottomNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              item.label === "Đăng xuất"
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}