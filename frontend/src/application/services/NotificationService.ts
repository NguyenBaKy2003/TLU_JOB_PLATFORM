// src/application/services/NotificationService.ts
import type { NotificationItem, NotificationResult } from "@/domain/models/Notification"
import type { NotificationRepository } from "@/infrastructure/repositories/NotificationRepository"

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async list(page = 0, size = 20): Promise<NotificationResult> {
    return this.repo.list(page, size)
  }

  async markOneRead(id: string): Promise<void> {
    return this.repo.markOneRead(id)
  }

  async markAllRead(): Promise<number> {
    return this.repo.markAllRead()
  }

  /** Filter theo type tab */
  filterByTab(
    items: NotificationItem[],
    tab: "ALL" | "MESSAGE" | "NEW_JOB" | "APPLY_RESULT",
  ): NotificationItem[] {
    if (tab === "ALL") return items
    return items.filter(n => n.type === tab)
  }
}