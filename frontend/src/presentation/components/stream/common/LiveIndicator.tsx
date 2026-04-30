// components/stream/common/LiveIndicator.tsx
import React from "react";

interface LiveIndicatorProps {
  className?: string;
  size?: "sm" | "md";
}

export function LiveIndicator({ className = "", size = "sm" }: LiveIndicatorProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 bg-red-500 text-white font-bold rounded-2xl ${size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[13px]"} ${className}`}>
      <span className={`rounded-full bg-white ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
      LIVE
    </div>
  );
}