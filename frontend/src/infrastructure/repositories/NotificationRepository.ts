// src/infrastructure/repositories/NotificationRepository.ts
import api from "@/lib/axios"
import type { NotificationResult } from "@/domain/models/Notification"

export class NotificationRepository {
  async list(page = 0, size = 20): Promise<NotificationResult> {
    const res = await api.get("/notifications", { params: { page, size } })
    return res.data.data as NotificationResult
  }

  async markOneRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  }

  async markAllRead(): Promise<number> {
    const res = await api.patch("/notifications/read-all")
    return res.data.data as number
  }
}