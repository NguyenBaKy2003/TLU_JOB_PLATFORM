// src/presentation/components/admin/subscription/PlanTableSkeleton.tsx
export function PlanTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50">
          {[100, 80, 60, 60, 60, 60, 40, 40, 40].map((w, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}