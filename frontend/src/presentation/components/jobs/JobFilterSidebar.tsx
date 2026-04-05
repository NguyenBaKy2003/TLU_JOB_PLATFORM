// src/presentation/components/jobs/JobFilterSidebar.tsx
"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { JobType, JobLevel } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from "@/domain/models/Job";

export interface JobFilters {
  jobTypes:      JobType[];
  levels:        JobLevel[];
  minSalary:     string;
  maxSalary:     string;
  workLocType:   string;
  postedWithin:  string;  // "1d" | "3d" | "7d" | "30d" | ""
}

export const EMPTY_FILTERS: JobFilters = {
  jobTypes: [], levels: [], minSalary: "", maxSalary: "",
  workLocType: "", postedWithin: "",
};

interface Props {
  filters:  JobFilters;
  onChange: (f: JobFilters) => void;
}

// ── Accordion section ──────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open ? <ChevronUp size={15} className="text-gray-400" />
               : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

// ── Checkbox row ───────────────────────────────────────────────────────────────

function CheckRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          ${checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-gray-400"}`}>
        {checked && (
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function JobFilterSidebar({ filters, onChange }: Props) {

  const toggleJobType = (t: JobType) => {
    const next = filters.jobTypes.includes(t)
      ? filters.jobTypes.filter(x => x !== t)
      : [...filters.jobTypes, t];
    onChange({ ...filters, jobTypes: next });
  };

  const toggleLevel = (l: JobLevel) => {
    const next = filters.levels.includes(l)
      ? filters.levels.filter(x => x !== l)
      : [...filters.levels, l];
    onChange({ ...filters, levels: next });
  };

  const hasActive =
    filters.jobTypes.length > 0 || filters.levels.length > 0 ||
    filters.minSalary || filters.maxSalary ||
    filters.workLocType || filters.postedWithin;

  return (
    <aside className="w-52 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Tất cả bộ lọc</h3>
        {hasActive && (
          <button onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs text-red-500 hover:underline flex items-center gap-1">
            <X size={11} /> Xoá tất cả
          </button>
        )}
      </div>

      {/* Active tags */}
      {hasActive && (
        <div className="mb-4">
          <p className="text-[11px] text-gray-400 mb-2">Bộ lọc đang chọn</p>
          <div className="flex flex-wrap gap-1.5">
            {filters.jobTypes.map(t => (
              <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-xs
                text-gray-700 bg-gray-100 rounded-full">
                {JOB_TYPE_LABELS[t]}
                <button onClick={() => toggleJobType(t)} className="text-gray-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            ))}
            {filters.levels.map(l => (
              <span key={l} className="flex items-center gap-1 px-2.5 py-1 text-xs
                text-gray-700 bg-gray-100 rounded-full">
                {JOB_LEVEL_LABELS[l]}
                <button onClick={() => toggleLevel(l)} className="text-gray-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ngày đăng */}
      <Section title="Ngày đăng tuyển">
        {[
          { value: "1d",  label: "Hôm nay"       },
          { value: "3d",  label: "3 ngày gần đây" },
          { value: "7d",  label: "Tuần này"       },
          { value: "30d", label: "Tháng này"      },
        ].map(o => (
          <CheckRow key={o.value} label={o.label}
            checked={filters.postedWithin === o.value}
            onChange={() => onChange({ ...filters, postedWithin: filters.postedWithin === o.value ? "" : o.value })} />
        ))}
      </Section>

      {/* Hình thức */}
      <Section title="Hình thức làm việc">
        {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map(t => (
          <CheckRow key={t} label={JOB_TYPE_LABELS[t]}
            checked={filters.jobTypes.includes(t)}
            onChange={() => toggleJobType(t)} />
        ))}
      </Section>

      {/* Cấp bậc */}
      <Section title="Cấp bậc" defaultOpen={false}>
        {(Object.keys(JOB_LEVEL_LABELS) as JobLevel[]).map(l => (
          <CheckRow key={l} label={JOB_LEVEL_LABELS[l]}
            checked={filters.levels.includes(l)}
            onChange={() => toggleLevel(l)} />
        ))}
      </Section>

      {/* Địa điểm */}
      <Section title="Địa điểm" defaultOpen={false}>
        {[
          { value: "ONSITE", label: "Tại văn phòng" },
          { value: "REMOTE", label: "Làm việc từ xa" },
          { value: "HYBRID", label: "Kết hợp"        },
        ].map(o => (
          <CheckRow key={o.value} label={o.label}
            checked={filters.workLocType === o.value}
            onChange={() => onChange({ ...filters, workLocType: filters.workLocType === o.value ? "" : o.value })} />
        ))}
      </Section>

      {/* Mức lương */}
      <Section title="Mức lương (Hàng tháng)" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input type="number" value={filters.minSalary} min={0}
              onChange={e => onChange({ ...filters, minSalary: e.target.value })}
              placeholder="Tối thiểu"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                placeholder:text-gray-300" />
          </div>
          <div className="relative">
            <input type="number" value={filters.maxSalary} min={0}
              onChange={e => onChange({ ...filters, maxSalary: e.target.value })}
              placeholder="Tối đa"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                placeholder:text-gray-300" />
          </div>
        </div>
      </Section>
    </aside>
  );
}