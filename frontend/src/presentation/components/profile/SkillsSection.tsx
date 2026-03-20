"use client";

import React, { useState } from "react";
import { Target, X, Plus, ChevronDown } from "lucide-react";
import { Skill, SkillLevel } from "@/domain/models/Candidate";
import { SectionCard } from "../layout/profile/SectionCard";

interface SkillsSectionProps {
  skills:    Skill[];
  onAdd?:    (skill: Skill) => void;
  onRemove?: (name: string) => void;
}

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "BEGINNER",     label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung cấp" },
  { value: "ADVANCED",     label: "Nâng cao" },
];

const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER:     "bg-gray-100 text-gray-600",
  INTERMEDIATE: "bg-blue-50 text-blue-600",
  ADVANCED:     "bg-green-50 text-green-600",
};

export function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState("");
  const [level, setLevel]         = useState<SkillLevel>("INTERMEDIATE");
  const [yearsOfExp, setYearsOfExp] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd?.({ name: trimmed, level, yearsOfExp: yearsOfExp ? parseInt(yearsOfExp) : 0 });
    setName(""); setLevel("INTERMEDIATE"); setYearsOfExp("");
  };

  return (
    <SectionCard
      title="Kỹ năng chuyên môn"
      icon={<Target size={16} />}
      isEmpty={false}
      onEdit={() => setEditing((v) => !v)}
    >
      {/* ── View: skill tags ── */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <span key={skill.name}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                LEVEL_COLORS[skill.level as SkillLevel] ?? "bg-gray-100 text-gray-600"
              }`}>
              {skill.name}
              {skill.yearsOfExp > 0 && (
                <span className="opacity-60 text-xs">{skill.yearsOfExp}y</span>
              )}
              {editing && (
                <button onClick={() => onRemove?.(skill.name)}
                  className="opacity-60 hover:opacity-100 hover:text-red-500 transition-all">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Name */}
            <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Kỹ năng</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); }}}
                placeholder="React, Figma…"
                className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
            </div>
            {/* Level */}
            <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Trình độ</label>
              <div className="relative mt-0.5">
                <select value={level} onChange={(e) => setLevel(e.target.value as SkillLevel)}
                  className="w-full text-sm text-gray-800 bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer">
                  {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Years */}
            <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">Số năm KN</label>
              <input type="number" min={0} max={50} value={yearsOfExp}
                onChange={(e) => setYearsOfExp(e.target.value)} placeholder="0"
                className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={15} /> Thêm kỹ năng
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