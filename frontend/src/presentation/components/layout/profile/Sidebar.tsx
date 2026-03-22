"use client";

import Link     from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Bell, MessageSquare, Settings,
  Activity, LogOut, HelpCircle, ChevronLeft,
  Briefcase, X,
} from "lucide-react";
import { useAuth } from "@/application/contexts/AuthContext";

// ─── Nav config ───────────────────────────────────────────────────────────────

const MAIN_NAV = [
  { label: "Hồ sơ của tôi",     icon: <User size={18} />,          href: "/profile"       },
  { label: "Thông báo",          icon: <Bell size={18} />,          href: "/notifications", badge: 6 },
  { label: "Tin nhắn",           icon: <MessageSquare size={18} />, href: "/messages",      badge: 6 },
  { label: "Cài đặt tài khoản", icon: <Settings size={18} />,      href: "/settings"      },
  { label: "Hoạt động",          icon: <Activity size={18} />,      href: "/activity"      },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  activeHref?:    string;
  collapsed:      boolean;
  onToggle:       () => void;
  mobileOpen:     boolean;
  onMobileClose:  () => void;
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item, active, collapsed, onClick,
}: {
  item: typeof MAIN_NAV[0];
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group
        ${active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {"badge" in item && item.badge !== undefined && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1
              text-[10px] font-bold bg-red-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  activeHref, collapsed, onToggle, onClose, isMobile,
}: {
  activeHref?: string;
  collapsed:   boolean;
  onToggle:    () => void;
  onClose?:    () => void;
  isMobile:    boolean;
}) {
  const router       = useRouter();
  const { logout }   = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <aside className={`relative flex flex-col h-full bg-white border-r border-gray-100
      transition-all duration-300 ${collapsed && !isMobile ? "w-16" : "w-64"}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-xl shrink-0">
          <Briefcase size={18} className="text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Joblin</p>
            <p className="text-[11px] text-gray-400">Bảng điều khiển</p>
          </div>
        )}
        {/* Close button on mobile */}
        {isMobile && (
          <button onClick={onClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-14 z-10 flex items-center justify-center
            w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm
            hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft
            size={12}
            className={`text-gray-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-4 flex-1 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Menu
          </p>
        )}
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={activeHref === item.href}
            collapsed={collapsed && !isMobile}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </nav>

      {/* Bottom: Logout + Help */}
      <div className="flex flex-col gap-0.5 px-2 pb-4 border-t border-gray-100 pt-3">
        <Link href="/help"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <HelpCircle size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Trợ giúp</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Sidebar({ activeHref, collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop sidebar — sticky, always visible on md+ */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent
          activeHref={activeHref}
          collapsed={collapsed}
          onToggle={onToggle}
          isMobile={false}
        />
      </div>

      {/* Mobile drawer + overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 h-full">
            <SidebarContent
              activeHref={activeHref}
              collapsed={false}
              onToggle={onToggle}
              onClose={onMobileClose}
              isMobile={true}
            />
          </div>
        </>
      )}
    </>
  );
}