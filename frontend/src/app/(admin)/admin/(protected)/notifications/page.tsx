"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, RefreshCw, CheckCheck, Inbox } from "lucide-react"
import { useWebSocket }    from "@/application/contexts/WebSocketContext"
import { useAdminAuth }    from "@/application/contexts/AdminAuthContext"
import { getAdminAccessToken } from "@/lib/auth-helpers"
import { extractErrorMessage } from "@/lib/extractErrorMessage"
import type { NotificationItem } from "@/domain/models/Notification"

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = "ALL" | "NEW_USER" | "NEW_JOB" | "REPORT" | "SYSTEM" | "VERIFICATION" | "PAYMENT"

const TABS: { key: AdminTab; label: string }[] = [
  { key: "ALL",          label: "Tất cả"       },
  { key: "NEW_USER",     label: "Người dùng mới" },
  { key: "NEW_JOB",      label: "Việc làm mới"  },
  { key: "REPORT",       label: "Báo cáo"       },
  { key: "SYSTEM",       label: "Hệ thống"      },
  { key: "VERIFICATION", label: "Xác minh"      },
  { key: "PAYMENT",      label: "Thanh toán"    },
]

function typeToTab(type: string): AdminTab {
  const map: Record<string, AdminTab> = {
    NEW_USER:     "NEW_USER",
    NEW_JOB:      "NEW_JOB",
    REPORT:       "REPORT",
    SYSTEM:       "SYSTEM",
    VERIFICATION: "VERIFICATION",
    PAYMENT:      "PAYMENT",
  }
  return map[type] ?? "SYSTEM"
}

// ─── API helper — dùng adminAccessToken trực tiếp ─────────────────────────────

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

async function fetchAdminNotifications(page = 0, size = 50): Promise<NotificationItem[]> {
  const json = await adminFetch<any>(`/notifications/recent?page=${page}&size=${size}`)
  const raw: any[] = json?.data ?? []
  return raw.map((r) => ({
    notificationId: r.id ?? r.notificationId ?? "",
    type:      r.type ?? "",
    title:     r.title ?? "",
    body:      r.body ?? r.message ?? "",
    link:      r.link ?? null,
    read:      r.read === true,
    readAt:    r.readAt ?? null,
    createdAt: r.createdAt ?? "",
  }))
}

async function patchAdminRead(id: string)    { await adminFetch(`/notifications/${id}/read`,  { method: "PATCH" }) }
async function patchAdminReadAll()           { await adminFetch(`/notifications/read-all`,    { method: "PATCH" }) }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotifSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-50 animate-pulse">
      <div className="w-4 h-4 rounded bg-gray-100 mt-0.5 shrink-0" />
      <div className="w-2 h-2 rounded-full bg-gray-100 mt-2 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-14 shrink-0" />
    </div>
  )
}

// ─── NotificationRow inline (không phụ thuộc component candidate) ─────────────

