export function PaymentTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="w-14 h-7 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}