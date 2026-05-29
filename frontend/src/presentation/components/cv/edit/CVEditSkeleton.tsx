"use client";

function Bone({ className }: { className?: string }) {
  return (
    <div className={`bg-slate-200 rounded-lg animate-pulse ${className ?? ""}`} />
  );
}

export function CVEditSkeleton() {
  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <div className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-3">
          <Bone className="w-8 h-8 rounded-lg" />
          <Bone className="w-36 h-4 rounded-lg" />
          <Bone className="w-16 h-5 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="hidden sm:block w-20 h-7 rounded-lg" />
          <Bone className="w-8 h-8 rounded-lg" />
          <Bone className="w-8 h-8 rounded-lg" />
          <Bone className="hidden sm:block w-24 h-8 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-slate-200 flex-col p-2.5 gap-1.5">
          <Bone className="h-3 w-20 mb-3 rounded" />
          <Bone className="h-10 w-full rounded-xl" />
          <Bone className="h-3 w-16 mt-3 mb-1 rounded" />
          {[...Array(5)].map((_, i) => (
            <Bone key={i} className={`h-9 w-full rounded-xl ${i > 2 ? "opacity-50" : ""}`} />
          ))}
        </div>

        {/* Editor skeleton */}
        <div className="flex-1 p-3 md:p-4">
          <div className="h-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bone className="w-4 h-4 rounded" />
                <Bone className="w-32 h-4 rounded" />
              </div>
              <Bone className="w-24 h-4 rounded" />
            </div>

            {/* Avatar preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Bone className="w-11 h-11 rounded-full" />
              <div className="space-y-2">
                <Bone className="w-24 h-3 rounded" />
                <Bone className="w-36 h-3 rounded" />
              </div>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={i < 2 || i === 4 || i === 5 ? "col-span-2" : ""}>
                  <Bone className="h-3 w-20 mb-2 rounded" />
                  <Bone className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav skeleton */}
      <div className="md:hidden h-12 bg-white border-t border-slate-200 flex">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center gap-1">
            <Bone className="w-5 h-5 rounded" />
            <Bone className="w-10 h-2.5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}