"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  LogOut,
  Search,
  X,
  ChevronDown,
  User,
  Bookmark,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/application/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  activePage?: "trang-chu" | "tim-viec" | "cong-ty" | "tao-cv";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/", key: "trang-chu" },
  { label: "Tìm Việc", href: "/jobs", key: "tim-viec" },
  { label: "Công Ty", href: "/companies", key: "cong-ty" },
  { label: "Tạo CV", href: "/cv", key: "tao-cv" },
];

const DROPDOWN_ITEMS = [
  { label: "Hồ sơ của tôi", href: "/profile", Icon: User },
  { label: "Việc đã lưu", href: "/saved-jobs", Icon: Bookmark },
  { label: "Đơn ứng tuyển", href: "/applications", Icon: FileText },
  { label: "Cài đặt", href: "/settings", Icon: Settings },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Header({ activePage = "trang-chu" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  // ── Shadow on scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Focus search input when opened ────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInput.current?.focus(), 50);
  }, [searchOpen]);

  // ── Close mobile menu on route change ─────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Logout handler ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/auth/login");
  };

  // ── Avatar initials fallback ───────────────────────────────────────────────
  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(" ")
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <div className="h-[68px]" />

      <header
        className={`
          fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100
          transition-shadow duration-200
          ${scrolled ? "shadow-md" : "shadow-sm"}
        `}
      >
        <div className="max-w-[1232px] mx-auto px-4 py-5  h-[80px] flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/Logo.svg" alt="JobPlatform" className="h-10 w-auto" />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex justify-evenly items-start flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-lg text-[15px] font-medium
                  transition-colors duration-150
                  ${
                    activePage === item.key
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
                {activePage === item.key && (
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Search
                    size={16}
                    className="text-gray-400 flex-shrink-0 ml-1"
                  />
                  <input
                    ref={searchInput}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Escape" && setSearchOpen(false)
                    }
                    placeholder="Tìm kiếm việc làm..."
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none py-1.5"
                  />
                </div>
              )}
            </div>

            {/* Bell — chỉ hiện khi đã đăng nhập */}
            {isAuthenticated && (
              <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {/* ── Logged in ───────────────────────────────────────────────── */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Nhà tuyển dụng link — chỉ cho CANDIDATE */}
                {user.role === "CANDIDATE" && (
                  <Link
                    href="/employer"
                    className="hidden lg:block text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                  >
                    Nhà tuyển dụng
                  </Link>
                )}

                {/* Avatar + dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user?.avatarUrl}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[12px] font-bold ring-2 ring-blue-100">
                        {initials}
                      </div>
                    )}
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user.role === "CANDIDATE"
                            ? "Ứng viên"
                            : "Nhà tuyển dụng"}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        {DROPDOWN_ITEMS.map(({ label, href, Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            <Icon size={15} className="text-gray-400" />
                            {label}
                          </Link>
                        ))}

                        <div className="h-px bg-gray-100 my-1.5" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Not logged in ───────────────────────────────────────────── */
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 flex items-center gap-1.5"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-1"
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 pb-4 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  block px-3 py-3 rounded-xl text-[15px] font-medium mb-1
                  ${
                    activePage === item.key
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile — not logged in */}
            {!isAuthenticated && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 text-center py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile — logged in: show logout */}
            {isAuthenticated && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
