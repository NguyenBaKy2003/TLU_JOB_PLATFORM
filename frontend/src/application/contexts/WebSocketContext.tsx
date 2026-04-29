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

export interface StreamViewerCount {
  sessionId: string
  viewerCount: number
  timestamp: string
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
  // ── Stream helpers ──────────────────────────────────────────
  subscribeTopic: (topic: string, handler: (body: any) => void) => () => void
  publishMessage: (destination: string, body: object) => void
  // ── Stream viewer count helpers ────────────────────────────
  subscribeToViewerCount: (
    sessionId: string,
    handler: (viewerCount: number) => void
  ) => () => void
  getViewerCount: (sessionId: string) => Promise<number>
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

function mapRawNotification(raw: any): NotificationItem {
  return {
    notificationId: raw.notificationId ?? raw.id ?? "",
    type:           raw.type,
    title:          raw.title ?? "",
    body:           raw.body ?? raw.message ?? "",
    link:           raw.link ?? null,
    read:           raw.read === true || raw.isRead === true,
    readAt:         raw.readAt ?? null,
    createdAt:      raw.createdAt ?? new Date().toISOString(),
  }
}

function mapRestNotification(raw: any): NotificationItem {
  return {
    notificationId: raw.id ?? raw.notificationId ?? "",
    type:           raw.type,
    title:          raw.title ?? "",
    body:           raw.body ?? "",
    link:           raw.link ?? null,
    read:           raw.read === true,
    readAt:         raw.readAt ?? null,
    createdAt:      raw.createdAt ?? "",
  }
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isConnected,   setIsConnected]   = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  const messageHandlersRef      = useRef<Set<(msg: IncomingMessage) => void>>(new Set())
  const newNotifHandlersRef     = useRef<Set<(n: NotificationItem) => void>>(new Set())
  const allReadHandlersRef      = useRef<Set<() => void>>(new Set())
  const notifDeletedHandlersRef = useRef<Set<(id: string) => void>>(new Set())
  
  // Stream viewer count handlers
  const viewerCountHandlersRef = useRef<Map<string, Set<(count: number) => void>>>(new Map())

  const clientRef            = useRef<Client | null>(null)
  const reconnectTimeoutRef  = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const connectRef           = useRef<() => void>(() => {})
  const MAX_RECONNECT_ATTEMPTS = 5

  // Lưu các pending subscription để re-subscribe sau khi reconnect
  const pendingSubscriptionsRef = useRef<Map<string, (body: any) => void>>(new Map())
  const pendingViewerSubscriptionsRef = useRef<Map<string, Set<(count: number) => void>>>(new Map())

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

  // ── Stream viewer count helpers ────────────────────────────
  const getViewerCount = useCallback(async (sessionId: string): Promise<number> => {
    try {
      const response = await api.get(`/streams/${sessionId}`)
      return response.data.data?.viewerCount || 0
    } catch (error) {
      console.error("Failed to get viewer count:", error)
      return 0
    }
  }, [])

  const subscribeToViewerCount = useCallback(
    (sessionId: string, handler: (viewerCount: number) => void): (() => void) => {
      const topic = `/topic/streams/${sessionId}/viewers`
      
      // Lưu handler vào ref để quản lý
      if (!viewerCountHandlersRef.current.has(sessionId)) {
        viewerCountHandlersRef.current.set(sessionId, new Set())
      }
      viewerCountHandlersRef.current.get(sessionId)!.add(handler)
      
      // Lưu vào pending subscriptions để re-subscribe khi reconnect
      if (!pendingViewerSubscriptionsRef.current.has(sessionId)) {
        pendingViewerSubscriptionsRef.current.set(sessionId, new Set())
      }
      pendingViewerSubscriptionsRef.current.get(sessionId)!.add(handler)

      // Tạo wrapper handler để emit cho tất cả handlers của session này
      const wrapperHandler = (body: any) => {
        const data = body.data || body
        const count = data.viewerCount || data.count || 0
        viewerCountHandlersRef.current.get(sessionId)?.forEach(h => h(count))
      }

      let subscription: any = null
      if (clientRef.current?.connected) {
        subscription = clientRef.current.subscribe(topic, (msg: IMessage) => {
          wrapperHandler(JSON.parse(msg.body))
        })
      }

      // Return cleanup function
      return () => {
        const handlers = viewerCountHandlersRef.current.get(sessionId)
        if (handlers) {
          handlers.delete(handler)
          if (handlers.size === 0) {
            viewerCountHandlersRef.current.delete(sessionId)
            pendingViewerSubscriptionsRef.current.delete(sessionId)
            if (subscription) {
              subscription.unsubscribe()
            }
          }
        }
      }
    },
    [],
  )

  // ── subscribeTopic: cho phép page bất kỳ subscribe topic tùy ý ──────────────
  const subscribeTopic = useCallback(
    (topic: string, handler: (body: any) => void): (() => void) => {
      // Lưu vào pending để re-subscribe khi reconnect
      pendingSubscriptionsRef.current.set(topic, handler)

      if (clientRef.current?.connected) {
        const sub = clientRef.current.subscribe(topic, (msg: IMessage) => {
          handler(JSON.parse(msg.body))
        })
        return () => {
          sub.unsubscribe()
          pendingSubscriptionsRef.current.delete(topic)
        }
      }

      // Chưa connected — cleanup chỉ xóa khỏi pending
      return () => {
        pendingSubscriptionsRef.current.delete(topic)
      }
    },
    [],
  )

  // ── publishMessage: publish STOMP message từ bất kỳ component nào ───────────
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

    const wsUrl      = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"
    const wsEndpoint = `${wsUrl}/api/v1/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ [WebSocket] Connected")
        setIsConnected(true)
        reconnectAttemptsRef.current = 0

        // ── Notification subscriptions ─────────────────────────────────────
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

        // ── Re-subscribe các pending topic (stream pages) ──────────────────
        pendingSubscriptionsRef.current.forEach((handler, topic) => {
          console.log("🔄 [WebSocket] Re-subscribing topic:", topic)
          client.subscribe(topic, (msg: IMessage) => {
            handler(JSON.parse(msg.body))
          })
        })

        // ── Re-subscribe các pending viewer count subscriptions ────────────
        pendingViewerSubscriptionsRef.current.forEach((handlers, sessionId) => {
          const topic = `/topic/streams/${sessionId}/viewers`
          console.log("🔄 [WebSocket] Re-subscribing viewer count for session:", sessionId)
          
          const wrapperHandler = (body: any) => {
            const data = body.data || body
            const count = data.viewerCount || data.count || 0
            handlers.forEach(h => h(count))
          }
          
          client.subscribe(topic, (msg: IMessage) => {
            wrapperHandler(JSON.parse(msg.body))
          })
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
    
    // Clear all handlers
    viewerCountHandlersRef.current.clear()
    pendingViewerSubscriptionsRef.current.clear()
    pendingSubscriptionsRef.current.clear()
  }, [])

  useEffect(() => {
    if (user) {
      loadInitialNotifications()
      connect()
      return () => { disconnect() }
    } else {
      disconnect()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && !isConnected) {
        connect()
        loadInitialNotifications()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [user, isConnected, connect, loadInitialNotifications])

  useEffect(() => {
    const handleTokenChange = () => {
      if (user && clientRef.current?.connected) {
        disconnect()
        setTimeout(() => connect(), 1_000)
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
    subscribeTopic,
    publishMessage,
    subscribeToViewerCount,
    getViewerCount,
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