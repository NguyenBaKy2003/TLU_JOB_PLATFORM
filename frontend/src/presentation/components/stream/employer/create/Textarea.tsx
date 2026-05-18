// components/stream/employer/create/Textarea.tsx
import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-[16px] text-slate-800 placeholder:text-slate-300 outline-none transition-all
        focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 resize-none
        ${error
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-slate-300"
        }
        ${className}
      `}
    />
  );
}