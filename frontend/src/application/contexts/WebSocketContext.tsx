"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";
import { getAccessToken } from "@/lib/auth-helpers";
import type { NotificationItem } from "@/domain/models/Notification";

export type { NotificationItem };

export interface IncomingMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  connect: () => void;
  disconnect: () => void;
  subscribeToMessages: (handler: (msg: IncomingMessage) => void) => () => void;
  sendMessageWs: (conversationId: string, content: string, type?: string) => void;
  subscribeToNewNotification: (handler: (n: NotificationItem) => void) => () => void;
  subscribeToAllRead: (handler: () => void) => () => void;
  subscribeToNotificationDeleted: (handler: (id: string) => void) => () => void;
  subscribeTopic: (topic: string, handler: (body: any) => void) => () => void;
  publishMessage: (destination: string, body: object) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

function mapRawNotification(raw: any): NotificationItem {
  const payload = raw.data ?? raw;
  return {
    notificationId: payload.notificationId ?? payload.id ?? "",
    type: payload.type ?? raw.type ?? "",
    title: payload.title ?? "",
    body: payload.body ?? payload.message ?? payload.content ?? "",
    link: payload.link ?? payload.url ?? null,
    read: payload.read === true || payload.isRead === true,
    readAt: payload.readAt ?? null,
    createdAt: payload.createdAt ?? raw.timestamp ?? new Date().toISOString(),
  };
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
  };
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messageHandlersRef = useRef<Set<(msg: IncomingMessage) => void>>(new Set());
  const newNotifHandlersRef = useRef<Set<(n: NotificationItem) => void>>(new Set());
  const allReadHandlersRef = useRef<Set<() => void>>(new Set());
  const notifDeletedHandlersRef = useRef<Set<(id: string) => void>>(new Set());

  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectRef = useRef<() => void>(() => {});
  const MAX_RECONNECT_ATTEMPTS = 5;

  // pendingSubscriptionsRef : topic → handler mới nhất (kể cả khi chưa connected)
  // activeSubscriptionsRef  : topic → hàm unsubscribe STOMP thực sự
  const pendingSubscriptionsRef = useRef<Map<string, (body: any) => void>>(new Map());
  const activeSubscriptionsRef = useRef<Map<string, () => void>>(new Map());

  const notificationsRef = useRef<NotificationItem[]>(notifications);
  useEffect(() => { notificationsRef.current = notifications; }, [notifications]);

  const emitNewNotification = useCallback((n: NotificationItem) => {
    newNotifHandlersRef.current.forEach((h) => h(n));
  }, []);

  const emitAllRead = useCallback(() => {
    allReadHandlersRef.current.forEach((h) => h());
  }, []);

  const emitNotificationDeleted = useCallback((id: string) => {
    notifDeletedHandlersRef.current.forEach((h) => h(id));
  }, []);

  const subscribeToNewNotification = useCallback(
    (handler: (n: NotificationItem) => void) => {
      newNotifHandlersRef.current.add(handler);
      return () => { newNotifHandlersRef.current.delete(handler); };
    }, [],
  );

  const subscribeToAllRead = useCallback((handler: () => void) => {
    allReadHandlersRef.current.add(handler);
    return () => { allReadHandlersRef.current.delete(handler); };
  }, []);

  const subscribeToNotificationDeleted = useCallback(
    (handler: (id: string) => void) => {
      notifDeletedHandlersRef.current.add(handler);
      return () => { notifDeletedHandlersRef.current.delete(handler); };
    }, [],
  );

  const loadInitialNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications/recent"),
        api.get("/notifications/unread-count"),
      ]);
      if (notifRes.data.success) {
        const raw: any[] = notifRes.data.data ?? [];
        setNotifications(raw.map(mapRestNotification));
      }
      if (countRes.data.success) {
        setUnreadCount(countRes.data.data?.unreadCount ?? 0);
      }
    } catch (error) {
      console.error("❌ [WebSocket] Failed to load initial notifications:", error);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    const target = notificationsRef.current.find((n) => n.notificationId === id);
    if (!target || target.read) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, read: false, readAt: null } : n,
        ),
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
    );
    setUnreadCount(0);

    try {
      await api.patch("/notifications/read-all");
    } catch {
      loadInitialNotifications();
    }
  }, [loadInitialNotifications]);

  // ─────────────────
  // subscribeTopic — thiết kế đúng cho race condition giữa mount và connect:
  //
  // Luồng 1 (đã connected khi gọi):
  //   → Subscribe STOMP ngay, lưu unsub vào activeSubscriptionsRef
  //   → cleanup: hủy STOMP sub VÀ xóa pending (handler đã "active", không cần restore)
  //
  // Luồng 2 (chưa connected khi gọi):
  //   → Chỉ lưu handler vào pendingSubscriptionsRef
  //   → onConnect sẽ flush tất cả pending → subscribe STOMP
  //   → cleanup: CHỈ xóa pending (không có active sub để hủy)
  //     ⚠️  KHÔNG xóa active ở đây vì onConnect có thể đã tạo active sub
  //         trong khoảng thời gian giữa mount và cleanup chạy.
  //         onConnect tự kiểm tra has(topic) trước khi subscribe.
  //
  // Luồng 3 (CandidateViewerPage thêm isConnected vào dep array):
  //   → Khi WS reconnect (isConnected: false→true), useEffect re-run
  //   → subscribeTopic được gọi lại với handler mới nhất → subscribe đúng
  // ─────────────────
  const subscribeTopic = useCallback(
    (topic: string, handler: (body: any) => void): (() => void) => {
      // Luôn cập nhật handler mới nhất vào pending
      pendingSubscriptionsRef.current.set(topic, handler);

      if (clientRef.current?.connected) {
        // Hủy subscription STOMP cũ nếu đang tồn tại (tránh duplicate)
        const existingUnsub = activeSubscriptionsRef.current.get(topic);
        if (existingUnsub) existingUnsub();

        const sub = clientRef.current.subscribe(topic, (msg: IMessage) => {
          // Đọc handler mới nhất tại thời điểm nhận message (closure-safe)
          const currentHandler = pendingSubscriptionsRef.current.get(topic);
          if (currentHandler) currentHandler(JSON.parse(msg.body));
        });

        const unsub = () => {
          sub.unsubscribe();
          activeSubscriptionsRef.current.delete(topic);
          // Xóa pending vì subscription này đã active và bây giờ bị hủy chủ động
          pendingSubscriptionsRef.current.delete(topic);
        };
        activeSubscriptionsRef.current.set(topic, unsub);
        return unsub;
      }

      // Chưa connected: handler đã lưu vào pending, onConnect sẽ flush
      // cleanup chỉ xóa pending — KHÔNG chạm activeSubscriptionsRef
      // (phòng trường hợp onConnect đã chạy xong và tạo active sub rồi)
      return () => {
        // Chỉ xóa pending nếu handler vẫn là handler này (không bị overwrite)
        if (pendingSubscriptionsRef.current.get(topic) === handler) {
          pendingSubscriptionsRef.current.delete(topic);
        }
        // Nếu active sub đã được tạo bởi onConnect, hủy nó luôn
        const activeUnsub = activeSubscriptionsRef.current.get(topic);
        if (activeUnsub) {
          activeUnsub();
        }
      };
    },
    [],
  );

  const publishMessage = useCallback((destination: string, body: object) => {
    if (!clientRef.current?.connected) {
      console.warn("⚠️ [WebSocket] Not connected, cannot publish to", destination);
      return;
    }
    clientRef.current.publish({ destination, body: JSON.stringify(body) });
  }, []);

  const connect = useCallback(() => {
    if (!user || clientRef.current?.connected) return;

    const token = getAccessToken();
    if (!token) {
      console.error("❌ [WebSocket] No access token");
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080";
    const wsEndpoint = `${wsUrl}/api/v1/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ [WebSocket] Connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // ── Chat messages ────────────────────
        client.subscribe("/user/queue/messages", (message: IMessage) => {
          const incoming: IncomingMessage = JSON.parse(message.body);
          messageHandlersRef.current.forEach((h) => h(incoming));
        });

        const handleNewNotif = (raw: any) => {
          if (raw.type === "UNREAD_BADGE") {
            const count = raw.data?.unreadCount;
            if (typeof count === "number") setUnreadCount(count);
            return;
          }

          if (raw.type === "NOTIFICATION") {
            const notification = mapRawNotification(raw);
            if (!notification.notificationId) return;

            let isNew = false;
            setNotifications((prev) => {
              const exists = prev.some(
                (n) => n.notificationId === notification.notificationId,
              );
              if (exists) return prev;
              isNew = true;
              return [notification, ...prev.slice(0, 19)];
            });

            if (isNew && !notification.read) {
              setUnreadCount((prev) => prev + 1);
            }
            if (isNew) emitNewNotification(notification);
          }
        };

        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body));
        });
        client.subscribe("/topic/notifications", (message: IMessage) => {
          handleNewNotif(JSON.parse(message.body));
        });

        // ── Unread count (legacy) ────────────
        client.subscribe("/user/queue/unread-count", (message: IMessage) => {
          const count = parseInt(message.body, 10);
          if (!isNaN(count)) setUnreadCount(count);
        });

        // ── Single read ──────────────────────
        client.subscribe("/user/queue/notification-read", (message: IMessage) => {
          let readId: string;
          try {
            const parsed = JSON.parse(message.body);
            readId = parsed.notificationId ?? parsed.id ?? parsed;
          } catch {
            readId = message.body.replace(/"/g, "");
          }
          setNotifications((prev) =>
            prev.map((n) =>
              n.notificationId === readId
                ? { ...n, read: true, readAt: n.readAt ?? new Date().toISOString() }
                : n,
            ),
          );
        });

        // ── All read ─────────────────────────
        client.subscribe("/user/queue/all-read", () => {
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              read: true,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
          );
          setUnreadCount(0);
          emitAllRead();
        });

        // ── Notification deleted ──────────────
        client.subscribe("/user/queue/notification-deleted", (message: IMessage) => {
          const deletedId = message.body.replace(/"/g, "");
          setNotifications((prev) => {
            const deleted = prev.find((n) => n.notificationId === deletedId);
            if (deleted && !deleted.read) setUnreadCount((c) => Math.max(0, c - 1));
            return prev.filter((n) => n.notificationId !== deletedId);
          });
          emitNotificationDeleted(deletedId);
        });

        // ── Flush pending topics (dynamic subscriptions từ các component) ─
        // Chạy sau tất cả system subscriptions, guard has() để tránh duplicate.
        pendingSubscriptionsRef.current.forEach((_, topic) => {
          if (activeSubscriptionsRef.current.has(topic)) return;

          const sub = client.subscribe(topic, (msg: IMessage) => {
            const currentHandler = pendingSubscriptionsRef.current.get(topic);
            if (currentHandler) currentHandler(JSON.parse(msg.body));
          });
          activeSubscriptionsRef.current.set(topic, () => {
            sub.unsubscribe();
            activeSubscriptionsRef.current.delete(topic);
          });
        });

        loadInitialNotifications();
      },

      onStompError: (frame) => {
        console.error("❌ [STOMP] error:", frame.headers["message"], frame.body);
        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("❌ [WebSocket] error:", error);
        setIsConnected(false);
      },

      onDisconnect: () => {
        console.log("🔌 [WebSocket] Disconnected");
        setIsConnected(false);
        // Xóa active subs (STOMP subs đã invalid) nhưng GIỮ pending
        // để onConnect có thể restore khi reconnect thành công.
        activeSubscriptionsRef.current.clear();

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30_000,
          );
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current();
          }, delay);
        } else {
          console.error("❌ [WebSocket] Max reconnect attempts reached");
        }
      },
    });

    client.activate();
    clientRef.current = client;
  }, [user, emitNewNotification, emitAllRead, emitNotificationDeleted, loadInitialNotifications]);

  useEffect(() => { connectRef.current = connect; }, [connect]);

  const subscribeToMessages = useCallback(
    (handler: (msg: IncomingMessage) => void) => {
      messageHandlersRef.current.add(handler);
      return () => { messageHandlersRef.current.delete(handler); };
    }, [],
  );

  const sendMessageWs = useCallback(
    (conversationId: string, content: string, type = "TEXT") => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ [WebSocket] Not connected");
        return;
      }
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ conversationId, content, type }),
      });
    }, [],
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
    setNotifications([]);
    setUnreadCount(0);
    reconnectAttemptsRef.current = 0;
    pendingSubscriptionsRef.current.clear();
    activeSubscriptionsRef.current.clear();
  }, []);

  useEffect(() => {
    if (user) {
      loadInitialNotifications();
      connectRef.current();
      return () => { disconnect(); };
    } else {
      disconnect();
    }
  }, [user, loadInitialNotifications, disconnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && !isConnected) {
        connectRef.current();
        loadInitialNotifications();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, isConnected, loadInitialNotifications]);

  useEffect(() => {
    const handleTokenChange = () => {
      if (user && clientRef.current?.connected) {
        disconnect();
        setTimeout(() => connectRef.current(), 1_000);
      }
    };
    window.addEventListener("tokenChanged", handleTokenChange);
    return () => window.removeEventListener("tokenChanged", handleTokenChange);
  }, [user, disconnect]);

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
    markAsRead,
    markAllAsRead,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}