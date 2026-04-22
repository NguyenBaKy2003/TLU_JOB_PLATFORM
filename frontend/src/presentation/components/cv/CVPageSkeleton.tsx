"use client";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`} />
  );
}

function CVCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Thumbnail */}
      <SkeletonBox className="w-full aspect-[3/4] rounded-none rounded-t-xl" />
      {/* Body */}
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBox className="h-4 w-14 rounded-full" />
          <SkeletonBox className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CVPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <SkeletonBox className="h-3 w-28" />
            <SkeletonBox className="h-9 w-40" />
            <SkeletonBox className="h-3 w-64" />
          </div>
          <SkeletonBox className="h-10 w-32 rounded-xl" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CVCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}