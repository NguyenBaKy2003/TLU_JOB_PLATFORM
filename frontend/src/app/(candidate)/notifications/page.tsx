// src/app/(dashboard)/notifications/page.tsx
"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, MoreHorizontal, RefreshCw, CheckCheck, Inbox } from "lucide-react"
import { NotificationRow }        from "@/presentation/components/notifications/NotificationRow"
import { NotificationService }    from "@/application/services/NotificationService"
import { NotificationRepository } from "@/infrastructure/repositories/NotificationRepository"
import { useWebSocket }           from "@/application/contexts/WebSocketContext"
import { extractErrorMessage }    from "@/lib/extractErrorMessage"
import type { NotificationItem, NotificationType } from "@/domain/models/Notification"

const service = new NotificationService(new NotificationRepository())

type Tab = "ALL" | "NEW_JOB" | "MESSAGE" | "APPLY_RESULT"

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL",          label: "Tất cả" },
  { key: "NEW_JOB",      label: "Việc làm mới" },
  { key: "MESSAGE",      label: "Tin nhắn" },
  { key: "APPLY_RESULT", label: "Kết quả ứng tuyển" },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [items,       setItems]       = useState<NotificationItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [tab,         setTab]         = useState<Tab>("ALL")
  const [selected,    setSelected]    = useState<Set<string>>(new Set())
  const [starred,     setStarred]     = useState<Set<string>>(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const hasLoaded = useRef(false)

  const { notifications: wsNotifs } = useWebSocket()

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await service.list(0, 50)
      setItems(res.notifications)
      setUnreadCount(res.unreadCount)
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải thông báo"))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    load()
  }, [load])

  // ── Sync tin nhắn mới từ WebSocket context ────────────────────────────────
  useEffect(() => {
    if (!wsNotifs.length) return
    setItems(prev => {
      const ids = new Set(prev.map(n => n.notificationId))
      const newOnes = wsNotifs
        .filter(n => !ids.has(n.notificationId))
        .map(n => n as unknown as NotificationItem)
      if (!newOnes.length) return prev
      return [...newOnes, ...prev]
    })
  }, [wsNotifs])

  // ── Mark one read ──────────────────────────────────────────────────────────
  const markOneRead = useCallback(async (id: string) => {
    // Optimistic
    setItems(prev => prev.map(n =>
      n.notificationId === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
    ))
    setUnreadCount(c => Math.max(0, c - 1))
    try { await service.markOneRead(id) } catch { /* revert nếu muốn */ }
  }, [])

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
    setUnreadCount(0)
    try { await service.markAllRead() } catch { load() }
  }, [load])

  // ── Toggle star (client-only) ─────────────────────────────────────────────
  const toggleStar = useCallback((id: string) => {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(filtered.map(n => n.notificationId)))
  }, []) // deps bổ sung bên dưới

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = service.filterByTab(
    items.map(n => ({ ...n, isStarred: starred.has(n.notificationId) })),
    tab,
  )

  const todayCount = filtered.filter(n => {
    const d = new Date(n.createdAt)
    const today = new Date()
    return d.getDate() === today.getDate()
      && d.getMonth() === today.getMonth()
      && d.getFullYear() === today.getFullYear()
  }).length

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông Báo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100">

          {/* Summary row */}
          {todayCount > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell size={15} className="text-blue-500" />
                <span>Bạn có <strong>{todayCount}</strong> thông báo mới hôm nay.</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck size={13} />
                  Đánh dấu tất cả đã đọc
                </button>
                <button
                  onClick={load}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw size={13} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Tabs + checkbox header */}
          <div className="flex items-center gap-2">
            {/* Select all checkbox */}
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === filtered.length}
              onChange={e => e.target.checked ? selectAll() : clearSelection()}
              className="w-4 h-4 rounded border-gray-300 text-blue-600
                focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />

            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); clearSelection() }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors border
                    ${tab === t.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  {t.label}
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
                    clearSelection()
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

        {/* Error */}
        {error && (
          <div className="px-5 py-3 bg-red-50 text-sm text-red-600 flex items-center justify-between">
            {error}
            <button onClick={load} className="text-xs underline text-red-400 hover:text-red-600">
              Thử lại
            </button>
          </div>
        )}

        {/* List */}
        <div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Inbox size={40} strokeWidth={1.5} />
              <p className="text-sm">Hiện chưa có thông báo nào trong hộp thư của bạn.</p>
            </div>
          ) : (
            filtered.map(notif => (
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