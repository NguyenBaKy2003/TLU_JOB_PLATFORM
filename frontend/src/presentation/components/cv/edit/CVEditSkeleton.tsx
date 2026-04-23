"use client";

function Bone({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`} />;
}

export function CVEditSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-[#F0EEE9] overflow-hidden">
      {/* Top bar */}
      <div className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Bone className="w-7 h-7 rounded-lg" />
          <Bone className="w-40 h-4" />
          <Bone className="w-14 h-4 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="w-20 h-7 rounded-lg" />
          <Bone className="w-20 h-7 rounded-lg" />
          <Bone className="w-20 h-7 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 p-3 space-y-2">
          <Bone className="h-3 w-24 mb-4" />
          <Bone className="h-10 w-full rounded-xl" />
          <Bone className="h-3 w-20 mt-4 mb-2" />
          {[...Array(5)].map((_, i) => (
            <Bone key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>

        {/* Editor skeleton */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <Bone className="h-4 w-32" />
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Bone className="h-10 rounded-xl" />
              <Bone className="h-10 rounded-xl" />
            </div>
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}