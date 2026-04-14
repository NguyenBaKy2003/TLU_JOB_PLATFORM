import api from "@/lib/axios";
import type { NotificationApiType, NotificationItem, NotificationResult } from "@/domain/models/Notification";

export class NotificationRepository {

  private map(raw: any): NotificationItem {
    return {
      notificationId: raw.id,
      type:           raw.type           as NotificationApiType,
      title:          raw.title          ?? "",
      body:           raw.body           ?? "",   // field từ backend
      link:           raw.link           ?? null,
      isRead:         raw.read           === true, // backend field: "read"
      readAt:         raw.readAt         ?? null,
      createdAt:      raw.createdAt,
    };
  }

  async list(page = 0, size = 20): Promise<NotificationResult> {
    const res  = await api.get("/notifications", { params: { page, size } });
    const data = res.data.data; // { notifications: [], unreadCount: N }
    const raw: any[] = data.notifications ?? [];

    return {
      notifications: raw.map(n => this.map(n)),
      unreadCount:   data.unreadCount ?? 0,
    };
  }

  async markOneRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  async markAllRead(): Promise<number> {
    const res = await api.patch("/notifications/read-all");
    return res.data.data as number;
  }
}