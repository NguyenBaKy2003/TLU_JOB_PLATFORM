"use client";

import React, { useState } from "react";
import { Globe, Plus, X } from "lucide-react";
import { Language } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface LanguageSectionProps {
  languages: Language[];
  onAdd?: (lang: Language) => void;
  onRemove?: (id: string) => void;
}

const LEVEL_LABELS: Record<Language["level"], string> = {
  A1: "Sơ cấp", A2: "Cơ bản", B1: "Trung cấp thấp",
  B2: "Trung cấp cao", C1: "Nâng cao", C2: "Thành thạo", native: "Bản ngữ",
};
const LEVELS = Object.keys(LEVEL_LABELS) as Language["level"][];

function FloatingInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
    </div>
  );
}

function FloatingSelect({ label, value, onChange }: {
  label: string; value: string; onChange: (v: Language["level"]) => void;
}) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as Language["level"])}
        className="w-full text-sm text-gray-800 bg-transparent focus:outline-none mt-0.5 appearance-none cursor-pointer">
        {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
      </select>
    </div>
  );
}

export function LanguageSection({ languages, onAdd, onRemove }: LanguageSectionProps) {
  const [form, setForm] = useState({ name: "", level: "A2" as Language["level"] });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd?.({ id: Date.now().toString(), name: form.name.trim(), level: form.level });
    setForm({ name: "", level: "A2" });
  };

  return (
    <SectionCard title="Ngoại ngữ" icon={<Globe size={16} />} isEmpty={false}>
      <div className="space-y-3">
        {/* Inputs always visible */}
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Tên ngôn ngữ" value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Tiếng Anh" />
          <FloatingSelect label="Trình độ thông thạo" value={form.level}
            onChange={(v) => setForm((p) => ({ ...p, level: v }))} />
        </div>

        {/* Tags */}
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span key={lang.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                {lang.name} /{LEVEL_LABELS[lang.level]}
                <button onClick={() => onRemove?.(lang.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* + Khác */}
        <button onClick={handleAdd}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          <Plus size={15} /> Khác
        </button>
      </div>
    </SectionCard>
  );
}