import api from "@/lib/axios";
import type {
  NotificationApiType,
  NotificationItem,
  NotificationResult,
} from "@/domain/models/Notification";

export class NotificationRepository {

  // ─── Normalize raw API response → NotificationItem ────────────────────────
  // Đây là source of truth duy nhất cho việc map field từ backend.
  // Backend REST trả về field "read" (boolean) và "id" (không phải notificationId).
  private map(raw: any): NotificationItem {
    return {
      // FIX: Backend REST trả "id", WS có thể trả "notificationId" — handle cả hai
      notificationId: raw.id ?? raw.notificationId ?? "",
      type:           raw.type as NotificationApiType,
      title:          raw.title ?? "",
      // FIX: Dùng "body" đúng với NotificationItem — không dùng "message"
      body:           raw.body ?? "",
      link:           raw.link ?? null,
      // FIX: Backend REST dùng "read" (boolean), không phải "isRead"
      read:           raw.read === true,
      readAt:         raw.readAt ?? null,
      createdAt:      raw.createdAt ?? "",
    };
  }

  // ─── List paginated ────────────────────────────────────────────────────────
  async list(page = 0, size = 20): Promise<NotificationResult> {
    const res  = await api.get("/notifications", { params: { page, size } });
    const data = res.data.data; // { notifications: [], unreadCount: N }
    const raw: any[] = data?.notifications ?? [];

    return {
      notifications: raw.map(n => this.map(n)),
      unreadCount:   data?.unreadCount ?? 0,
    };
  }

  // ─── Recent (dùng cho header bell dropdown) ────────────────────────────────
  async recent(): Promise<NotificationItem[]> {
    const res     = await api.get("/notifications/recent");
    const raw: any[] = res.data.data ?? [];
    return raw.map(n => this.map(n));
  }

  // ─── Unread count ──────────────────────────────────────────────────────────
  async unreadCount(): Promise<number> {
    const res = await api.get("/notifications/unread-count");
    return res.data.data?.unreadCount ?? 0;
  }

  // ─── Mark one read ─────────────────────────────────────────────────────────
  async markOneRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  // ─── Mark all read ─────────────────────────────────────────────────────────
  // Returns số lượng đã được đánh dấu (từ backend)
  async markAllRead(): Promise<number> {
    const res = await api.patch("/notifications/read-all");
    return res.data.data as number;
  }
}