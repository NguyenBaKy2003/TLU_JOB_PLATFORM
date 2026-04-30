"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useAuth } from "./AuthContext"
import api from "@/lib/axios"
import { getAccessToken } from "@/lib/auth-helpers"
import type { NotificationItem } from "@/domain/models/Notification"

export type { NotificationItem }

export interface IncomingMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: string
  read: boolean
  readAt: string | null
  createdAt: string
}

interface WebSocketContextType {
  isConnected: boolean
  notifications: NotificationItem[]
  unreadCount: number
  connect: () => void
  disconnect: () => void
  subscribeToMessages: (handler: (msg: IncomingMessage) => void) => () => void
  sendMessageWs: (conversationId: string, content: string, type?: string) => void
  subscribeToNewNotification: (handler: (n: NotificationItem) => void) => () => void
  subscribeToAllRead: (handler: () => void) => () => void
  subscribeToNotificationDeleted: (handler: (id: string) => void) => () => void
  /**
   * Subscribe một STOMP topic tùy ý.
   * - Connected: subscribe ngay
   * - Chưa connected: đăng ký pending, auto re-subscribe khi connect/reconnect
   *
   * Cleanup function trả về: hủy subscription hiện tại,
   * KHÔNG xóa khỏi pending (để re-subscribe sau reconnect vẫn hoạt động).
   * Pending chỉ bị clear khi disconnect() chủ động.
   */
  subscribeTopic: (topic: string, handler: (body: any) => void) => () => void
  publishMessage: (destination: string, body: object) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

function mapRawNotification(raw: any): NotificationItem {
  return {
    notificationId: raw.notificationId ?? raw.id ?? "",
    type: raw.type,
    title: raw.title ?? "",
    body: raw.body ?? raw.message ?? "",
    link: raw.link ?? null,
    read: raw.read === true || raw.isRead === true,
    readAt: raw.readAt ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

function mapRestNotification(raw: any): NotificationItem {
  return {
    notificationId: raw.id ?? raw.notificationId ?? "",
    type: raw.type,
    title: raw.title ?? "",
    body: raw.body ?? "",
    link: raw.link ?? null,
    read: raw.read === true,
    readAt: raw.readAt ?? null,
    createdAt: raw.createdAt ?? "",
  }
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const messageHandlersRef = useRef<Set<(msg: IncomingMessage) => void>>(new Set())
  const newNotifHandlersRef = useRef<Set<(n: NotificationItem) => void>>(new Set())
  const allReadHandlersRef = useRef<Set<() => void>>(new Set())
  const notifDeletedHandlersRef = useRef<Set<(id: string) => void>>(new Set())

  const clientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const connectRef = useRef<() => void>(() => { })
  const MAX_RECONNECT_ATTEMPTS = 5

  /**
   * pending: topic → handler (registry để re-subscribe sau reconnect)
   * KHÔNG xóa khi component unmount, CHỈ xóa khi disconnect() chủ động.
   */
  const pendingSubscriptionsRef = useRef<Map<string, (body: any) => void>>(new Map())

  /**
   * active: topic → STOMP unsubscribe function (cleanup subscription hiện tại)
   * Bị clear khi onDisconnect và khi disconnect() chủ động.
   */
  const activeSubscriptionsRef = useRef<Map<string, () => void>>(new Map())

  const emitNewNotification = useCallback((n: NotificationItem) => {
    newNotifHandlersRef.current.forEach(h => h(n))
  }, [])

  const emitAllRead = useCallback(() => {
    allReadHandlersRef.current.forEach(h => h())
  }, [])

  const emitNotificationDeleted = useCallback((id: string) => {
    notifDeletedHandlersRef.current.forEach(h => h(id))
  }, [])

  const subscribeToNewNotification = useCallback(
    (handler: (n: NotificationItem) => void) => {
      newNotifHandlersRef.current.add(handler)
      return () => { newNotifHandlersRef.current.delete(handler) }
    }, [],
  )

  const subscribeToAllRead = useCallback(
    (handler: () => void) => {
      allReadHandlersRef.current.add(handler)
      return () => { allReadHandlersRef.current.delete(handler) }
    }, [],
  )

  const subscribeToNotificationDeleted = useCallback(
    (handler: (id: string) => void) => {
      notifDeletedHandlersRef.current.add(handler)
      return () => { notifDeletedHandlersRef.current.delete(handler) }
    }, [],
  )

  const loadInitialNotifications = useCallback(async () => {
    if (!user) return
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications/recent"),
        api.get("/notifications/unread-count"),
      ])
      if (notifRes.data.success) {
        const raw: any[] = notifRes.data.data ?? []
        setNotifications(raw.map(mapRestNotification))
      }
      if (countRes.data.success) {
        setUnreadCount(countRes.data.data?.unreadCount ?? 0)
      }
    } catch (error) {
      console.error("❌ [WebSocket] Failed to load initial notifications:", error)
    }
  }, [user])

