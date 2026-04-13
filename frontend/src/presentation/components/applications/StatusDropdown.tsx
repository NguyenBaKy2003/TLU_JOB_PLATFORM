// src/presentation/components/applications/StatusDropdown.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS } from "@/domain/models/Application";

const EMPLOYER_STATUS_OPTIONS: ApplicationStatus[] = [
  "REVIEWING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_DONE",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
];

export function StatusDropdown({
  current,
  onChange,
}: {
  current: ApplicationStatus;
  onChange: (s: ApplicationStatus, note?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700
          bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        Cập nhật trạng thái <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border
          border-gray-100 shadow-lg py-1 z-20"
        >
          {EMPLOYER_STATUS_OPTIONS.filter((s) => s !== current).map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700
                hover:bg-gray-50 text-left"
            >
              {APPLICATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}