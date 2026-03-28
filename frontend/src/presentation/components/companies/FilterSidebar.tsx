// src/presentation/components/companies/FilterSidebar.tsx
"use client";
import { useState }             from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { BENEFIT_OPTIONS, SIZE_OPTIONS } from "./mockData";
import type { CompanyFilters }  from "./types";

interface Props {
  filters:   CompanyFilters;
  onChange:  (f: CompanyFilters) => void;
  activeTagsDisplay: { label: string; key: string }[];
  onRemoveTag: (key: string) => void;
}

function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-3 group">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open
          ? <ChevronUp size={15} className="text-gray-400" />
          : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

export function FilterSidebar({ filters, onChange, activeTagsDisplay, onRemoveTag }: Props) {
  const toggleBenefit = (b: string) => {
    const next = filters.benefits.includes(b)
      ? filters.benefits.filter(x => x !== b)
      : [...filters.benefits, b];
    onChange({ ...filters, benefits: next });
  };

  return (
    <aside className="w-56 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Tất cả bộ lọc</h3>
      </div>

      {/* Active tags */}
      {activeTagsDisplay.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Bộ lọc đang dùng</p>
          <div className="flex flex-wrap gap-2">
            {activeTagsDisplay.map(tag => (
              <span key={tag.key}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-700
                  bg-gray-100 rounded-full">
                {tag.label}
                <button onClick={() => onRemoveTag(tag.key)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      <FilterSection title="Phúc lợi hấp dẫn">
        <div className="flex flex-col gap-2.5">
          {BENEFIT_OPTIONS.map(b => (
            <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleBenefit(b)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                  ${filters.benefits.includes(b)
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 group-hover:border-gray-400"}`}>
                {filters.benefits.includes(b) && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">{b}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Giới tính">
        <div className="flex flex-col gap-2.5">
          {["Nam", "Nữ", "Khác"].map(g => (
            <label key={g} className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onChange({ ...filters, gender: filters.gender === g ? "" : g })}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${filters.gender === g ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                {filters.gender === g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">{g}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Company size */}
      <FilterSection title="Quy mô công ty">
        <div className="flex flex-col gap-2.5">
          {SIZE_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onChange({ ...filters, companySize: filters.companySize === value ? "" : value })}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${filters.companySize === value ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                {filters.companySize === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}