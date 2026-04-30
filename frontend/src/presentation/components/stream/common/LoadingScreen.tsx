// components/stream/common/LoadingScreen.tsx
import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Đang tải..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}