"use client";

import { Gift, X } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

interface BenefitsSectionProps {
  selected?: string[];
  onChange?: (val: string[]) => void;
}

const ALL_BENEFITS = [
  "Cơ hội thăng tiến",
  "Xe đưa đón",
  "Giờ làm việc linh hoạt",
  "Bảo hiểm",
  "Thưởng theo hiệu suất",
  "Đào tạo & phát triển",
  "Căn tin",
  "Làm việc từ xa",
];

function Checkbox({ checked, onChange, label }: {
  checked: boolean; onChange: () => void; label: string;
}) {
  return (
    <div className="flex items-center gap-2 cursor-pointer select-none group" onClick={onChange}>
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-blue-400"
      }`}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

export function BenefitsSection({ selected = [], onChange }: BenefitsSectionProps) {
  const toggle = (benefit: string) => {
    const next = selected.includes(benefit)
      ? selected.filter((b) => b !== benefit)
      : [...selected, benefit];
    onChange?.(next);
  };

  return (
    <SectionCard title="Phúc lợi mong muốn" icon={<Gift size={16} />} isEmpty={false}>
      <div className="space-y-4">
        {/* Checkboxes */}
        <div className="space-y-2.5">
          {ALL_BENEFITS.map((b) => (
            <Checkbox key={b} label={b} checked={selected.includes(b)} onChange={() => toggle(b)} />
          ))}
        </div>

        {/* Selected tags */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {selected.map((b) => (
              <span key={b}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                {b}
                <button onClick={() => toggle(b)}>
                  <X size={11} className="text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}