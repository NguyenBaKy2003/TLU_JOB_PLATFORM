// src/presentation/components/notifications/NotificationBadge.tsx
import type { NotificationType } from "@/domain/models/Notification"
import { TYPE_META } from "@/domain/models/Notification"

interface Props {
  type: NotificationType
}

export function NotificationBadge({ type }: Props) {
  const meta = TYPE_META[type] ?? TYPE_META.SYSTEM
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium
      rounded-full border ${meta.color} ${meta.bg}`}>
      {meta.label}
    </span>
  )
}