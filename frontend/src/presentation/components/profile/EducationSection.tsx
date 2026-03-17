"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Education } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface EducationSectionProps {
  educations: Education[];
  onAdd?: (edu: Education) => void;
  onRemove?: (id: string) => void;
}

const EMPTY_FORM = {
  school: "",
  degree: "",
  field: "",
  startYear: "",
  endYear: "",
  isCurrent: false,
};

export function EducationSection({ educations, onAdd, onRemove }: EducationSectionProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.school || !form.degree) return;
    onAdd?.({
      id: Date.now().toString(),
      school: form.school,
      degree: form.degree,
      field: form.field,
      startYear: parseInt(form.startYear) || new Date().getFullYear(),
      endYear: form.endYear ? parseInt(form.endYear) : undefined,
      isCurrent: form.isCurrent,
    });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  return (
    <SectionCard
      title="Học vấn"
      icon={<BookOpen size={16} />}
      isEmpty={educations.length === 0 && !adding}
      emptyText="Chưa có thông tin học vấn"
      addLabel={educations.length === 0 && !adding ? "Học vấn" : undefined}
      onAdd={() => setAdding(true)}
    >
      {educations.map((edu) => (
        <div key={edu.id} className="group flex gap-3 py-3 border-b border-gray-100 last:border-0">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} className="text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{edu.school}</p>
                <p className="text-xs text-gray-500">
                  {edu.degree}{edu.field ? ` – ${edu.field}` : ""}
                </p>
              </div>
              <button
                onClick={() => onRemove?.(edu.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {edu.startYear} – {edu.isCurrent ? "Hiện tại" : edu.endYear ?? ""}
            </p>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="mt-3 space-y-3 border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "school", placeholder: "Tên trường *" },
              { key: "degree", placeholder: "Bằng cấp *" },
              { key: "field", placeholder: "Chuyên ngành" },
              { key: "startYear", placeholder: "Năm bắt đầu" },
              { key: "endYear", placeholder: "Năm tốt nghiệp" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
              className="rounded accent-blue-600"
            />
            Đang học
          </label>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Lưu</button>
            <button onClick={() => { setAdding(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-2">
          <Plus size={16} /> Học vấn
        </button>
      )}
    </SectionCard>
  );
}