const TYPE_META: Record<string, { emoji: string; color: string }> = {
  NEW_USER:     { emoji: "👤", color: "bg-green-50 text-green-700 border-green-200"  },
  NEW_JOB:      { emoji: "💼", color: "bg-blue-50 text-blue-700 border-blue-200"    },
  REPORT:       { emoji: "🚨", color: "bg-red-50 text-red-700 border-red-200"       },
  SYSTEM:       { emoji: "⚙️", color: "bg-purple-50 text-purple-700 border-purple-200" },
  VERIFICATION: { emoji: "✅", color: "bg-sky-50 text-sky-700 border-sky-200"       },
  PAYMENT:      { emoji: "💳", color: "bg-amber-50 text-amber-700 border-amber-200" },
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return "Vừa xong"
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d} ngày trước`
  return new Date(dateStr).toLocaleDateString("vi-VN")
}

function AdminNotifRow({
  notif,
  selected,
  onToggle,
  onMarkRead,
}: {
  notif:      NotificationItem & { isStarred?: boolean }
  selected:   boolean
  onToggle:   (id: string) => void
  onMarkRead: (id: string) => void
}) {
  const meta = TYPE_META[notif.type] ?? { emoji: "🔔", color: "bg-gray-50 text-gray-600 border-gray-200" }

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50
        transition-colors cursor-pointer
        ${!notif.read ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-gray-50/70"}`}
      onClick={() => !notif.read && onMarkRead(notif.notificationId)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(notif.notificationId)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600
          focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shrink-0"
      />

      {/* Unread dot */}
      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-colors
        ${notif.read ? "bg-transparent" : "bg-blue-500"}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${notif.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>
            {notif.title || notif.body}
          </p>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5">
            {formatRelative(notif.createdAt)}
          </span>
        </div>

        {notif.title && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
            rounded-full border ${meta.color}`}>
            <span>{meta.emoji}</span>
            {notif.type}
          </span>
          {notif.link && (
            <a
              href={notif.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-500 hover:underline"
            >
              Xem chi tiết →
            </a>
          )}
          {notif.read && notif.readAt && (
            <span className="text-[11px] text-gray-400">
              Đã đọc {formatRelative(notif.readAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const { adminUser } = useAdminAuth()
  const {
    unreadCount,
    subscribeToNewNotification,
    subscribeToAllRead,
    subscribeToNotificationDeleted,
  } = useWebSocket()

  const [items,    setItems]    = useState<NotificationItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [tab,      setTab]      = useState<AdminTab>("ALL")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const hasLoaded = useRef(false)

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminNotifications()
      setItems(data)
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải thông báo"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    load()
  }, [load])

  // ── WS: thông báo mới ───────────────────────────────────────────────────────

  useEffect(() => {
    return subscribeToNewNotification((n) => {
      setItems((prev) => {
        if (prev.some((x) => x.notificationId === n.notificationId)) return prev
        return [n as unknown as NotificationItem, ...prev]
      })
    })
  }, [subscribeToNewNotification])

  // ── WS: all-read từ tab/thiết bị khác ──────────────────────────────────────

  useEffect(() => {
    return subscribeToAllRead(() => {
      setItems((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
      )
    })
  }, [subscribeToAllRead])

  // ── WS: xóa notification ───────────────────────────────────────────────────

  useEffect(() => {
    return subscribeToNotificationDeleted((deletedId) => {
      setItems((prev) => prev.filter((n) => n.notificationId !== deletedId))
      setSelected((prev) => {
        if (!prev.has(deletedId)) return prev
        const next = new Set(prev)
        next.delete(deletedId)
        return next
      })
    })
  }, [subscribeToNotificationDeleted])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markOneRead = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
      ),
    )
    try {
      await patchAdminRead(id)
    } catch {
      // Rollback
      setItems((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, read: false, readAt: null } : n,
        ),
      )
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setItems((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
    )
    try {
      await patchAdminReadAll()
    } catch {
      load() // rollback bằng cách reload
    }
  }, [load])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const filtered = items.filter((n) =>
    tab === "ALL" ? true : typeToTab(n.type) === tab,
  )

  const tabCount = (key: AdminTab) =>
    key === "ALL" ? items.length : items.filter((n) => typeToTab(n.type) === key).length

  const todayUnread = items.filter((n) => {
    if (n.read) return false
    const d = new Date(n.createdAt), now = new Date()
    return (
      d.getDate()     === now.getDate()    &&
      d.getMonth()    === now.getMonth()   &&
      d.getFullYear() === now.getFullYear()
    )
  }).length

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông Báo</h1>
        <p className="text-[16px] text-gray-500 mt-1">
          {unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc.`
            : "Tất cả thông báo đã được đọc."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="px-5 py-4 border-b border-gray-100">
          {todayUnread > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[16px] text-gray-600">
                <Bell size={15} className="text-blue-500" />
                <span>
                  Bạn có <strong>{todayUnread}</strong> thông báo mới hôm nay.
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck size={13} /> Đánh dấu tất cả đã đọc
                </button>
                <button
                  onClick={load}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                    rounded-lg transition-colors"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Select-all */}
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === filtered.length}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? new Set(filtered.map((n) => n.notificationId))
                    : new Set(),
                )
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600
                focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />

            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelected(new Set()) }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors border
                    ${tab === t.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  {t.label}
                  {tabCount(t.key) > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full
                        ${tab === t.key
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {tabCount(t.key)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bulk action */}
            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500">{selected.size} đã chọn</span>
                <button
                  onClick={async () => {
                    for (const id of selected) await markOneRead(id)
                    setSelected(new Set())
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600
                    border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="px-5 py-3 bg-red-50 text-[16px] text-red-600
            flex items-center justify-between">
            {error}
            <button
              onClick={load}
              className="text-xs underline text-red-400 hover:text-red-600"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* ── List ── */}
        <div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Inbox size={40} strokeWidth={1.5} />
              <p className="text-[16px]">Hiện chưa có thông báo nào.</p>
            </div>
          ) : (
            filtered
              .filter((n) => !!n.notificationId)
              .map((notif) => (
                <AdminNotifRow
                  key={notif.notificationId}
                  notif={notif}
                  selected={selected.has(notif.notificationId)}
                  onToggle={(id) =>
                    setSelected((prev) => {
                      const next = new Set(prev)
                      next.has(id) ? next.delete(id) : next.add(id)
                      return next
                    })
                  }
                  onMarkRead={markOneRead}
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}