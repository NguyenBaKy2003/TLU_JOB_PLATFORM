// components/stream/employer/create/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all
        focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400
        ${error
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-slate-300"
        }
        ${className}
      `}
    />
  );
}