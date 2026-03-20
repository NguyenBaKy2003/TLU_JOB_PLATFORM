"use client";

import React, { useState } from "react";
import { Target, X, Plus, Info } from "lucide-react";
import { DesiredJob } from "@/domain/models/Candidate";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

interface JobExpectationsSectionProps {
  value?:    DesiredJob[];
  onChange?: (val: DesiredJob[]) => void;
}

const CONTRACT_TYPE_OPTIONS = [
  { value: "FULL_TIME",  label: "Full-time" },
  { value: "PART_TIME",  label: "Part-time" },
  { value: "REMOTE",     label: "Từ xa" },
  { value: "INTERNSHIP", label: "Thực tập sinh" },
];
const LEVEL_OPTIONS = [
  { value: "FRESHER",  label: "Mới đi làm" },
  { value: "JUNIOR",   label: "Junior" },
  { value: "SENIOR",   label: "Senior" },
  { value: "MANAGER",  label: "Quản lý" },
  { value: "DIRECTOR", label: "Quản lý cấp cao" },
];
const CURRENCY_OPTIONS = ["VND", "USD", "EUR"];

const contractLabel = (v: string) => CONTRACT_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;
const levelLabel    = (v: string) => LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;
const fmtSalary     = (n: number, c: string) => `${n.toLocaleString("vi-VN")} ${c}`;

const EMPTY_FORM = { industry: "", minSalary: "", currency: "VND", contractTypes: [] as string[], levels: [] as string[] };

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group" onClick={onChange}>
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}>
        {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export function JobExpectationsSection({ value = [], onChange }: JobExpectationsSectionProps) {
  const [adding, setAdding]   = useState(value.length === 0);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);

  const setField = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleList = (key: "contractTypes" | "levels", item: string) => {
    const list = form[key];
    setForm((prev) => ({
      ...prev,
      [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    }));
  };

  const handleAdd = () => {
    if (!form.industry.trim() && !form.minSalary) return;
    onChange?.([...value, {
      id:            crypto.randomUUID(),
      industry:      form.industry.trim(),
      minSalary:     form.minSalary ? parseFloat(form.minSalary) : 0,
      currency:      form.currency,
      contractTypes: form.contractTypes,
      levels:        form.levels,
    }]);
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const handleRemove = (id: string) => onChange?.(value.filter((j) => j.id !== id));

  return (
    <SectionCard
      title="Công việc mong muốn"
      icon={<Target size={16} />}
      isEmpty={value.length === 0 && !adding}
      addLabel={value.length === 0 && !adding ? "Công việc mong muốn" : undefined}
      onAdd={() => { setAdding(true); setEditing(true); }}
      onEdit={value.length > 0 ? () => setEditing((v) => !v) : undefined}
    >
      {(adding || value.length > 0) && (
        <div className="space-y-3">

          {/* ── Existing entries ── */}
          {value.map((job) => (
            <div key={job.id}
              className="group flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{job.industry || "—"}</p>
                {job.minSalary > 0 && (
                  <p className="text-xs text-gray-500">Từ {fmtSalary(job.minSalary, job.currency)}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {job.contractTypes.map((ct) => (
                    <span key={ct} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                      {contractLabel(ct)}
                    </span>
                  ))}
                  {job.levels.map((lv) => (
                    <span key={lv} className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                      {levelLabel(lv)}
                    </span>
                  ))}
                </div>
              </div>
              {editing && (
                <button onClick={() => handleRemove(job.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          {/* ── Add form ── */}
          {adding && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* Industry */}
              <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Ngành nghề</label>
                <input value={form.industry} onChange={(e) => setField("industry")(e.target.value)}
                  placeholder="Công nghệ thông tin"
                  className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
              </div>
              {/* Salary + currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Lương tối thiểu</label>
                  <input type="number" value={form.minSalary} onChange={(e) => setField("minSalary")(e.target.value)}
                    placeholder="15000000"
                    className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
                </div>
                <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 transition-all">
                  <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Tiền tệ</label>
                  <select value={form.currency} onChange={(e) => setField("currency")(e.target.value)}
                    className="w-full text-sm text-gray-800 bg-transparent focus:outline-none mt-0.5 appearance-none cursor-pointer">
                    {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-gray-700">Hình thức hợp đồng</p>
                  {CONTRACT_TYPE_OPTIONS.map((ct) => (
                    <Checkbox key={ct.value} label={ct.label}
                      checked={form.contractTypes.includes(ct.value)}
                      onChange={() => toggleList("contractTypes", ct.value)} />
                  ))}
                </div>
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-gray-700">Cấp bậc mong muốn</p>
                  {LEVEL_OPTIONS.map((lv) => (
                    <Checkbox key={lv.value} label={lv.label}
                      checked={form.levels.includes(lv.value)}
                      onChange={() => toggleList("levels", lv.value)} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Lưu
                </button>
                <button onClick={() => { setAdding(false); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {editing && !adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={15} /> Thêm công việc mong muốn
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}