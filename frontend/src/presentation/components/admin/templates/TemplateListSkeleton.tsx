// src/presentation/components/admin/templates/TemplateListSkeleton.tsx

export function TemplateListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      ))}
    </div>
  );
}