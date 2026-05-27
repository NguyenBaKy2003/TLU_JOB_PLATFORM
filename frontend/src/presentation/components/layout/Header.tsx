"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, LogOut, Search, X, ChevronDown,
  Bookmark, FileText, Settings,
  Building2, LayoutDashboard, Users, PlusCircle, BarChart2,
  Crown, UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth }      from "@/application/contexts/AuthContext";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { NotificationPanel } from "@/presentation/components/shared/NotificationPanel";
import { AISearchBox } from "@/presentation/components/ai/AISearchBox";
import type {
  User,
  CandidateSubscription,
  CompanySubscription,
} from "@/domain/models/User";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivePage = "trang-chu" | "tim-viec" | "cong-ty" | "tao-cv";

type PlanBadgeConfig = {
  label: string;
  className: string;
  icon?: React.ReactNode;
};

type PlanBanner = {
  daysLeft: number | null;
  quotaHint: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Trang chủ",   href: "/",         key: "trang-chu" },
  { label: "Tìm Việc",    href: "/jobs",      key: "tim-viec"  },
  { label: "Công Ty",     href: "/companies", key: "cong-ty"   },
  { label: "Tạo CV",      href: "/cv",        key: "tao-cv"    },
  { label: "Live Stream", href: "/streams",   key: "streams"   },
] as const;

const CANDIDATE_DROPDOWN = [
  { label: "Hồ sơ của tôi",  href: "/candidate/profile",      Icon: UserCircle },
  { label: "Việc đã lưu",    href: "/candidate/saved-jobs",   Icon: Bookmark   },
  { label: "Đơn ứng tuyển",  href: "/candidate/applications", Icon: FileText   },
  { label: "Cài đặt",        href: "/candidate/settings",     Icon: Settings   },
];

