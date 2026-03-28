// src/presentation/components/companies/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  current:  number;
  total:    number;
  onChange: (p: number) => void;
}

export function Pagination({ current, total, onChange }: Props) {
  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (current > 4) pages.push("...");
    if (current > 3 && current < total - 2) pages.push(current);
    if (current < total - 3) pages.push("...");
    pages.push(total - 1, total);
  }

  const btn = (label: React.ReactNode, page: number, active = false, disabled = false) => (
    <button
      key={String(page) + String(label)}
      onClick={() => !disabled && onChange(page)}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
        ${active
          ? "bg-blue-600 text-white"
          : disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      {btn(<ChevronLeft size={16} />, current - 1, false, current === 1)}
      {pages.map((p, i) =>
        p === "..."
          ? <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
          : btn(p, p as number, p === current)
      )}
      {btn(<ChevronRight size={16} />, current + 1, false, current === total)}
    </div>
  );
}