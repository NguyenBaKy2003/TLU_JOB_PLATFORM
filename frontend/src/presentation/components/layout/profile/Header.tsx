"use client";

import React, { useState, useEffect, useRef } from "react";
import Link          from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Bell, MessageSquare, ChevronDown,
  User, Settings, LogOut, Menu,
  Building2, FileText, Users, LayoutDashboard,
} from "lucide-react";
import { useAuth }      from "@/application/contexts/AuthContext";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { NotificationPanel } from "@/presentation/components/shared/NotificationPanel";
import { FaMoneyBill, FaStream } from "react-icons/fa";

interface Props {
  title?:        string;
  subtitle?:     string;
  onMenuToggle?: () => void;
}

export function Header({ title = "Trang chủ", subtitle, onMenuToggle }: Props) {
  const router           = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount }  = useWebSocket();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  const isEmployer = user?.role === "EMPLOYER";

  const CANDIDATE_ITEMS = [
    { label: "Hồ sơ của tôi", href: "/candidate/profile",   Icon: User     },
    { label: "Cài đặt",       href: "/candidate/settings",   Icon: Settings },
  ];
  const EMPLOYER_ITEMS = [
    { label: "Tổng quan",     href: "/employer/dashboard",    Icon: LayoutDashboard },
    { label: "Quản lý tin",   href: "/employer/jobs",         Icon: FileText        },
    { label: "Ứng viên",      href: "/employer/applications", Icon: Users           },
    { label: "Hồ sơ công ty", href: "/employer/profile",      Icon: Building2       },
    { label: "Thanh toán",    href: "/employer/payments",     Icon: FaMoneyBill     },
    { label: "Live Stream",   href: "/employer/streams",      Icon: FaStream        },
    { label: "Cài đặt",       href: "/employer/settings",     Icon: Settings        },
  ];
  const dropdownItems = isEmployer ? EMPLOYER_ITEMS : CANDIDATE_ITEMS;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.replace("/auth/login");
  };

  const msgHref = isEmployer ? "/employer/messages" : "/messages";

  return (
    // z-40: đủ cao hơn sidebar (không set z) và các card thông thường
    <header className="flex items-center justify-between px-4 sm:px-6 py-3  sticky top-0 z-40 shrink-0">

      {/* ── Left ──────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500
            hover:bg-gray-50 rounded-xl transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>

        {!showSearch && (
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Right ─────── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">


        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full
          text-[11px] font-semibold
          ${isEmployer ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
          {isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}
        </span>

        {/* ── Notification bell ───────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center text-gray-500
              hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                key={unreadCount}
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                  text-[9px] font-bold rounded-full flex items-center justify-center
                  animate-pulse"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* NotificationPanel: z-50 để nổi trên Header (z-40) */}
          {notifOpen && (
            <div className="relative z-50">
              <NotificationPanel onClose={() => setNotifOpen(false)} />
            </div>
          )}
        </div>

        {/* Messages */}
        <Link
          href={msgHref}
          className="relative w-9 h-9 hidden xs:flex items-center justify-center
            text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <MessageSquare size={18} />
        </Link>

        {/* ── User menu ────────────────────────── */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-1.5 px-1 py-1 rounded-xl
                hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden lg:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">{user.email}</p>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                overflow-hidden shrink-0 bg-gradient-to-br
                ${isEmployer ? "from-violet-400 to-violet-600" : "from-blue-400 to-blue-600"}`}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown: z-50 để luôn nổi trên Header sticky (z-40) và sidebar */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                border border-gray-100 shadow-lg py-1 z-50">
                {/* Mobile-only user info */}
                <div className="px-4 py-2.5 border-b border-gray-50 lg:hidden">
                  <p className="text-xs font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-[10px] text-gray-400">{user.email}</p>
                  <span className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full
                    text-[10px] font-semibold
                    ${isEmployer ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}
                  </span>
                </div>

                {dropdownItems.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[16px]
                      text-gray-700 hover:bg-gray-50"
                  >
                    <Icon size={15} className="text-gray-400" />
                    {label}
                  </Link>
                ))}

                <hr className="my-1 border-gray-100" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[16px]
                    text-red-500 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}