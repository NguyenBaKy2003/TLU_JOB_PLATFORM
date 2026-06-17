"use client";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`!bg-[#DFEAFE] rounded-lg animate-pulse ${className ?? ""}`} />
  );
}

function CVCardSkeleton() {
  return (
    // Thẻ CV nền trắng, viền xanh cực nhạt và bóng đổ nhẹ
    <div className="bg-white rounded-xl border border-white/50 shadow-sm overflow-hidden">
      {/* Thumbnail */}
      <SkeletonBox className="w-full aspect-[3/4] rounded-none rounded-t-xl opacity-70" />
      
      {/* Body */}
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBox className="h-4 w-14 rounded-full" />
          <SkeletonBox className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex justify-between pt-2 border-t border-blue-50/50">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CVPageSkeleton() {
  return (
    // Nền DFEAFE như bạn yêu cầu
    <div className="min-h-screen bg-[#DFEAFE]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-3">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-10 w-48" />
            <SkeletonBox className="h-4 w-72" />
          </div>
          {/* Nút Tạo CV mới */}
          <SkeletonBox className="h-11 w-36 rounded-xl bg-[#04389E]/20" /> 
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CVCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}