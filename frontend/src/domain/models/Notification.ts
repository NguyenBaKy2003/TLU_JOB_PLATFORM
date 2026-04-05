// src/domain/models/Notification.ts

export type NotificationType = "MESSAGE" | "NEW_JOB" | "APPLY_RESULT" | "SYSTEM"

export interface NotificationItem {
  notificationId: string
  title: string
  message: string
  type: NotificationType
  entityType: string | null
  entityId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  isStarred?: boolean // client-side only
}

export interface NotificationResult {
  notifications: NotificationItem[]
  unreadCount: number
}

// Map type → label hiển thị & màu badge
export const TYPE_META: Record<NotificationType, { label: string; color: string; bg: string }> = {
  MESSAGE:      { label: "Tin nhắn",          color: "text-pink-600",  bg: "bg-pink-50 border-pink-200" },
  NEW_JOB:      { label: "Việc làm mới",      color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  APPLY_RESULT: { label: "Kết quả ứng tuyển", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  SYSTEM:       { label: "Hệ thống",          color: "text-gray-600",  bg: "bg-gray-50 border-gray-200" },
}