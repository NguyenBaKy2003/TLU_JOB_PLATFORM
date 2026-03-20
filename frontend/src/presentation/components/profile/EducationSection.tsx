"use client";

import React, { useState } from "react";
import { BookOpen, Plus, X, Calendar } from "lucide-react";
import { Education, Degree } from "@/domain/models/Candidate";
import { SectionCard } from "../layout/profile/SectionCard";

interface EducationSectionProps {
  educations: Education[];
  onAdd?:     (edu: Education) => void;
  onRemove?:  (id: string) => void;
}

const DEGREE_OPTIONS: { value: Degree; label: string }[] = [
  { value: "BACHELOR", label: "Cử nhân" },
  { value: "MASTER",   label: "Thạc sĩ" },
  { value: "PHD",      label: "Tiến sĩ" },
  { value: "OTHER",    label: "Khác" },
];

const DEGREE_LABELS: Record<Degree, string> = {
  BACHELOR: "Cử nhân", MASTER: "Thạc sĩ", PHD: "Tiến sĩ", OTHER: "Khác",
};

const EMPTY_FORM = { major: "", school: "", degree: "BACHELOR" as Degree, startDate: "", endDate: "", isCurrent: false, description: "" };
const MAX_DESC   = 512;
const fmtDate    = (iso: string | null | undefined) => { if (!iso) return ""; const [y, m] = iso.split("-"); return `${m}/${y}`; };

function FloatingInput({ label, value, onChange, placeholder, type = "text", suffix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; suffix?: React.ReactNode;
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

export function EducationSection({ educations, onAdd, onRemove }: EducationSectionProps) {
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);

  const set = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleAdd = () => {
    if (!form.school.trim() || !form.degree) return;
    onAdd?.({
      id:          crypto.randomUUID(),
      school:      form.school.trim(),
      major:       form.major.trim() || null,
      degree:      form.degree,
      startDate:   form.startDate,
      endDate:     form.isCurrent ? null : (form.endDate || null),
      description: form.description.trim() || null,
    });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const calIcon = <Calendar size={15} className="text-gray-300 flex-shrink-0" />;

  return (
    <SectionCard
      title="Học vấn"
      icon={<BookOpen size={16} />}
      isEmpty={educations.length === 0 && !adding}
      addLabel={educations.length === 0 && !adding ? "Học vấn" : undefined}
      onAdd={() => { setAdding(true); setEditing(true); }}
      onEdit={educations.length > 0 ? () => setEditing((v) => !v) : undefined}
    >
      {(adding || educations.length > 0) && (
        <div className="space-y-3">

          {/* ── Existing entries ── */}
          {educations.map((edu) => (
            <div key={edu.id}
              className="group flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {DEGREE_LABELS[edu.degree as Degree] ?? edu.degree}{edu.major ? ` of ${edu.major}` : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {edu.school} · {fmtDate(edu.startDate)} → {edu.endDate ? fmtDate(edu.endDate) : "Hiện tại"}
                </p>
                {edu.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{edu.description}</p>
                )}
              </div>
              {editing && (
                <button onClick={() => onRemove?.(edu.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                  <X size={15} />
                </button>
              )}
            </div>
          ))}

          {/* ── Add form ── */}
          {adding && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FloatingInput label="Chuyên ngành" value={form.major} onChange={set("major")} placeholder="Công nghệ thông tin" />
                <FloatingInput label="Tên trường" value={form.school} onChange={set("school")} placeholder="Đại học Bách Khoa" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Trình độ học vấn</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {DEGREE_OPTIONS.map((d) => (
                    <label key={d.value} className="flex items-center gap-2 cursor-pointer select-none group" onClick={() => set("degree")(d.value)}>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        form.degree === d.value ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}>
                        {form.degree === d.value && <span className="w-2 h-2 rounded-full bg-blue-600 block" />}
                      </span>
                      <span className="text-sm text-gray-700">{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FloatingInput label="Bắt đầu" value={form.startDate} onChange={set("startDate")} type="date" suffix={calIcon} />
                <FloatingInput label="Kết thúc" value={form.endDate} onChange={set("endDate")} type="date" suffix={calIcon} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => set("isCurrent")(!form.isCurrent)}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  form.isCurrent ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                  {form.isCurrent && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
                </span>
                <span className="text-sm text-gray-600">Vẫn đang học</span>
              </label>
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
              <Plus size={15} /> Thêm học vấn
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}