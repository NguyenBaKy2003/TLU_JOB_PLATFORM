"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Trash2, Calendar } from "lucide-react";
import { WorkExperience } from "@/domain/models/Candidate";
import { SectionCard } from "../layout/profile/SectionCard";

interface ExperienceSectionProps {
  experiences: WorkExperience[];
  onAdd?:      (exp: WorkExperience) => void;
  onRemove?:   (id: string) => void;
}

const EMPTY_FORM = { position: "", companyName: "", startDate: "", endDate: "", current: false, description: "" };
const MAX_DESC   = 512;

const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  return `${m}/${y}`;
};

function FloatingInput({ label, value, onChange, placeholder, type = "text", suffix }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <div className="flex items-center gap-2">
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
        {suffix}
      </div>
    </div>
  );
}

export function ExperienceSection({ experiences, onAdd, onRemove }: ExperienceSectionProps) {
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);

  const set = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleAdd = () => {
    if (!form.position.trim() || !form.companyName.trim()) return;
    onAdd?.({
      id:          crypto.randomUUID(),
      position:    form.position.trim(),
      companyName: form.companyName.trim(),
      startDate:   form.startDate,
      endDate:     form.current ? null : (form.endDate || null),
      current:     form.current,
      description: form.description.trim() || null,
    });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const calIcon = <Calendar size={15} className="text-gray-300 flex-shrink-0" />;

  return (
    <SectionCard
      title="Kinh nghiệm làm việc"
      icon={<Briefcase size={16} />}
      isEmpty={experiences.length === 0 && !adding}
      addLabel={experiences.length === 0 && !adding ? "Kinh nghiệm làm việc" : undefined}
      onAdd={() => { setAdding(true); setEditing(true); }}
      onEdit={experiences.length > 0 ? () => setEditing((v) => !v) : undefined}
    >
      {(adding || experiences.length > 0) && (
        <div className="space-y-3">

          {/* ── Existing entries ── */}
          {experiences.map((exp) => (
            <div key={exp.id}
              className="group flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{exp.position}</p>
                <p className="text-xs text-gray-500">
                  {exp.companyName} · {fmtDate(exp.startDate)} → {exp.current ? "Hiện tại" : fmtDate(exp.endDate)}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{exp.description}</p>
                )}
              </div>
              {editing && (
                <button onClick={() => onRemove?.(exp.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {/* ── Add form ── */}
          {adding && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <FloatingInput label="Chức danh" value={form.position} onChange={set("position")} placeholder="UX Writer" />
              <FloatingInput label="Tên công ty" value={form.companyName} onChange={set("companyName")} placeholder="Microsoft" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FloatingInput label="Bắt đầu" value={form.startDate} onChange={set("startDate")} type="date" suffix={calIcon} />
                <FloatingInput label="Kết thúc" value={form.endDate} onChange={set("endDate")} type="date" suffix={calIcon} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => set("current")(!form.current)}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  form.current ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                  {form.current && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
                </span>
                <span className="text-sm text-gray-600">Vẫn đang làm</span>
              </label>
              <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Miêu tả</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => set("description")(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Mô tả thành tích và trách nhiệm"
                  className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5 resize-none leading-relaxed" />
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

          {/* Add another — edit mode only */}
          {editing && !adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={15} /> Thêm kinh nghiệm
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}