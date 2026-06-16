"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User, Bell, MessageSquare, Settings,
  Activity, LogOut, HelpCircle, ChevronLeft,
  Briefcase, X, LayoutDashboard, FileText,
  Building2, Users, BarChart2, PlusCircle,
  Banknote, ClipboardList, BookmarkCheck,
  MessageCircleMore,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/application/contexts/AuthContext";
import { FaStream } from "react-icons/fa";

// ─── Nav config ───────────

const CANDIDATE_NAV = [
  { label: "Hồ sơ của tôi",     icon: <User size={18} />,             href: "/candidate/profile",           badgeKey: null           },
  { label: "Đơn ứng tuyển",     icon: <ClipboardList size={18} />,    href: "/candidate/applications",      badgeKey: null           },
  { label: "Việc đã lưu",       icon: <BookmarkCheck size={18} />,    href: "/candidate/saved-jobs",         badgeKey: null           },
  { label: "Thông báo",          icon: <Bell size={18} />,             href: "/candidate/notifications",     badgeKey: "notification" },
  { label: "Tin nhắn",           icon: <MessageSquare size={18} />,    href: "/candidate/messages",          badgeKey: null           },
  { label: "Gói đăng ký",       icon: <Banknote size={18} />,        href: "/candidate/subscription",      badgeKey: null           },
  { label: "Lịch sử thanh toán", icon: <Receipt size={18} />,         href: "/candidate/payments",          badgeKey: null           }, 
  { label: "Bình luận",          icon: <MessageCircleMore size={18} />, href: "/candidate/reviews",          badgeKey: null           },
  { label: "Hoạt động",          icon: <Activity size={18} />,         href: "/candidate/activity",          badgeKey: null           },
  { label: "Cài đặt tài khoản", icon: <Settings size={18} />,         href: "/candidate/settings",          badgeKey: null           },
];

const EMPLOYER_NAV = [
  { label: "Tổng quan",         icon: <LayoutDashboard size={18} />, href: "/employer/dashboard",     badgeKey: null           },
  { label: "Quản lý tin tuyển", icon: <FileText size={18} />,        href: "/employer/jobs",          badgeKey: null           },
  { label: "Ứng viên",          icon: <Users size={18} />,           href: "/employer/applications",    badgeKey: null           },
  { label: "Thông báo",         icon: <Bell size={18} />,            href: "/employer/notifications", badgeKey: "notification" },
  { label: "Tin nhắn",          icon: <MessageSquare size={18} />,   href: "/employer/messages",      badgeKey: null           },
  // { label: "Thống kê",          icon: <BarChart2 size={18} />,       href: "/employer/analytics",     badgeKey: null           },
  { label: "Hồ sơ",           icon: <Building2 size={18} />,       href: "/employer/profile",       badgeKey: null           },
  { label: "Gói đăng ký",       icon: <Banknote size={18} />,        href: "/employer/subscription",  badgeKey: null           },
  { label: "Lịch sử thanh toán", icon: <Receipt size={18} />,         href: "/employer/payments",          badgeKey: null           },  
  { label: "Live Stream",        icon: <FaStream></FaStream>  ,    href: "/employer/streams",    },
  { label: "Bình luận",          icon: <MessageCircleMore size={18} />,         href: "/employer/reviews",          badgeKey: null           },
  { label: "Hoạt động",          icon: <Activity size={18} />,         href: "/employer/activity",          badgeKey: null           },
  { label: "Cài đặt",           icon: <Settings size={18} />,        href: "/employer/settings",      badgeKey: null           },

];

// ─── Props ─

interface Props {
  collapsed:          boolean;
  onToggle:           () => void;
  mobileOpen:         boolean;
  onMobileClose:      () => void;
  notificationCount:  number;
  activeHref?:        string;  
}

// ─── NavLink ──────────────

type NavItem = {
  label:    string;
  icon:     React.ReactNode;
  href:     string;
  badgeKey: "notification" | null;
};

function NavLink({
  item, active, collapsed, onClick, badge,
}: {
  item:      NavItem;
  active:    boolean;
  collapsed: boolean;
  onClick?:  () => void;
  badge?:    number;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[16px] transition-all group text-slate-600
        ${active
          ? "bg-[#DFEAFE]  font-medium font-bold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <span className="shrink-0 relative">
        {item.icon}
        {collapsed && badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
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

// ─── Sidebar content ──────

function SidebarContent({
  collapsed, onToggle, onClose, isMobile, notificationCount, activeHref,
}: {
  collapsed:          boolean;
  onToggle:           () => void;
  onClose?:           () => void;
  isMobile:           boolean;
  notificationCount:  number;
  activeHref?:        string;
}) {
  const router           = useRouter();
  const pathname         = usePathname();
  const { user, logout } = useAuth();

  const isEmployer = user?.role === "EMPLOYER";
  const navItems   = isEmployer ? EMPLOYER_NAV : CANDIDATE_NAV;

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const homeHref   = isEmployer ? "/employer/dashboard" : "/";
  const brandLabel = isEmployer ? "Nhà tuyển dụng" : "Ứng viên";

  const getBadge = (key: NavItem["badgeKey"]): number | undefined => {
    if (key === "notification") return notificationCount || undefined;
    return undefined;
  };

  // Ưu tiên activeHref prop, fallback về pathname từ URL
  const isActive = (href: string) => {
    const current = activeHref ?? pathname;
    return current === href || (href !== "/" && current.startsWith(href + "/"));
  };

  return (
    <aside className={`relative flex flex-col h-full bg-white border-r border-gray-100
      transition-all duration-300 ${collapsed && !isMobile ? "w-16" : "w-64"}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        {/* Thay thế icon Briefcase bằng thẻ img */}
        <div className="flex items-center justify-center w-15 h-15 shrink-0">
          <img 
            src="/Logo.svg" 
            alt="Logo" 
            className="w-full h-full object-contain" 
          />
        </div>

        {(!collapsed || isMobile) && (
          <div className="leading-tight min-w-0">
            <p className="text-[16px] font-bold text-gray-900 truncate">
              <Link href={homeHref}>CareerUp</Link>
            </p>
            <p className="text-[11px] text-gray-400">{brandLabel}</p>
          </div>
        )}
        
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

      {/* Employer: post job CTA */}
      {isEmployer && (!collapsed || isMobile) && (
        <div className="px-3 pt-4">
          <Link
            href="/employer/jobs/new"
            onClick={isMobile ? onClose : undefined}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl
              text-[16px] font-semibold text-white bg-[#1253ED] hover:bg-[#0d3fc2] transition-colors"
          >
            <PlusCircle size={16} />
            Đăng tin tuyển dụng
          </Link>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-4 flex-1 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Main
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed && !isMobile}
            onClick={isMobile ? onClose : undefined}
            badge={getBadge(item.badgeKey)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 px-2 pb-12 border-t border-gray-100 pt-3">
        <Link
          href={isEmployer ? "/employer/help" : "/help"}
          onClick={isMobile ? onClose : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[16px]
            text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <HelpCircle size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Trợ giúp</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[16px]
            text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Main export ──────────

export default function Sidebar({
  collapsed, onToggle, mobileOpen, onMobileClose, notificationCount, activeHref,
}: Props) {
  return (
    <>
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          isMobile={false}
          notificationCount={notificationCount}
          activeHref={activeHref}
        />
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 h-full">
            <SidebarContent
              collapsed={false}
              onToggle={onToggle}
              onClose={onMobileClose}
              isMobile={true}
              notificationCount={notificationCount}
              activeHref={activeHref}
            />
          </div>
        </>
      )}
    </>
  );
}