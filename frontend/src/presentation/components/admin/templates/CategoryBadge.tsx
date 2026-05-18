// src/presentation/components/admin/templates/CategoryBadge.tsx

export function CategoryBadge({ category }: { category: string | null }) {
  const map: Record<string, string> = {
    professional: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    creative: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    simple: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };
  
  if (!category) return <span className="text-[16px] text-gray-400">—</span>;
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[16px] font-medium ring-1 ring-inset ${map[category] ?? "bg-gray-100 text-gray-600"}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}