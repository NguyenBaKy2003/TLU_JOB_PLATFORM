// components/stream/common/ViewerCount.tsx
"use client";

import React from "react";
import { Eye } from "lucide-react";

interface ViewerCountProps {
  count: number;
  variant?: "light" | "dark";
}

export function ViewerCount({ count, variant = "dark" }: ViewerCountProps) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl text-[13px] font-semibold font-mono
      ${variant === "light" 
        ? "bg-black/40 border border-white/15 text-white" 
        : "bg-white/5 border border-white/10 text-slate-200"
      }
    `}>
      <Eye className="w-3.5 h-3.5" />
      {count.toLocaleString()}
    </div>
  );
}