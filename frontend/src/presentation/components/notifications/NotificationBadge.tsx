import type { NotificationApiType } from "@/domain/models/Notification"
import { TYPE_META } from "@/domain/models/Notification"

export function NotificationBadge({ type }: { type: NotificationApiType }) {
  const meta = TYPE_META[type] ?? TYPE_META.SYSTEM_ANNOUNCEMENT
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium
      rounded-full border ${meta.color} ${meta.bg}`}>
      {meta.label}
    </span>
  )
}