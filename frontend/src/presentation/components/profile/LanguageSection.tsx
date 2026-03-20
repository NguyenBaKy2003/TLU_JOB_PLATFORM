"use client";

import React, { useState } from "react";
import { Globe, Plus, X, ChevronDown } from "lucide-react";
import { Language } from "@/domain/models/Candidate";
import { SectionCard } from "../layout/profile/SectionCard";

interface LanguageSectionProps {
  languages: Language[];
  onAdd?:    (lang: Language) => void;
  onRemove?: (id: string) => void;
}

const LEVEL_OPTIONS = [
  { value: "A1",     label: "A1 – Sơ cấp" },
  { value: "A2",     label: "A2 – Cơ bản" },
  { value: "B1",     label: "B1 – Trung cấp thấp" },
  { value: "B2",     label: "B2 – Trung cấp cao" },
  { value: "C1",     label: "C1 – Nâng cao" },
  { value: "C2",     label: "C2 – Thành thạo" },
  { value: "NATIVE", label: "Bản ngữ" },
];

const levelLabel = (v: string) => LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;

export function LanguageSection({ languages, onAdd, onRemove }: LanguageSectionProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: "", level: "B1" });

  const handleAdd = () => {
    const trimmed = form.name.trim();
    if (!trimmed) return;
    if (languages.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd?.({ id: crypto.randomUUID(), name: trimmed, level: form.level });
    setForm({ name: "", level: "B1" });
  };

  return (
    <SectionCard
      title="Ngoại ngữ"
      icon={<Globe size={16} />}
      isEmpty={false}
      onEdit={() => setEditing((v) => !v)}
    >
      {/* ── View: language tags ── */}
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {languages.map((lang) => (
            <span key={lang.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
              {lang.name}
              <span className="text-gray-400 text-xs">{levelLabel(lang.level)}</span>
              {editing && (
                <button onClick={() => onRemove?.(lang.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* ── Edit: add form ── */}
      {editing && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Tên ngôn ngữ</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Tiếng Anh"
                className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
            </div>
            {/* Level */}
            <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Trình độ</label>
              <div className="relative mt-0.5">
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                  className="w-full text-sm text-gray-800 bg-transparent focus:outline-none appearance-none cursor-pointer pr-5">
                  {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={15} /> Thêm ngôn ngữ
            </button>
            <button onClick={() => setEditing(false)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Xong
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}