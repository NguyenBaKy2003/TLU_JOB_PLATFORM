"use client";

import React, { useState } from "react";
import { Target, X, Plus, Info } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

interface JobExpectation {
  industry?: string;
  minSalary?: string;
  contractTypes: string[];
  levels: string[];
}

interface JobExpectationsSectionProps {
  value?: JobExpectation;
  onChange?: (val: JobExpectation) => void;
}

const CONTRACT_TYPES = ["Full-time", "Part-time", "Từ xa", "Thực tập sinh"];
const LEVELS = ["Mới đi làm", "Chuyên viên", "Quản lý", "Quản lý cấp cao"];
const DEFAULT: JobExpectation = { industry: "", minSalary: "", contractTypes: [], levels: [] };

function FloatingInput({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
      </div>
      {hint && (
        <p className="flex items-center gap-1 text-[11px] text-gray-400 px-1">
          <Info size={11} /> {hint}
        </p>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <span onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-blue-400"
        }`}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-gray-700" onClick={onChange}>{label}</span>
    </label>
  );
}

export function JobExpectationsSection({ value = DEFAULT, onChange }: JobExpectationsSectionProps) {
  const [form, setForm] = useState<JobExpectation>(value);

  const update = (patch: Partial<JobExpectation>) => {
    const next = { ...form, ...patch };
    setForm(next);
    onChange?.(next);
  };

  const toggle = (key: "contractTypes" | "levels", item: string) => {
    const list = form[key];
    update({ [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item] });
  };

  const removeTag = (tag: string) => {
    if (form.contractTypes.includes(tag)) toggle("contractTypes", tag);
    else toggle("levels", tag);
  };

  const selectedTags = [...form.contractTypes, ...form.levels];

  return (
    <SectionCard title="Kỳ vọng công việc" icon={<Target size={16} />} isEmpty={false}>
      <div className="space-y-4">
        {/* Industry */}
        <FloatingInput label="Ngành nghề" value={form.industry ?? ""}
          onChange={(v) => update({ industry: v })} />

        {/* Salary */}
        <FloatingInput label="Mức lương tối thiểu" value={form.minSalary ?? ""}
          onChange={(v) => update({ minSalary: v })} placeholder="Input"
          hint="Mức lương tính theo VND / Tháng" />

        {/* Salary + industry tag */}
        {form.minSalary && (
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
              {form.industry || "Ngành"}/{form.minSalary} triệu
              <button onClick={() => update({ minSalary: "" })}>
                <X size={11} className="text-gray-400 hover:text-red-500" />
              </button>
            </span>
          </div>
        )}

        {/* Checkboxes side by side */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0">
          {/* Contract types */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-gray-700">Hình thức hợp đồng</p>
            {CONTRACT_TYPES.map((ct) => (
              <Checkbox key={ct} label={ct} checked={form.contractTypes.includes(ct)}
                onChange={() => toggle("contractTypes", ct)} />
            ))}
          </div>

          {/* Levels */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-gray-700">Cấp bậc mong muốn</p>
            {LEVELS.map((lv) => (
              <Checkbox key={lv} label={lv} checked={form.levels.includes(lv)}
                onChange={() => toggle("levels", lv)} />
            ))}
          </div>
        </div>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {selectedTags.map((tag) => (
              <span key={tag}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X size={11} className="text-gray-400 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add other */}
        <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          <Plus size={15} /> Add other
        </button>
      </div>
    </SectionCard>
  );
}