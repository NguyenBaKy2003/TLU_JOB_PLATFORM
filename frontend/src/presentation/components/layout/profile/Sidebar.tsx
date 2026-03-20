"use client";

import React        from "react";
import Link         from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Bell, MessageSquare, Settings,
  Activity, LogOut, HelpCircle, Briefcase, ChevronLeft, X,
} from "lucide-react";
import { useAuth } from "@/application/contexts/AuthContext";

interface SidebarItem {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  activeHref?: string;
  collapsed?:  boolean;
  onToggle?:   () => void;
  /** Mobile drawer open state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const mainNavItems: SidebarItem[] = [
  { label: "Hồ sơ của tôi",    href: "/profile",       icon: <User         size={18} /> },
  { label: "Thông báo",         href: "/notifications", icon: <Bell         size={18} />, badge: 6 },
  { label: "Tin nhắn",          href: "/messages",      icon: <MessageSquare size={18} />, badge: 6 },
  { label: "Cài đặt tài khoản", href: "/settings",      icon: <Settings     size={18} /> },
  { label: "Hoạt động",         href: "/activity",      icon: <Activity     size={18} /> },
];

const bottomNavItems: SidebarItem[] = [
  { label: "Trợ giúp", href: "/help", icon: <HelpCircle size={18} /> },
];

export function Sidebar({
  activeHref = "/profile",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const router     = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const handleLinkClick = () => {
    // Close mobile drawer on nav
    onMobileClose?.();
  };

  const sidebarContent = (isDrawer = false) => (
    <aside className={`
      relative flex flex-col bg-white border-r border-gray-100
      h-full transition-all duration-300
      ${!isDrawer ? (collapsed ? "w-16" : "w-56") : "w-64"}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-white" />
        </div>
        {(!collapsed || isDrawer) && (
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">JobPlatform</p>
            <p className="text-[10px] text-gray-400">Bảng điều khiển</p>
          </div>
        )}
        {/* Close button for mobile drawer */}
        {isDrawer && (
          <button
            onClick={onMobileClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      {!isDrawer && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          <ChevronLeft
            size={12}
            className={`text-gray-500 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 py-4">
        {(!collapsed || isDrawer) && (
          <p className="px-2 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {mainNavItems.map(item => {
            const isActive = activeHref === item.href;
            const showLabel = !collapsed || isDrawer;
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group
                    ${isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {item.icon}
                  </span>
                  {showLabel && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!showLabel && item.badge !== undefined && (
                    <span className="absolute left-7 top-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        {bottomNavItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <span className="flex-shrink-0 text-gray-400">{item.icon}</span>
            {(!collapsed || isDrawer) && <span className="truncate">{item.label}</span>}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || isDrawer) && <span className="truncate">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <div className="hidden md:flex h-screen sticky top-0">
        {sidebarContent(false)}
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer panel */}
          <div className="relative h-full">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}