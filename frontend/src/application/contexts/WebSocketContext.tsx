"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useAuth } from "./AuthContext"
import api from "@/lib/axios"
import { getAccessToken } from "@/lib/auth-helpers"

interface Notification {
  notificationId: string
  title: string
  message: string
  type: string
  entityType: string | null
  entityId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

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
  notifications: Notification[]
  unreadCount: number
  connect: () => void
  disconnect: () => void
  subscribeToMessages: (handler: (msg: IncomingMessage) => void) => () => void
  sendMessageWs: (conversationId: string, content: string, type?: string) => void
  // ✅ Event-based subscriptions — không phụ thuộc vào snapshot array
  subscribeToNewNotification: (handler: (n: Notification) => void) => () => void
  subscribeToAllRead: (handler: () => void) => () => void
  subscribeToNotificationDeleted: (handler: (id: string) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  // notifications trong context chỉ dùng cho bell badge ở header (10 items gần nhất)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const messageHandlersRef                = useRef<Set<(msg: IncomingMessage) => void>>(new Set())
  // ✅ Event handler refs — emit từng event riêng lẻ, không dùng snapshot
  const newNotifHandlersRef               = useRef<Set<(n: Notification) => void>>(new Set())
  const allReadHandlersRef                = useRef<Set<() => void>>(new Set())
  const notifDeletedHandlersRef           = useRef<Set<(id: string) => void>>(new Set())

  const clientRef                         = useRef<Client | null>(null)
  const reconnectTimeoutRef               = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef              = useRef(0)
  const connectRef                        = useRef<() => void>(() => {})
  const MAX_RECONNECT_ATTEMPTS            = 5

  // ─── Helpers emit ────────────────────────────────────────────────────────────
  const emitNewNotification = useCallback((n: Notification) => {
    newNotifHandlersRef.current.forEach(h => h(n))
  }, [])

  const emitAllRead = useCallback(() => {
    allReadHandlersRef.current.forEach(h => h())
  }, [])

  const emitNotificationDeleted = useCallback((id: string) => {
    notifDeletedHandlersRef.current.forEach(h => h(id))
  }, [])

  // ─── Public subscribe API ────────────────────────────────────────────────────
  const subscribeToNewNotification = useCallback(
    (handler: (n: Notification) => void) => {
      newNotifHandlersRef.current.add(handler)
      return () => { newNotifHandlersRef.current.delete(handler) }
    }, []
  )

  const subscribeToAllRead = useCallback(
    (handler: () => void) => {
      allReadHandlersRef.current.add(handler)
      return () => { allReadHandlersRef.current.delete(handler) }
    }, []
  )

  const subscribeToNotificationDeleted = useCallback(
    (handler: (id: string) => void) => {
      notifDeletedHandlersRef.current.add(handler)
      return () => { notifDeletedHandlersRef.current.delete(handler) }
    }, []
  )

  // ─── Initial load ────────────────────────────────────────────────────────────
  const loadInitialNotifications = useCallback(async () => {
    if (!user) return
    try {
      const [notifResponse, countResponse] = await Promise.all([
        api.get("/notifications/recent"),
        api.get("/notifications/unread-count"),
      ])
      if (notifResponse.data.success) setNotifications(notifResponse.data.data)
      if (countResponse.data.success)  setUnreadCount(countResponse.data.data.unreadCount)
    } catch (error) {
      console.error("❌ [WebSocket] Failed to load initial notifications:", error)
    }
  }, [user])

  // ─── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!user || clientRef.current?.connected) {
      console.log("⏭️ [WebSocket] Skip connect: user not logged in or already connected")
      return
    }

    const token = getAccessToken()
    if (!token) {
      console.error("❌ [WebSocket] No access token available")
      return
    }

