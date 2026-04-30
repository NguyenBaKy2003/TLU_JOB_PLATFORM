// components/stream/employer/InfoRow.tsx
import React from "react";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  border?: boolean;
}

export function InfoRow({ icon: Icon, label, value, border = true }: InfoRowProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${border ? "border-b border-slate-50" : ""}`}>
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-700">{value}</div>
      </div>
    </div>
  );
}