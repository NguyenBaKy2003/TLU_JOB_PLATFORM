"use client";

import React, { useState, useRef, useEffect } from "react";
import Link                                    from "next/link";
import { useRouter }                           from "next/navigation";
import {
  Search, Bell, MessageSquare,
  ChevronDown, User, Settings, LogOut, Menu,
} from "lucide-react";
import { useAuth } from "@/application/contexts/AuthContext";

interface Props {
  title?:             string;
  subtitle?:          string;
  notificationCount?: number;
  messageCount?:      number;
  onMenuToggle?:      () => void;
}

export function Header({
  title = "Trang chủ", subtitle,
  notificationCount = 0, messageCount = 0, onMenuToggle,
}: Props) {
  const router            = useRouter();
  const { user, logout }  = useAuth();
  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState("");
  const [showSearch,  setShowSearch]  = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (showSearch) searchRef.current?.focus(); }, [showSearch]);

  const handleLogout = async () => { setOpen(false); await logout(); router.replace("/auth/login"); };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white
      border-b border-gray-100 sticky top-0 z-20 shrink-0">

      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button onClick={onMenuToggle}
          className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500
            hover:bg-gray-50 rounded-xl transition-colors shrink-0">
          <Menu size={20} />
        </button>

        {!showSearch && (
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">

        {/* Search */}
        <div className="relative">
          <div className="hidden sm:block relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
                w-44 lg:w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                focus:border-blue-400 transition-all" />
          </div>
          {/* Mobile search icon */}
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
              <input ref={searchRef} type="text" placeholder="Tìm kiếm..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800
                  placeholder-gray-400" />
              <button onClick={() => setShowSearch(false)}
                className="text-sm font-medium text-blue-600 shrink-0">Huỷ</button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-500
          hover:bg-gray-50 rounded-xl transition-colors">
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
              text-[9px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* Messages — hidden on xs */}
        <button className="relative w-9 h-9 hidden xs:flex items-center justify-center
          text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <MessageSquare size={18} />
          {messageCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
              text-[9px] font-bold rounded-full flex items-center justify-center">
              {messageCount > 9 ? "9+" : messageCount}
            </span>
          )}
        </button>

        {/* Avatar / User menu */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1.5 px-1 py-1 rounded-xl hover:bg-gray-50 transition-colors">
              {/* Name — lg+ only */}
              <div className="text-right hidden lg:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
              </div>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                flex items-center justify-center overflow-hidden shrink-0">
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

            {open && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl
                border border-gray-100 shadow-lg py-1 z-50">
                {/* Mobile: show name inside dropdown */}
                <div className="px-4 py-2.5 border-b border-gray-50 lg:hidden">
                  <p className="text-xs font-semibold text-gray-800">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400">{user?.email}</p>
                </div>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={15} className="text-gray-400" />Hồ sơ của tôi
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings size={15} className="text-gray-400" />Cài đặt
                </Link>
                <hr className="my-1 border-gray-100" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
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