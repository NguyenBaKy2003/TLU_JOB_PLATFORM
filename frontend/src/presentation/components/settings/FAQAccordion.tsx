// src/presentation/components/settings/FAQAccordion.tsx
"use client";
import { useState }                   from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle size={15} className="text-gray-500" />
        </div>
        <p className="flex-1 text-sm font-medium text-gray-800 leading-snug">{question}</p>
        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pl-[3.75rem]">
          <p className="text-xs text-gray-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}