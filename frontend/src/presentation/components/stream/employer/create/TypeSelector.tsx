// components/stream/employer/create/TypeSelector.tsx
import React from "react";
import { Briefcase, Users } from "lucide-react";
import type { SessionType } from "@/domain/models/LiveStream";

interface TypeSelectorProps {
  value: SessionType;
  onChange: (v: SessionType) => void;
}

const options = [
  {
    type: "JOB_FAIR" as SessionType,
    icon: Briefcase,
    label: "Job Fair",
    desc: "Giới thiệu công ty, nhiều vị trí, nhiều viewer",
  },
  {
    type: "INTERVIEW" as SessionType,
    icon: Users,
    label: "Phỏng vấn trực tiếp",
    desc: "Phỏng vấn 1-1 hoặc nhóm nhỏ với interview slots",
  },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(({ type, icon: Icon, label, desc }) => {
        const isSelected = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`p-5 rounded-xl border-2 text-left transition-all
              ${isSelected
                ? "border-slate-800 bg-slate-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
              }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors
                ${isSelected ? "bg-slate-800" : "bg-slate-100"}
              `}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isSelected ? "text-white" : "text-slate-500"
                }`}
              />
            </div>
            <p className={`font-semibold text-[16px] mb-1 ${
              isSelected ? "text-slate-800" : "text-slate-600"
            }`}>
              {label}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}