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

interface NotificationsPageProps {
  description?: string
}

export function NotificationsPageContent({ description }: NotificationsPageProps) {
  const [items,       setItems]       = useState<NotificationItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [tab,         setTab]         = useState<NotificationTab>("ALL")
  const [selected,    setSelected]    = useState<Set<string>>(new Set())
  const [starred,     setStarred]     = useState<Set<string>>(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const hasLoaded = useRef(false)

  const { notifications: wsNotifs } = useWebSocket()

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

  // Merge WS notifications
  useEffect(() => {
    if (!wsNotifs.length) return
    setItems(prev => {
      const ids = new Set(prev.map(n => n.notificationId))
      const newOnes = wsNotifs.filter(n => !ids.has(n.notificationId))
      if (!newOnes.length) return prev
      setUnreadCount(c => c + newOnes.length)
      return [...newOnes, ...prev]
    })
  }, [wsNotifs])

  const markOneRead = useCallback(async (id: string) => {
    setItems(prev => prev.map(n =>
      n.notificationId === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
    ))
    setUnreadCount(c => Math.max(0, c - 1))
    try { await service.markOneRead(id) } catch { /* silent */ }
  }, [])

  const markAllRead = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
    setUnreadCount(0)
    try { await service.markAllRead() } catch { load() }
  }, [load])

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

  const filtered = service.filterByTab(
    items.map(n => ({ ...n, isStarred: starred.has(n.notificationId) })),
    tab,
  )

  const todayUnread = items.filter(n => {
    if (n.isRead) return false
    const d = new Date(n.createdAt), now = new Date()
    return d.getDate() === now.getDate()
      && d.getMonth() === now.getMonth()
      && d.getFullYear() === now.getFullYear()
  }).length

  const tabCount = (key: NotificationTab) =>
    key === "ALL" ? items.length : items.filter(n => typeToTab(n.type) === key).length

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông Báo</h1>
        <p className="text-sm text-gray-500 mt-1">
          {description ?? (unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc.`
            : "Tất cả thông báo đã được đọc.")}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100">

          {todayUnread > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell size={15} className="text-blue-500" />
                <span>Bạn có <strong>{todayUnread}</strong> thông báo mới hôm nay.</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <CheckCheck size={13} /> Đánh dấu tất cả đã đọc
                </button>
                <button onClick={load}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === filtered.length}
              onChange={e => setSelected(
                e.target.checked ? new Set(filtered.map(n => n.notificationId)) : new Set()
              )}
              className="w-4 h-4 rounded border-gray-300 text-blue-600
                focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {TABS.map(t => (
                <button key={t.key}
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

        {error && (
          <div className="px-5 py-3 bg-red-50 text-sm text-red-600 flex items-center justify-between">
            {error}
            <button onClick={load} className="text-xs underline text-red-400 hover:text-red-600">
              Thử lại
            </button>
          </div>
        )}

        <div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Inbox size={40} strokeWidth={1.5} />
              <p className="text-sm">Hiện chưa có thông báo nào.</p>
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

// ── Route exports ─────────────────────────────────────────────────────────────

// (candidate)/notifications/page.tsx  → default export này
export default function CandidateNotificationsPage() {
  return <NotificationsPageContent />
}