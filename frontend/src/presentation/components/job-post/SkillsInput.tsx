// src/presentation/components/job-post/SkillsInput.tsx
"use client";
import { useState }       from "react";
import { Plus, X, Star }  from "lucide-react";
import type { SkillEntry } from "@/domain/models/JobPost";

const LEVELS = ["Cơ bản", "Trung cấp", "Nâng cao"];

const POPULAR = [
  "Java", "Spring Boot", "React", "TypeScript", "Python",
  "Node.js", "SQL", "Docker", "AWS", "Figma",
];

const inputCls = "w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

interface Props {
  skills:    SkillEntry[];
  onChange:  (skills: SkillEntry[]) => void;
}

export function SkillsInput({ skills, onChange }: Props) {
  const [name,  setName]  = useState("");
  const [level, setLevel] = useState("Nâng cao");
  const [req,   setReq]   = useState(true);

  const add = (skillName = name) => {
    const trimmed = skillName.trim();
    if (!trimmed || skills.some(s => s.skillName.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...skills, { skillName: trimmed, level, required: req }]);
    setName("");
  };

  const remove = (i: number) => onChange(skills.filter((_, idx) => idx !== i));

  const toggle = (i: number, key: "required") =>
    onChange(skills.map((s, idx) => idx === i ? { ...s, [key]: !s[key] } : s));

  const setSkillLevel = (i: number, lv: string) =>
    onChange(skills.map((s, idx) => idx === i ? { ...s, level: lv } : s));

  return (
    <div className="flex flex-col gap-4">
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Nhập tên kỹ năng, ví dụ: Java"
          className={inputCls + " flex-1"}
        />
        <select value={level} onChange={e => setLevel(e.target.value)}
          className={inputCls + " sm:w-36 bg-white cursor-pointer"}>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0 cursor-pointer">
          <input type="checkbox" checked={req} onChange={e => setReq(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600" />
          Bắt buộc
        </label>
        <button onClick={() => add()} type="button"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white text-[16px]
            font-medium rounded-xl hover:bg-blue-800 transition-colors shrink-0 whitespace-nowrap">
          <Plus size={15} /> Thêm
        </button>
      </div>

      {/* Popular skills quick-add */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] text-gray-400 self-center">Phổ biến:</span>
        {POPULAR.filter(p => !skills.some(s => s.skillName.toLowerCase() === p.toLowerCase())).map(p => (
          <button key={p} type="button" onClick={() => add(p)}
            className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-full
              hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 hover:border-blue-200">
            + {p}
          </button>
        ))}
      </div>

      {/* Skill tags list */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-2">
          {skills.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors
              ${s.required ? "bg-blue-50/50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>

              {/* Name */}
              <span className="flex-1 text-[16px] font-medium text-gray-800 truncate">{s.skillName}</span>

              {/* Level selector */}
              <select value={s.level} onChange={e => setSkillLevel(i, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white
                  focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 cursor-pointer shrink-0">
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>

              {/* Required toggle */}
              <button type="button" onClick={() => toggle(i, "required")}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg
                  transition-colors shrink-0 ${s.required
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"}`}>
                <Star size={10} fill={s.required ? "white" : "none"} />
                {s.required ? "Bắt buộc" : "Tùy chọn"}
              </button>

              {/* Remove */}
              <button type="button" onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}