"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Trash2, Calendar } from "lucide-react";
import { WorkExperience } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface ExperienceSectionProps {
  experiences: WorkExperience[];
  onAdd?: (exp: WorkExperience) => void;
  onRemove?: (id: string) => void;
}

const EMPTY_FORM = {
  position: "", company: "", startDate: "", endDate: "",
  isCurrent: false, description: "",
};

const MAX_DESC = 512;

function FloatingInput({
  label, value, onChange, placeholder, type = "text", suffix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5"
        />
        {suffix}
      </div>
    </div>
  );
}

export function ExperienceSection({ experiences, onAdd, onRemove }: ExperienceSectionProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleAdd = () => {
    if (!form.position || !form.company) return;
    onAdd?.({ id: Date.now().toString(), ...form });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const calIcon = <Calendar size={15} className="text-gray-300 flex-shrink-0" />;

  return (
    <SectionCard
      title="Kinh nghiệm làm việc"
      icon={<Briefcase size={16} />}
      isEmpty={experiences.length === 0 && !adding}
      emptyText="Chưa có kinh nghiệm làm việc"
      addLabel={experiences.length === 0 && !adding ? "Kinh nghiệm làm việc" : undefined}
      onAdd={() => setAdding(true)}
    >
      {/* Form */}
      {(adding || experiences.length > 0) && (
        <div className="space-y-3">
          {adding && (
            <>
              <FloatingInput label="Chức danh công việc" value={form.position}
                onChange={set("position")} placeholder="UX Writing" />

              <FloatingInput label="Tên công ty" value={form.company}
                onChange={set("company")} placeholder="Microsoft" />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput label="Thời gian bắt đầu" value={form.startDate}
                  onChange={set("startDate")} placeholder="DD/MM/YYYY" suffix={calIcon} />
                <FloatingInput label="Thời gian kết thúc" value={form.endDate}
                  onChange={set("endDate")} placeholder="DD/MM/YYYY" suffix={calIcon}  />
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span
                  onClick={() => set("isCurrent")(!form.isCurrent)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    form.isCurrent ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}
                >
                  {form.isCurrent && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-gray-600" onClick={() => set("isCurrent")(!form.isCurrent)}>
                  Vẫn đang làm
                </span>
              </label>

              {/* Textarea */}
              <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Miêu tả</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description")(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Viết thành tự của bạn"
                  className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5 resize-none leading-relaxed"
                />
                <div className="flex justify-end">
                  <span className={`text-[11px] tabular-nums ${form.description.length >= MAX_DESC ? "text-red-500" : "text-gray-400"}`}>
                    {form.description.length}/{MAX_DESC}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Existing entries */}
          {experiences.map((exp) => (
            <div key={exp.id} className="group flex items-start justify-between gap-2 py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">{exp.position}</p>
                <p className="text-xs text-gray-400">
                  {exp.company} _ Từ {exp.startDate} đến {exp.isCurrent ? "Hiện tại" : exp.endDate}
                </p>
              </div>
              <button onClick={() => onRemove?.(exp.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Actions */}
          {adding ? (
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Lưu
              </button>
              <button onClick={() => { setAdding(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Hủy
              </button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={15} /> Khác
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}