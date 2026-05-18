"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, RefreshCw, CheckCheck, Inbox } from "lucide-react"
import { NotificationRow }        from "@/presentation/components/notifications/NotificationRow"
import { NotificationService }    from "@/application/services/NotificationService"
import { NotificationRepository } from "@/infrastructure/repositories/NotificationRepository"
import { useWebSocket }           from "@/application/contexts/WebSocketContext"
import { extractErrorMessage }    from "@/lib/extractErrorMessage"
import type { NotificationItem, NotificationTab } from "@/domain/models/Notification"
import { typeToTab } from "@/domain/models/Notification"

const service = new NotificationService(new NotificationRepository())

const TABS: { key: NotificationTab; label: string }[] = [
  { key: "ALL",          label: "Tất cả"            },
  { key: "NEW_JOB",      label: "Việc làm mới"      },
  { key: "MESSAGE",      label: "Tin nhắn"           },
  { key: "APPLY_RESULT", label: "Kết quả ứng tuyển" },
  { key: "SYSTEM",       label: "Hệ thống"           },
]

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

export default function EmployerNotificationsPage() {
  const [items,    setItems]    = useState<NotificationItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [tab,      setTab]      = useState<NotificationTab>("ALL")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [starred,  setStarred]  = useState<Set<string>>(new Set())

  // unreadCount + markAsRead/markAllAsRead từ Context — single source of truth
  const {
    unreadCount,
    subscribeToNewNotification,
    subscribeToAllRead,
    subscribeToNotificationDeleted,
    markAsRead,
    markAllAsRead: markAllAsReadCtx,
  } = useWebSocket()

  // Dùng ref để tránh load 2 lần ở StrictMode
  const hasLoaded = useRef(false)

  // ─── Load danh sách từ API ─────
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await service.list(0, 50)
      setItems(res.notifications)
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

  // ─── WS: Notification mới ──────
  useEffect(() => {
    return subscribeToNewNotification((newNotif) => {
      setItems(prev => {
        if (prev.some(n => n.notificationId === newNotif.notificationId)) return prev
        return [newNotif as unknown as NotificationItem, ...prev]
      })
    })
  }, [subscribeToNewNotification])

  // ─── WS: All-read (đồng bộ từ tab/thiết bị khác) ──
  useEffect(() => {
    return subscribeToAllRead(() => {
      setItems(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })))
    })
  }, [subscribeToAllRead])

  // ─── WS: Notification bị xóa ───
  useEffect(() => {
    return subscribeToNotificationDeleted((deletedId) => {
      setItems(prev => prev.filter(n => n.notificationId !== deletedId))
      setSelected(prev => {
        if (!prev.has(deletedId)) return prev
        const next = new Set(prev)
        next.delete(deletedId)
        return next
      })
    })
  }, [subscribeToNotificationDeleted])

  // ─── Actions ────────────
  const markOneRead = useCallback(async (id: string) => {
    setItems(prev => prev.map(n =>
      n.notificationId === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
    ))
    await markAsRead(id)
  }, [markAsRead])

  const markAllRead = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })))
    await markAllAsReadCtx()
  }, [markAllAsReadCtx])

  const toggleStar = useCallback((id: string) => {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // ─── Derived state ───────
  const filtered = service.filterByTab(
    items.map(n => ({ ...n, isStarred: starred.has(n.notificationId) })),
    tab,
  )

  const todayUnread = items.filter(n => {
    if (n.read) return false
    const d = new Date(n.createdAt), now = new Date()
    return (
      d.getDate()     === now.getDate()   &&
      d.getMonth()    === now.getMonth()  &&
      d.getFullYear() === now.getFullYear()
    )
  }).length

  const tabCount = (key: NotificationTab) =>
    key === "ALL" ? items.length : items.filter(n => typeToTab(n.type) === key).length

  // ─── Render ──────────────
  return (
    <div className="mx-auto">
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
                <span>Bạn có <strong>{todayUnread}</strong> thông báo mới hôm nay.</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <CheckCheck size={13} /> Đánh dấu tất cả đã đọc
                </button>
                <button
                  onClick={load}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Select-all checkbox */}
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === filtered.length}
              onChange={e =>
                setSelected(
                  e.target.checked
                    ? new Set(filtered.map(n => n.notificationId))
                    : new Set()
                )
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600
                focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />

            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelected(new Set()) }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors border
                    ${tab === t.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}>
                  {t.label}
                  {tabCount(t.key) > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full
                      ${tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
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
                    border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Đánh dấu đã đọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="px-5 py-3 bg-red-50 text-[16px] text-red-600 flex items-center justify-between">
            {error}
            <button onClick={load} className="text-xs underline text-red-400 hover:text-red-600">
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
              .filter(n => !!n.notificationId)
              .map(notif => (
                <NotificationRow
                  key={notif.notificationId}
                  notif={notif}
                  selected={selected.has(notif.notificationId)}
                  onToggle={toggleSelect}
                  onMarkRead={markOneRead}
                  onToggleStar={toggleStar}
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}