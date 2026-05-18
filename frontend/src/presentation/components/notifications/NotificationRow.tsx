"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Mail } from "lucide-react"
import { NotificationBadge } from "./NotificationBadge"
import type { NotificationItem } from "@/domain/models/Notification"

interface Props {
  notif:        NotificationItem
  selected:     boolean
  onToggle:     (id: string) => void
  onMarkRead:   (id: string) => void
  onToggleStar: (id: string) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return "Vừa xong"
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days} ngày trước`
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

export function NotificationRow({ notif, selected, onToggle, onMarkRead, onToggleStar }: Props) {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (!notif.isRead) onMarkRead(notif.notificationId)
    if (notif.link)   router.push(notif.link)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex items-start gap-3 px-5 py-4 border-b border-gray-50
        transition-colors cursor-pointer
        ${selected      ? "bg-blue-50"
          : notif.isRead ? "bg-white hover:bg-gray-50/70"
          :                "bg-blue-50/40 hover:bg-blue-50/70"}`}
    >
      {/* Checkbox */}
      <div className="shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(notif.notificationId)}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-blue-600
            focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
        />
      </div>

      {/* Unread dot */}
      <div className="shrink-0 mt-2">
        <div className={`w-2 h-2 rounded-full ${notif.read ? "bg-transparent" : "bg-blue-500"}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={handleClick}>
        <p className={`text-[16px] leading-snug mb-0.5
          ${notif.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
          {notif.title}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-1.5 line-clamp-2">
          {notif.body}
        </p>
        <NotificationBadge type={notif.type} />
      </div>

      {/* Time + actions */}
      <div className="shrink-0 flex flex-col items-end gap-1.5 ml-2">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">
          {timeAgo(notif.createdAt)}
        </span>

        <div className={`flex items-center gap-1 transition-opacity
          ${hovered || notif.isStarred ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(notif.notificationId) }}
            className={`p-1 rounded transition-colors
              ${notif.isStarred ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
            title="Đánh dấu quan trọng"
          >
            <Star size={14} fill={notif.isStarred ? "currentColor" : "none"} />
          </button>

          {!notif.isRead && (
            <button
              onClick={e => { e.stopPropagation(); onMarkRead(notif.notificationId) }}
              className="p-1 text-gray-300 hover:text-blue-500 rounded transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Mail size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}