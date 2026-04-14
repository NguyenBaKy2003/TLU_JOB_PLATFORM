// src/presentation/components/applications/StatusDropdown.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS } from "@/domain/models/Application";

/**
 * Các bước chuyển trạng thái hợp lệ — đồng bộ với TRANSITIONS trong backend:
 * SUBMITTED           → REVIEWING | REJECTED
 * REVIEWING           → SHORTLISTED | REJECTED
 * SHORTLISTED         → INTERVIEW_SCHEDULED | REJECTED
 * INTERVIEW_SCHEDULED → INTERVIEWED | REJECTED
 * INTERVIEWED         → OFFERED | REJECTED
 * OFFERED             → ACCEPTED | DECLINED
 * ACCEPTED            → HIRED
 */
const NEXT_STATUS_MAP: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  SUBMITTED:           ["REVIEWING",           "REJECTED"],
  REVIEWING:           ["SHORTLISTED",         "REJECTED"],
  SHORTLISTED:         ["INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["INTERVIEWED",         "REJECTED"],
  INTERVIEWED:         ["OFFERED",             "REJECTED"],
  OFFERED:             ["ACCEPTED",            "DECLINED"],
  ACCEPTED:            ["HIRED"],
};

export function StatusDropdown({
  current,
  onChange,
}: {
  current:  ApplicationStatus;
  onChange: (s: ApplicationStatus, note?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = NEXT_STATUS_MAP[current] ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Trạng thái terminal — không có bước tiếp theo
  if (options.length === 0) return null;

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
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border
          border-gray-100 shadow-lg py-1 z-20">
          {options.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700
                hover:bg-gray-50 text-left transition-colors"
            >
              {APPLICATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}