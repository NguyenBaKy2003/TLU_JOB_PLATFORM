"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, MessageSquare, ChevronDown, User, Settings, LogOut } from "lucide-react";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCount?: number;
  messageCount?: number;
}

export function Topbar({
  title = "Hồ Sơ Của Tôi",
  subtitle = "Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất.",
  user,
  notificationCount = 0,
  messageCount = 0,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Messages */}
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <MessageSquare size={18} />
          {messageCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {messageCount}
            </span>
          )}
        </button>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={15} className="text-gray-400" />
                  Hồ sơ của tôi
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={15} className="text-gray-400" />
                  Cài đặt
                </Link>
                <hr className="my-1 border-gray-100" />
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
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