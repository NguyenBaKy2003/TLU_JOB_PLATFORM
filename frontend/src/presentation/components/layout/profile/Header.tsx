"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Bell, MessageSquare, ChevronDown,
  User, Settings, LogOut, Menu,
  Building2, FileText, Users, LayoutDashboard,
  Check, CheckCheck, ExternalLink,
} from "lucide-react";
import { useAuth }      from "@/application/contexts/AuthContext";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import api              from "@/lib/axios";

interface Props {
  title?:        string;
  subtitle?:     string;
  notificationCount?: number; // override nếu cần, mặc định dùng WS context
  onMenuToggle?: () => void;
}

// ─── Notification mini-panel ──────────────────────────────────────────────────

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount } = useWebSocket();
  const router = useRouter();

  const markAllRead = async () => {
    try { await api.patch("/notifications/read-all") } catch { /* silent */ }
  };

  const TYPE_COLOR: Record<string, string> = {
    MESSAGE:      "bg-pink-100 text-pink-600",
    NEW_JOB:      "bg-blue-100 text-blue-600",
    APPLY_RESULT: "bg-green-100 text-green-600",
    SYSTEM:       "bg-gray-100 text-gray-500",
  };

  const TYPE_LABEL: Record<string, string> = {
    MESSAGE:      "Tin nhắn",
    NEW_JOB:      "Việc làm",
    APPLY_RESULT: "Ứng tuyển",
    SYSTEM:       "Hệ thống",
  };

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1)  return "Vừa xong";
    if (m < 60) return `${m} phút`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ`;
    return `${Math.floor(h / 24)} ngày`;
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl
      border border-gray-100 shadow-xl z-50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Thông báo</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500
              text-white rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-blue-600
                hover:bg-blue-50 rounded-lg transition-colors font-medium"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck size={12} />
              Đánh dấu đã đọc
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <Bell size={28} strokeWidth={1.5} />
            <p className="text-xs">Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.notificationId}
              className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                ${n.isRead ? "hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50"}`}
            >
              {/* Unread dot */}
              <div className="shrink-0 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full
                  ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed mb-1
                  ${n.isRead ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                  {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                    ${TYPE_COLOR[n.type] ?? TYPE_COLOR.SYSTEM}`}>
                    {TYPE_LABEL[n.type] ?? "Hệ thống"}
                  </span>
                  <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-xs font-medium
            text-blue-600 hover:text-blue-700 transition-colors"
        >
          Xem tất cả thông báo
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({ title = "Trang chủ", subtitle, onMenuToggle }: Props) {
  const router           = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount }  = useWebSocket();

  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [search,        setSearch]        = useState("");
  const [showSearch,    setShowSearch]    = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  const isEmployer = user?.role === "EMPLOYER";

  const CANDIDATE_ITEMS = [
    { label: "Hồ sơ của tôi", href: "/profile",   Icon: User     },
    { label: "Cài đặt",       href: "/settings",   Icon: Settings },
  ];
  const EMPLOYER_ITEMS = [
    { label: "Tổng quan",      href: "/employer/dashboard",  Icon: LayoutDashboard },
    { label: "Quản lý tin",    href: "/employer/jobs",       Icon: FileText        },
    { label: "Ứng viên",       href: "/employer/candidates", Icon: Users           },
    { label: "Hồ sơ công ty",  href: "/employer/company",   Icon: Building2       },
    { label: "Cài đặt",        href: "/employer/settings",   Icon: Settings        },
  ];
  const dropdownItems = isEmployer ? EMPLOYER_ITEMS : CANDIDATE_ITEMS;

  // Close dropdowns on outside click
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

  useEffect(() => { if (showSearch) searchRef.current?.focus(); }, [showSearch]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.replace("/auth/login");
  };

  const notifHref = isEmployer ? "/employer/notifications" : "/notifications";
  const msgHref   = isEmployer ? "/employer/messages"      : "/messages";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white
      border-b border-gray-100 sticky top-0 z-10 shrink-0">

      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuToggle}
          className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500
            hover:bg-gray-50 rounded-xl transition-colors shrink-0">
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

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">

        {/* Search — desktop */}
        <div className="hidden sm:block relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
              w-44 lg:w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-400 transition-all"
          />
        </div>

        {/* Search — mobile */}
        {!showSearch ? (
          <button onClick={() => setShowSearch(true)}
            className="sm:hidden w-9 h-9 flex items-center justify-center text-gray-500
              hover:bg-gray-50 rounded-xl transition-colors">
            <Search size={18} />
          </button>
        ) : (
          <div className="sm:hidden fixed inset-x-0 top-0 z-30 flex items-center gap-2
            px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              ref={searchRef} type="text" placeholder="Tìm kiếm..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            />
            <button onClick={() => setShowSearch(false)}
              className="text-sm font-medium text-blue-600 shrink-0">Huỷ</button>
          </div>
        )}

        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full
          text-[11px] font-semibold
          ${isEmployer ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
          {isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}
        </span>

        {/* ── Notification bell + dropdown ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center text-gray-500
              hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                text-[9px] font-bold rounded-full flex items-center justify-center
                animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel onClose={() => setNotifOpen(false)} />
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

        {/* ── User menu ── */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-1.5 px-1 py-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden lg:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                overflow-hidden shrink-0 bg-gradient-to-br
                ${isEmployer ? "from-violet-400 to-violet-600" : "from-blue-400 to-blue-600"}`}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                border border-gray-100 shadow-lg py-1 z-10">
                <div className="px-4 py-2.5 border-b border-gray-50 lg:hidden">
                  <p className="text-xs font-semibold text-gray-800">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400">{user?.email}</p>
                  <span className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full
                    text-[10px] font-semibold
                    ${isEmployer ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}
                  </span>
                </div>

                {dropdownItems.map(({ label, href, Icon }) => (
                  <Link
                    key={href} href={href} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Icon size={15} className="text-gray-400" />{label}
                  </Link>
                ))}
                <hr className="my-1 border-gray-100" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                    text-red-500 hover:bg-red-50">
                  <LogOut size={15} />Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}