  const subscribeTopic = useCallback(
    (topic: string, handler: (body: any) => void): (() => void) => {
      // Luôn cập nhật pending với handler mới nhất (tránh stale closure)
      pendingSubscriptionsRef.current.set(topic, handler)

      if (clientRef.current?.connected) {
        // Hủy active subscription cũ nếu có (tránh duplicate)
        const existingUnsub = activeSubscriptionsRef.current.get(topic)
        if (existingUnsub) existingUnsub()

        const sub = clientRef.current.subscribe(topic, (msg: IMessage) => {
          // Đọc từ pending để luôn gọi handler mới nhất
          const currentHandler = pendingSubscriptionsRef.current.get(topic)
          if (currentHandler) currentHandler(JSON.parse(msg.body))
        })

        const unsub = () => {
          sub.unsubscribe()
          activeSubscriptionsRef.current.delete(topic)
          // KHÔNG xóa khỏi pendingSubscriptionsRef
        }
        activeSubscriptionsRef.current.set(topic, unsub)
        return unsub
      }

      // Chưa connected — onConnect sẽ subscribe sau
      return () => {
        activeSubscriptionsRef.current.delete(topic)
        // KHÔNG xóa khỏi pendingSubscriptionsRef
      }
    },
    [], // stable — không có deps thay đổi theo render
  )

