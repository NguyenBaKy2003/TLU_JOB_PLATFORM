"use client";

import React, { useState } from "react";
import { Target, X, Plus } from "lucide-react";
import { Skill } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface SkillsSectionProps {
  skills: Skill[];
  onAdd?: (skill: Skill) => void;
  onRemove?: (id: string) => void;
}

export function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
  const [input, setInput] = useState("");

  const handleAdd = (name: string = input) => {
    const trimmed = name.trim();
    if (!trimmed || skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd?.({ id: Date.now().toString(), name: trimmed });
    setInput("");
  };

  return (
    <SectionCard title="Kỹ năng chuyên môn" icon={<Target size={16} />} isEmpty={false}>
      <div className="space-y-3">
        {/* Floating input */}
        <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">
            Kỹ năng của bạn
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
            }}
            placeholder="Thêm"
            className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5"
          />
        </div>

        {/* Skill tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {skill.name}
                <button
                  onClick={() => onRemove?.(skill.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add other */}
        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus size={15} />
          Khác
        </button>
      </div>
    </SectionCard>
  );
}