const EMPLOYER_DROPDOWN = [
  { label: "Dashboard",              href: "/employer/dashboard",    Icon: LayoutDashboard },
  { label: "Quản lý tin tuyển dụng", href: "/employer/jobs",         Icon: FileText        },
  { label: "Ứng viên",               href: "/employer/applications", Icon: Users           },
  { label: "Đăng tin mới",           href: "/employer/jobs/new",     Icon: PlusCircle      },
  { label: "Thống kê",               href: "/employer/analytics",    Icon: BarChart2       },
  { label: "Hồ sơ công ty",          href: "/employer/profile",      Icon: Building2       },
  { label: "Cài đặt",                href: "/employer/settings",     Icon: Settings        },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveActivePage(pathname: string): ActivePage {
  if (pathname === "/")                    return "trang-chu";
  if (pathname.startsWith("/jobs"))        return "tim-viec";
  if (pathname.startsWith("/companies"))  return "cong-ty";
  if (pathname.startsWith("/cv"))         return "tao-cv";
  return "trang-chu";
}

function getPlanBadge(planCode: string | undefined): PlanBadgeConfig | null {
  if (!planCode) return null;
  switch (planCode.toUpperCase()) {
    case "PREMIUM":
    case "PREMIUM_COMPANY":
      return {
        label: "Premium",
        className: "bg-violet-100 text-violet-800",
        icon: <Crown size={10} />,
      };
    case "PRO":
      return { label: "Pro", className: "bg-blue-100 text-blue-800" };
    case "STANDARD":
      return { label: "Standard", className: "bg-teal-100 text-teal-800" };
    default:
      return null; // FREE_CANDIDATE, FREE_COMPANY — không show badge
  }
}

function getPlanBanner(user: User): PlanBanner | null {
  const sub = user.subscription;
  if (!sub || sub.free) return null;

  const daysLeft = sub.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86400000))
    : null;

  if (user.role === "CANDIDATE") {
    const s = sub as CandidateSubscription;
    const quotaHint = !s.cvBoostQuota.unlimited
      ? `CV Boost: ${s.cvBoostQuota.used}/${s.cvBoostQuota.limit} đã dùng`
      : null;
    return { daysLeft, quotaHint };
  }

  if (user.role === "EMPLOYER") {
    const s = sub as CompanySubscription;
    const quotaHint = !s.jobPostQuota.unlimited
      ? `Tin tuyển dụng: ${s.jobPostQuota.used}/${s.jobPostQuota.limit} đã dùng`
      : null;
    return { daysLeft, quotaHint };
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  user,
  ringColor,
  avatarGradient,
  initials,
}: {
  user: User;
  ringColor: string;
  avatarGradient: string;
  initials: string;
}) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName ?? ""}
        className={`w-8 h-8 rounded-full object-cover ring-2 ${ringColor}`}
      />
    );
  }
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient}
        flex items-center justify-center text-white text-[12px] font-bold ring-2 ${ringColor}`}
    >
      {initials}
    </div>
  );
}

function DropdownUserInfo({
  user,
  badgeClass,
  roleLabel,
  isEmployer,
  onClose,
}: {
  user: User;
  badgeClass: string;
  roleLabel: string;
  isEmployer: boolean;
  onClose: () => void;
}) {
  const planBadge  = getPlanBadge(user.subscription?.planCode);
  const planBanner = getPlanBanner(user);
  const isFree     = user.subscription?.free ?? true;
  const pricingHref = isEmployer ? "/employer/pricing" : "/pricing";

  return (
    <div className="px-4 py-3 border-b border-gray-50">
      {/* Name + email + badges */}
      <p className="text-[15px] font-semibold text-gray-900 truncate">
        {user.fullName}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 mb-2 truncate">
        {user.email}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
          {roleLabel}
        </span>
        {planBadge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              flex items-center gap-1 shrink-0 ${planBadge.className}`}
          >
            {planBadge.icon}
            {planBadge.label}
          </span>
        )}
      </div>

      {/* Plan banner — paid plans only */}
      {planBanner && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-gray-50 text-xs">
          <p className="text-gray-500">
            {user.subscription?.planCode?.replace(/_/g, " ")}
            {planBanner.daysLeft !== null && ` · còn ${planBanner.daysLeft} ngày`}
          </p>
          {planBanner.quotaHint && (
            <p className="text-gray-400 mt-0.5">{planBanner.quotaHint}</p>
          )}
        </div>
      )}

      {/* Upgrade CTA — free plans only */}
      {isFree && (
        <Link
          href={pricingHref}
          onClick={onClose}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5
            rounded-xl text-[11px] font-semibold text-blue-700 bg-blue-50
            hover:bg-blue-100 transition-colors"
        >
          <Crown size={10} />
          Nâng cấp gói
        </Link>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, isConnected }      = useWebSocket();

  const activePage = resolveActivePage(pathname);
  const isEmployer = user?.role === "EMPLOYER";

  const [scrolled,     setScrolled]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  const dropdownRef        = useRef<HTMLDivElement>(null);
  const notifRef           = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Shadow on scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close panels on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/auth/login");
  };

  const initials = user?.fullName
    ? user.fullName.trim().split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "U";

  const dropdownItems  = isEmployer ? EMPLOYER_DROPDOWN : CANDIDATE_DROPDOWN;
  const roleLabel      = isEmployer ? "Nhà tuyển dụng" : "Ứng viên";
  const avatarGradient = isEmployer ? "from-violet-500 to-indigo-600" : "from-blue-500 to-cyan-500";
  const ringColor      = isEmployer ? "ring-violet-100" : "ring-blue-100";
  const badgeClass     = isEmployer ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700";

  return (
    <>
      <div className="h-[80px]" />

      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100
          transition-shadow duration-200 ${scrolled ? "shadow-md" : "shadow-sm"}`}
      >
        <div className="max-w-[1232px] mx-auto px-4 h-[80px] flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/Logo.svg" alt="JobPlatform" className="h-10 w-auto" />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex justify-evenly items-center flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-[15px] font-medium
                  transition-colors duration-150
                  ${activePage === item.key
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}
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
            <div ref={searchContainerRef} className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500
                  hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div className="fixed left-0 right-0 top-[80px] z-40 md:absolute md:left-auto md:right-0 md:top-[calc(100%+8px)] md:w-80">
                  <div
                    className="fixed inset-0 bg-black/20 z-[-1] md:hidden"
                    onClick={() => setSearchOpen(false)}
                  />
                  <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-lg md:rounded-xl md:border md:border-gray-100 md:shadow-xl md:p-0">
                    <AISearchBox
                      placeholder="Tìm kiếm việc làm..."
                      onSearch={() => setSearchOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notification bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); setDropdownOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg
                    text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      key={unreadCount}
                      className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white
                        text-[9px] font-bold rounded-full flex items-center justify-center
                        border-2 border-white animate-pulse"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white
                      ${isConnected ? "bg-green-500" : "bg-red-400 animate-pulse"}`}
                    title={isConnected ? "Kết nối realtime" : "Đang kết nối lại..."}
                  />
                </button>
                {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
              </div>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {/* Logged in */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
               {/* Thay đổi duy nhất — switch role link */}
{user.subscription?.planCode?.toUpperCase() !== "PREMIUM" &&
 user.subscription?.planCode?.toUpperCase() !== "PREMIUM_COMPANY" && (
  <Link
    href={isEmployer ? "/employer/subscription" : "/candidate/subscription"}
    className="hidden lg:flex items-center gap-1.5 text-[14px] font-medium
      text-violet-600 hover:text-violet-700 transition-colors px-3 py-1.5
      rounded-lg hover:bg-violet-50 border border-violet-200 hover:border-violet-300"
  >
    <Crown size={13} />
    Nâng cấp gói
  </Link>
)}

                {/* Avatar + dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => { setDropdownOpen((v) => !v); setNotifOpen(false); }}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                      hover:bg-gray-50 transition-colors"
                  >
                    <Avatar
                      user={user}
                      ringColor={ringColor}
                      avatarGradient={avatarGradient}
                      initials={initials}
                    />
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200
                        ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white
                        border border-gray-100 rounded-2xl shadow-xl overflow-hidden
                        animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <DropdownUserInfo
                        user={user}
                        badgeClass={badgeClass}
                        roleLabel={roleLabel}
                        isEmployer={isEmployer}
                        onClose={() => setDropdownOpen(false)}
                      />

                      <div className="p-1.5">
                        {dropdownItems.map(({ label, href, Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px]
                              text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            <Icon size={15} className="text-gray-400 shrink-0" />
                            {label}
                          </Link>
                        ))}

                        <div className="h-px bg-gray-100 my-1.5" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                            text-[14px] text-red-500 hover:bg-red-50 transition-colors"
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
              /* Not logged in */
              <div className="flex items-center sm:gap-2 gap-1">
                <Link
                  href="/auth/login"
                  className="sm:text-[16px] text-[14px] font-medium text-gray-600
                    hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="sm:text-[16px] text-[14px] font-semibold text-white px-4 py-2
                    rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all
                    shadow-sm shadow-blue-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                text-gray-500 hover:bg-gray-100 transition-colors ml-1"
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
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
                className={`block px-3 py-3 rounded-xl text-[15px] font-medium mb-1
                  ${activePage === item.key
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"}`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {dropdownItems.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px]
                      text-gray-600 hover:bg-gray-50"
                  >
                    <Icon size={15} className="text-gray-400" />
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-[15px]
                    text-red-500 hover:bg-red-50 transition-colors"
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