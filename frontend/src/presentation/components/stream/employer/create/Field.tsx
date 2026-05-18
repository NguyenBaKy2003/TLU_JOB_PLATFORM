// components/stream/employer/create/Field.tsx
import React from "react";
import { Info } from "lucide-react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[16px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}