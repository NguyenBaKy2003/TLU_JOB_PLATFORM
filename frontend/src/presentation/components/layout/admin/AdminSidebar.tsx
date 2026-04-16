"use client";
// src/presentation/components/layout/admin/AdminSidebar.tsx

import Link          from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, Briefcase,
  Banknote, BarChart2, Settings, LogOut,
  HelpCircle, ChevronLeft, Shield, X,
  Bell, FileText, CreditCard,
} from "lucide-react";

// ─── Nav config ───────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  {
    section: "Tổng quan",
    items: [
      { label: "Dashboard",      icon: <LayoutDashboard size={18} />, href: "/admin/dashboard"     },
    ],
  },
  {
    section: "Quản lý",
    items: [
      { label: "Người dùng",     icon: <Users size={18} />,           href: "/admin/users"         },
      { label: "Công ty",        icon: <Building2 size={18} />,       href: "/admin/companies"     },
      { label: "Tin tuyển dụng", icon: <Briefcase size={18} />,       href: "/admin/jobs"          },
      { label: "Ứng tuyển",      icon: <FileText size={18} />,        href: "/admin/applications"  },
    ],
  },
  {
    section: "Subscription",
    items: [
      { label: "Gói dịch vụ",   icon: <Banknote size={18} />,        href: "/admin/subscription"  },
      { label: "Thanh toán",    icon: <CreditCard size={18} />,      href: "/admin/payments"      },
    ],
  },
  {
    section: "Hệ thống",
    items: [
      { label: "Thông báo",     icon: <Bell size={18} />,            href: "/admin/notifications" },
      { label: "Thống kê",      icon: <BarChart2 size={18} />,       href: "/admin/analytics"     },
      { label: "Cài đặt",       icon: <Settings size={18} />,        href: "/admin/settings"      },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  activeHref?:        string;
  collapsed:          boolean;
  onToggle:           () => void;
  mobileOpen:         boolean;
  onMobileClose:      () => void;
  notificationCount?: number;
  onLogout:           () => Promise<void>; // từ AdminAuthContext qua AdminLayoutClient
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ label, icon, href, active, collapsed, badge, onClick }: {
  label:     string;
  icon:      React.ReactNode;
  href:      string;
  active:    boolean;
  collapsed: boolean;
  badge?:    number;
  onClick?:  () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
        ${active
          ? "bg-red-50 text-red-600 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}>
      <span className="shrink-0 relative">
        {icon}
        {collapsed && badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1
              text-[10px] font-bold bg-red-500 text-white rounded-full">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ─── SidebarContent ───────────────────────────────────────────────────────────

function SidebarContent({
  activeHref, collapsed, onToggle, onClose, isMobile, notificationCount, onLogout,
}: {
  activeHref?:        string;
  collapsed:          boolean;
  onToggle:           () => void;
  onClose?:           () => void;
  isMobile:           boolean;
  notificationCount?: number;
  onLogout:           () => Promise<void>;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await onLogout(); // gọi adminLogout — chỉ clear adminAccessToken + adminRefreshToken
    router.replace("/admin/login");
  };

  return (
    <aside className={`relative flex flex-col h-full bg-white border-r border-gray-100
      transition-all duration-300 ${collapsed && !isMobile ? "w-16" : "w-64"}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 bg-red-600 rounded-xl shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Joblin Admin</p>
            <p className="text-[11px] text-red-500 font-medium">Quản trị viên</p>
          </div>
        )}
        {isMobile && (
          <button onClick={onClose}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      {!isMobile && (
        <button onClick={onToggle}
          className="absolute -right-3 top-14 z-10 flex items-center justify-center
            w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm
            hover:bg-gray-50 transition-colors">
          <ChevronLeft size={12}
            className={`text-gray-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
        {ADMIN_NAV.map(group => (
          <div key={group.section}>
            {(!collapsed || isMobile) && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.section}
              </p>
            )}
            {collapsed && !isMobile && (
              <div className="py-1 border-t border-gray-100 my-1" />
            )}
            {group.items.map(item => (
              <NavLink
                key={item.href}
                label={item.label}
                icon={item.icon}
                href={item.href}
                active={activeHref === item.href}
                collapsed={collapsed && !isMobile}
                badge={item.href === "/admin/notifications" ? notificationCount : undefined}
                onClick={isMobile ? onClose : undefined}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-gray-100 pt-3 flex flex-col gap-0.5">
        <Link href="/admin/help" onClick={isMobile ? onClose : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <HelpCircle size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Trợ giúp</span>}
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-red-500 hover:bg-red-50 transition-colors w-full text-left">
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdminSidebar({
  activeHref, collapsed, onToggle, mobileOpen, onMobileClose, notificationCount, onLogout,
}: Props) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent
          activeHref={activeHref}
          collapsed={collapsed}
          onToggle={onToggle}
          isMobile={false}
          notificationCount={notificationCount}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose} />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 h-full">
            <SidebarContent
              activeHref={activeHref}
              collapsed={false}
              onToggle={onToggle}
              onClose={onMobileClose}
              isMobile={true}
              notificationCount={notificationCount}
              onLogout={onLogout}
            />
          </div>
        </>
      )}
    </>
  );
}