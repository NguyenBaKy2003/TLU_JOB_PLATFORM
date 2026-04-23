"use client";

function Bone({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`} />;
}

export function CVPublicViewSkeleton() {
  return (
    <div className="min-h-screen bg-[#F0EEE9]">
      {/* Action bar */}
      <div className="bg-white border-b border-gray-100 h-12" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header skeleton */}
          <div className="bg-[#3D5A80]/10 px-8 py-10">
            <div className="flex items-start gap-6">
              <Bone className="w-20 h-20 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Bone className="h-7 w-52" />
                <Bone className="h-4 w-72" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Bone className="h-4 w-40" />
                  <Bone className="h-4 w-32" />
                  <Bone className="h-4 w-36" />
                  <Bone className="h-4 w-44" />
                </div>
              </div>
            </div>
          </div>

          {/* Sections skeleton */}
          <div className="px-8 py-8 space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Bone className="w-6 h-6 rounded-lg flex-shrink-0" />
                  <Bone className="h-3 w-32" />
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-5/6" />
                <Bone className="h-3.5 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}