    const wsUrl      = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"
    const wsEndpoint = `${wsUrl}/api/v1/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log("🔍 [WebSocket] STOMP Debug:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ [WebSocket] Connected successfully")
        setIsConnected(true)
        reconnectAttemptsRef.current = 0

        // ── Messages ──────────────────────────────────────────────────────────
        client.subscribe(`/user/queue/messages`, (message: IMessage) => {
          const incoming: IncomingMessage = JSON.parse(message.body)
          console.log("💬 [WebSocket] New message:", incoming)
          messageHandlersRef.current.forEach(h => h(incoming))
        })

        // ── Notification mới (private) ────────────────────────────────────────
        const handleNewNotif = (notification: Notification) => {
          // Cập nhật badge header (max 10)
          setNotifications(prev => {
            const exists = prev.some(n => n.notificationId === notification.notificationId)
            if (exists) return prev
            return [notification, ...prev.slice(0, 9)]
          })
          if (!notification.isRead) setUnreadCount(prev => prev + 1)
          // ✅ Emit event để các subscriber (NotificationPage, v.v.) tự xử lý
          emitNewNotification(notification)
        }

        client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body))
        })

        // ── Broadcast (public topic) ──────────────────────────────────────────
        client.subscribe(`/topic/notifications`, (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body))
        })

        // ── Unread count từ server ────────────────────────────────────────────
        client.subscribe(`/user/queue/unread-count`, (message: IMessage) => {
          setUnreadCount(parseInt(message.body))
        })

        // ── All-read ──────────────────────────────────────────────────────────
        client.subscribe(`/user/queue/all-read`, () => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
          setUnreadCount(0)
          // ✅ Emit để NotificationPage sync
          emitAllRead()
        })

        // ── Deleted ───────────────────────────────────────────────────────────
        client.subscribe(`/user/queue/notification-deleted`, (message: IMessage) => {
          const deletedId = message.body.replace(/"/g, "")
          setNotifications(prev => {
            const deleted = prev.find(n => n.notificationId === deletedId)
            if (deleted && !deleted.isRead) setUnreadCount(c => Math.max(0, c - 1))
            return prev.filter(n => n.notificationId !== deletedId)
          })
          // ✅ Emit để NotificationPage sync
          emitNotificationDeleted(deletedId)
        })

        console.log("✅ [WebSocket] All subscriptions established")
      },

      onStompError: (frame) => {
        console.error("❌ [WebSocket] STOMP error:", frame.headers["message"], frame.body)
        setIsConnected(false)
      },

      onWebSocketError: (error) => {
        console.error("❌ [WebSocket] Error:", error)
        setIsConnected(false)
      },

      onDisconnect: () => {
        console.log("🔌 [WebSocket] Disconnected")
        setIsConnected(false)
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++
          console.log(`🔄 [WebSocket] Reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`)
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
  }, [user, emitNewNotification, emitAllRead, emitNotificationDeleted])

  useEffect(() => { connectRef.current = connect }, [connect])

  // ─── Message helpers ──────────────────────────────────────────────────────────
  const subscribeToMessages = useCallback(
    (handler: (msg: IncomingMessage) => void) => {
      messageHandlersRef.current.add(handler)
      return () => { messageHandlersRef.current.delete(handler) }
    }, []
  )

  const sendMessageWs = useCallback(
    (conversationId: string, content: string, type = "TEXT") => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ [WebSocket] Not connected, cannot send via WS")
        return
      }
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ conversationId, content, type }),
      })
    }, []
  )

  // ─── Disconnect ───────────────────────────────────────────────────────────────
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
  }, [])

  // ─── Lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      loadInitialNotifications()
      const timer = setTimeout(() => connect(), 500)
      return () => { clearTimeout(timer); disconnect() }
    } else {
      disconnect()
    }
  }, [user, loadInitialNotifications, connect, disconnect])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && !isConnected) connect()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [user, isConnected, connect])

  useEffect(() => {
    const handleTokenChange = () => {
      if (user && clientRef.current?.connected) {
        disconnect()
        setTimeout(() => connect(), 1000)
      }
    }
    window.addEventListener("tokenChanged", handleTokenChange)
    return () => window.removeEventListener("tokenChanged", handleTokenChange)
  }, [user, connect, disconnect])

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