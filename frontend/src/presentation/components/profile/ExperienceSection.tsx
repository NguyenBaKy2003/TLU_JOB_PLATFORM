"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { WorkExperience } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface ExperienceSectionProps {
  experiences: WorkExperience[];
  onAdd?: (exp: WorkExperience) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (exp: WorkExperience) => void;
}

const EMPTY_FORM = {
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
};

export function ExperienceSection({ experiences, onAdd, onRemove }: ExperienceSectionProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.company || !form.position) return;
    onAdd?.({ id: Date.now().toString(), ...form });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  return (
    <SectionCard
      title="Kinh nghiệm làm việc"
      icon={<Briefcase size={16} />}
      isEmpty={experiences.length === 0 && !adding}
      emptyText="Chưa có kinh nghiệm làm việc"
      addLabel={experiences.length === 0 && !adding ? "Kinh nghiệm làm việc" : undefined}
      onAdd={() => setAdding(true)}
    >
      {/* Experience list */}
      {experiences.map((exp) => (
        <div key={exp.id} className="group flex gap-3 py-3 border-b border-gray-100 last:border-0">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{exp.position}</p>
                <p className="text-xs text-gray-500">{exp.company}</p>
              </div>
              <button
                onClick={() => onRemove?.(exp.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {exp.startDate} – {exp.isCurrent ? "Hiện tại" : exp.endDate}
            </p>
            {exp.description && (
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{exp.description}</p>
            )}
          </div>
        </div>
      ))}

      {/* Add form */}
      {adding ? (
        <div className="mt-3 space-y-3 border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "company", placeholder: "Tên công ty *" },
              { key: "position", placeholder: "Chức vụ *" },
              { key: "startDate", placeholder: "Ngày bắt đầu (VD: 01/2022)" },
              { key: "endDate", placeholder: "Ngày kết thúc" },
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
            Đang làm việc tại đây
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả công việc (tùy chọn)"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu
            </button>
            <button
              onClick={() => { setAdding(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-2"
        >
          <Plus size={16} />
          Kinh nghiệm làm việc
        </button>
      )}
    </SectionCard>
  );
}