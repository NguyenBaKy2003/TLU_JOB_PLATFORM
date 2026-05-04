"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useAuth } from "@/application/contexts/AuthContext";
import { TYPE_META, type NotificationApiType } from "@/domain/models/Notification";

interface Props {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWebSocket();
  const { user } = useAuth();
  const router   = useRouter();

  const isEmployer   = user?.role === "EMPLOYER";
  const allNotifHref = isEmployer ? "/employer/notifications" : "/candidate/notifications";

  const handleItemClick = async (
    notificationId: string,
    read: boolean,
    link: string | null,
  ) => {
    // Optimistic update fires immediately inside markAsRead — no await needed before navigation
    if (!read) {
      markAsRead(notificationId); // intentionally not awaited
    }
    if (link) {
      onClose();
      router.push(link);
    }
  };

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m    = Math.floor(diff / 60_000);
    if (m < 1)  return "Vừa xong";
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl
        border border-gray-100 shadow-xl z-50 overflow-hidden"
    >
      {/* ── Header ─────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Thông báo</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-blue-600
              hover:bg-blue-50 rounded-lg transition-colors font-medium"
            title="Đánh dấu tất cả đã đọc"
          >
            <CheckCheck size={12} />
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* ── List ────────── */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <Bell size={28} strokeWidth={1.5} />
            <p className="text-xs">Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta        = TYPE_META[n.type as NotificationApiType];
            const displayText = n.title || n.body || "";
            const truncated   =
              displayText.length > 80 ? displayText.slice(0, 80) + "…" : displayText;
            const isClickable = !n.read || !!n.link;

            return (
              <div
                key={n.notificationId}
                onClick={() => handleItemClick(n.notificationId, n.read, n.link)}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " "))
                    handleItemClick(n.notificationId, n.read, n.link);
                }}
                className={`
                  flex items-start gap-3 px-4 py-3 transition-colors
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                  ${n.read ? "hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50"}
                `}
              >
                {/* Unread dot */}
                <div className="shrink-0 mt-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors
                      ${n.read ? "bg-transparent" : "bg-blue-500"}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-relaxed mb-1
                      ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}
                  >
                    {truncated}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {meta && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border
                          ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ──────── */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <Link
          href={allNotifHref}
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