"use client";

import React, { useState } from "react";
import { Target, X, Plus } from "lucide-react";
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

const CONTRACT_TYPES = ["Full time", "Part time", "Từ xa", "Thực tập sinh"];
const LEVELS         = ["Mới đi làm", "Chuyên viên", "Quản lý", "Quản lý cấp cao"];
const INDUSTRY_OPTS  = ["Developer", "Designer", "Marketing", "Data", "Product", "Sales"];

const TAG_COLORS: Record<string, string> = {
  "Full time":    "bg-blue-50 text-blue-700 border-blue-200",
  "Part time":    "bg-green-50 text-green-700 border-green-200",
  "Từ xa":        "bg-purple-50 text-purple-700 border-purple-200",
  "Thực tập sinh":"bg-orange-50 text-orange-700 border-orange-200",
  "Mới đi làm":  "bg-gray-50 text-gray-700 border-gray-200",
  "Chuyên viên":  "bg-teal-50 text-teal-700 border-teal-200",
  "Quản lý":      "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Quản lý cấp cao":"bg-pink-50 text-pink-700 border-pink-200",
};

const DEFAULT: JobExpectation = { industry: "", minSalary: "", contractTypes: [], levels: [] };

export function JobExpectationsSection({ value = DEFAULT, onChange }: JobExpectationsSectionProps) {
  const [form, setForm] = useState<JobExpectation>(value);
  const [customIndustry, setCustomIndustry] = useState("");

  const update = (patch: Partial<JobExpectation>) => {
    const next = { ...form, ...patch };
    setForm(next);
    onChange?.(next);
  };

  const toggleList = (key: "contractTypes" | "levels", item: string) => {
    const list = form[key];
    const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
    update({ [key]: next });
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-300";

  return (
    <SectionCard title="Kỳ vọng công việc" icon={<Target size={16} />} isEmpty={false}>
      <div className="space-y-4">
        {/* Industry */}
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">Ngành nghề</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.industry}
              onChange={(e) => update({ industry: e.target.value })}
              placeholder="VD: Developer, Designer..."
              className={inputCls}
              list="industry-suggestions"
            />
            <datalist id="industry-suggestions">
              {INDUSTRY_OPTS.map((o) => <option key={o} value={o} />)}
            </datalist>
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">Mức lương tối thiểu</label>
          <div className="relative">
            <input
              type="text"
              value={form.minSalary}
              onChange={(e) => update({ minSalary: e.target.value })}
              placeholder="VD: 30,000,000"
              className={inputCls + " pr-24"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">
              VND / Tháng
            </span>
          </div>
          {/* Salary tags */}
          {form.minSalary && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium">
                {form.industry || "Ngành"}/{form.minSalary.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} triệu
                <button onClick={() => update({ minSalary: "" })}>
                  <X size={10} className="text-blue-400 hover:text-red-500" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Contract types – checkbox grid */}
        <div>
          <label className="text-[11px] text-gray-400 mb-2 block">Hình thức hợp đồng</label>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {CONTRACT_TYPES.map((ct) => (
              <label key={ct} className="flex items-center gap-2 cursor-pointer select-none group">
                <span
                  onClick={() => toggleList("contractTypes", ct)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    form.contractTypes.includes(ct)
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {form.contractTypes.includes(ct) && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-gray-700" onClick={() => toggleList("contractTypes", ct)}>
                  {ct}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Levels – checkbox grid */}
        <div>
          <label className="text-[11px] text-gray-400 mb-2 block">Cấp bậc mong muốn</label>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {LEVELS.map((lv) => (
              <label key={lv} className="flex items-center gap-2 cursor-pointer select-none group">
                <span
                  onClick={() => toggleList("levels", lv)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    form.levels.includes(lv)
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {form.levels.includes(lv) && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-gray-700" onClick={() => toggleList("levels", lv)}>
                  {lv}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Selected tags summary */}
        {(form.contractTypes.length > 0 || form.levels.length > 0) && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
            {[...form.contractTypes, ...form.levels].map((tag) => (
              <span
                key={tag}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {tag}
                <button
                  onClick={() => {
                    if (form.contractTypes.includes(tag)) toggleList("contractTypes", tag);
                    else toggleList("levels", tag);
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              onClick={() => setCustomIndustry("")}
              className="text-xs text-gray-400 hover:text-blue-600 px-1"
            >
              + Add other
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}