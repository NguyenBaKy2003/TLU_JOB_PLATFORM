"use client";

import React, { useState } from "react";
import { Globe, Plus, Trash2 } from "lucide-react";
import { Language } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface LanguageSectionProps {
  languages: Language[];
  onAdd?: (lang: Language) => void;
  onRemove?: (id: string) => void;
}

const LEVELS: Language["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];
const LEVEL_LABELS: Record<Language["level"], string> = {
  A1: "A1 – Sơ cấp",
  A2: "A2 – Cơ bản",
  B1: "B1 – Trung cấp thấp",
  B2: "B2 – Trung cấp cao",
  C1: "C1 – Nâng cao",
  C2: "C2 – Thành thạo",
  native: "Bản ngữ",
};

const LEVEL_BARS: Record<Language["level"], number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6, native: 6,
};

export function LanguageSection({ languages, onAdd, onRemove }: LanguageSectionProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", level: "B1" as Language["level"] });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd?.({ id: Date.now().toString(), name: form.name.trim(), level: form.level });
    setForm({ name: "", level: "B1" });
    setAdding(false);
  };

  return (
    <SectionCard
      title="Ngoại ngữ"
      icon={<Globe size={16} />}
      isEmpty={languages.length === 0 && !adding}
      emptyText="Chưa có thông tin ngoại ngữ"
      addLabel={languages.length === 0 && !adding ? "Ngôn ngữ" : undefined}
      onAdd={() => setAdding(true)}
    >
      {languages.map((lang) => (
        <div key={lang.id} className="group flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">{lang.name}</span>
              <span className="text-[11px] text-gray-400">{LEVEL_LABELS[lang.level]}</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < LEVEL_BARS[lang.level] ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => onRemove?.(lang.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Tên ngôn ngữ..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as Language["level"] })}
            className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l === "native" ? "Bản ngữ" : l}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Thêm</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Hủy</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-2">
          <Plus size={16} /> Ngôn ngữ
        </button>
      )}
    </SectionCard>
  );
}