  const publishMessage = useCallback((destination: string, body: object) => {
    if (!clientRef.current?.connected) {
      console.warn("⚠️ [WebSocket] Not connected, cannot publish to", destination)
      return
    }
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    })
  }, [])

  const connect = useCallback(() => {
    if (!user || clientRef.current?.connected) return

    const token = getAccessToken()
    if (!token) {
      console.error("❌ [WebSocket] No access token")
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"
    const wsEndpoint = `${wsUrl}/api/v1/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ [WebSocket] Connected")
        setIsConnected(true)
        reconnectAttemptsRef.current = 0

        client.subscribe("/user/queue/messages", (message: IMessage) => {
          const incoming: IncomingMessage = JSON.parse(message.body)
          messageHandlersRef.current.forEach(h => h(incoming))
        })

        const handleNewNotif = (raw: any) => {
          const notification = mapRawNotification(raw)
          setNotifications(prev => {
            const exists = prev.some(n => n.notificationId === notification.notificationId)
            if (exists) return prev
            return [notification, ...prev.slice(0, 19)]
          })
          if (!notification.read) setUnreadCount(prev => prev + 1)
          emitNewNotification(notification)
        }

        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body))
        })
        client.subscribe("/topic/notifications", (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body))
        })
        client.subscribe("/user/queue/unread-count", (message: IMessage) => {
          const count = parseInt(message.body, 10)
          if (!isNaN(count)) setUnreadCount(count)
        })
        client.subscribe("/user/queue/notification-read", (message: IMessage) => {
          let readId: string
          try {
            const parsed = JSON.parse(message.body)
            readId = parsed.notificationId ?? parsed.id ?? parsed
          } catch {
            readId = message.body.replace(/"/g, "")
          }
          setNotifications(prev =>
            prev.map(n =>
              n.notificationId === readId
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n
            )
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        })
        client.subscribe("/user/queue/all-read", () => {
          setNotifications(prev =>
            prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
          )
          setUnreadCount(0)
          emitAllRead()
        })
        client.subscribe("/user/queue/notification-deleted", (message: IMessage) => {
          const deletedId = message.body.replace(/"/g, "")
          setNotifications(prev => {
            const deleted = prev.find(n => n.notificationId === deletedId)
            if (deleted && !deleted.read) setUnreadCount(c => Math.max(0, c - 1))
            return prev.filter(n => n.notificationId !== deletedId)
          })
          emitNotificationDeleted(deletedId)
        })

        // Re-subscribe tất cả pending topics sau connect/reconnect
        // Đọc handler từ pendingSubscriptionsRef để luôn dùng handler mới nhất
        pendingSubscriptionsRef.current.forEach((_, topic) => {
          console.log("🔄 [WebSocket] Re-subscribing topic:", topic)
          const sub = client.subscribe(topic, (msg: IMessage) => {
            const currentHandler = pendingSubscriptionsRef.current.get(topic)
            if (currentHandler) currentHandler(JSON.parse(msg.body))
          })
          activeSubscriptionsRef.current.set(topic, () => sub.unsubscribe())
        })

        loadInitialNotifications()
      },

      onStompError: (frame) => {
        console.error("❌ [STOMP] error:", frame.headers["message"], frame.body)
        setIsConnected(false)
      },

      onWebSocketError: (error) => {
        console.error("❌ [WebSocket] error:", error)
        setIsConnected(false)
      },

      onDisconnect: () => {
        console.log("🔌 [WebSocket] Disconnected")
        setIsConnected(false)
        // Active subs đã dead — clear để tránh gọi unsubscribe trên dead connection
        activeSubscriptionsRef.current.clear()

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30_000)
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current()
          }, delay)
        } else {
          console.error("❌ [WebSocket] Max reconnect attempts reached")
        }
      },
    })

    client.activate()
    clientRef.current = client
  }, [user, emitNewNotification, emitAllRead, emitNotificationDeleted, loadInitialNotifications])

  useEffect(() => { connectRef.current = connect }, [connect])

  const subscribeToMessages = useCallback(
    (handler: (msg: IncomingMessage) => void) => {
      messageHandlersRef.current.add(handler)
      return () => { messageHandlersRef.current.delete(handler) }
    }, [],
  )

  const sendMessageWs = useCallback(
    (conversationId: string, content: string, type = "TEXT") => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ [WebSocket] Not connected")
        return
      }
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ conversationId, content, type }),
      })
    }, [],
  )

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
    setIsConnected(false)
    setNotifications([])
    setUnreadCount(0)
    reconnectAttemptsRef.current = 0
    // Disconnect chủ động → clear cả hai map
    pendingSubscriptionsRef.current.clear()
    activeSubscriptionsRef.current.clear()
  }, [])

  // Dùng connectRef thay vì connect trực tiếp để effect không re-run
  // khi connect reference thay đổi (do deps bên trong thay đổi)
  useEffect(() => {
    if (user) {
      loadInitialNotifications()
      connectRef.current()
      return () => { disconnect() }
    } else {
      disconnect()
    }
  }, [user, loadInitialNotifications, disconnect])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && !isConnected) {
        connectRef.current()
        loadInitialNotifications()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [user, isConnected, loadInitialNotifications])

  useEffect(() => {
    const handleTokenChange = () => {
      if (user && clientRef.current?.connected) {
        disconnect()
        setTimeout(() => connectRef.current(), 1_000)
      }
    }
    window.addEventListener("tokenChanged", handleTokenChange)
    return () => window.removeEventListener("tokenChanged", handleTokenChange)
  }, [user, disconnect])

  const value: WebSocketContextType = {
    isConnected,
    notifications,
    unreadCount,
    connect,
    disconnect,
    subscribeToMessages,
    sendMessageWs,
    subscribeToNewNotification,
    subscribeToAllRead,
    subscribeToNotificationDeleted,
    subscribeTopic,
    publishMessage,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within WebSocketProvider")
  }
  return context
}