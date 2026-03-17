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

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-gray-100 text-gray-600",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
  expert: "bg-green-100 text-green-700",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
  expert: "Chuyên gia",
};

export function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: "intermediate" as Skill["level"] });

  const handleAdd = () => {
    if (!newSkill.name.trim()) return;
    onAdd?.({ id: Date.now().toString(), name: newSkill.name.trim(), level: newSkill.level });
    setNewSkill({ name: "", level: "intermediate" });
    setAdding(false);
  };

  return (
    <SectionCard
      title="Kỹ năng chuyên môn"
      icon={<Target size={16} />}
      isEmpty={skills.length === 0 && !adding}
      emptyText="Chưa có kỹ năng nào"
      addLabel={skills.length === 0 && !adding ? "Kỹ năng chuyên môn" : undefined}
      onAdd={() => setAdding(true)}
    >
      {/* Skill tags */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full"
            >
              <span className="text-sm font-medium text-gray-700">{skill.name}</span>
              {skill.level && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[skill.level]}`}>
                  {LEVEL_LABELS[skill.level]}
                </span>
              )}
              <button
                onClick={() => onRemove?.(skill.id)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            autoFocus
            type="text"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Tên kỹ năng..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <select
            value={newSkill.level}
            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as Skill["level"] })}
            className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {Object.entries(LEVEL_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm
          </button>
          <button
            onClick={() => setAdding(false)}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1"
        >
          <Plus size={16} />
          Kỹ năng chuyên môn
        </button>
      )}
    </SectionCard>
  );
}