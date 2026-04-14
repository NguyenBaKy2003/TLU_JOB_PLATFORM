import type {
  NotificationItem, NotificationResult,
  NotificationTab, 
} from "@/domain/models/Notification"
import { typeToTab } from "@/domain/models/Notification"
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

  filterByTab(items: NotificationItem[], tab: NotificationTab): NotificationItem[] {
    if (tab === "ALL") return items
    return items.filter(n => typeToTab(n.type) === tab)
  }
}