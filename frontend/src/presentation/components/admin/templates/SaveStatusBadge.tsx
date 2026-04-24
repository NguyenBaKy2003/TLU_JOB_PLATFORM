// src/presentation/components/admin/templates/SaveStatusBadge.tsx

interface SaveStatusBadgeProps {
  savedAt: Date | null;
}

export function SaveStatusBadge({ savedAt }: SaveStatusBadgeProps) {
  if (!savedAt) return null;

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Đã lưu {savedAt.toLocaleTimeString("vi-VN")}
    </span>
  );
}