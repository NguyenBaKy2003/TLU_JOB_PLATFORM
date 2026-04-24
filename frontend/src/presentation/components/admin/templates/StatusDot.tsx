// src/presentation/components/admin/templates/StatusDot.tsx

export function StatusDot({ active, showLabel = true }: { active: boolean; showLabel?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${active ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
      {showLabel && (active ? "Active" : "Inactive")}
    </span>
  );
}