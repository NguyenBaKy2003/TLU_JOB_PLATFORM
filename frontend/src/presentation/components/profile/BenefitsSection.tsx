"use client";

import React, { useState } from "react";
import { Gift, X } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

interface BenefitsSectionProps {
  selected: string[];
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

const BENEFIT_ICONS: Record<string, string> = {
  "Cơ hội thăng tiến": "📈",
  "Xe đưa đón": "🚌",
  "Giờ làm việc linh hoạt": "⏰",
  "Bảo hiểm": "🛡️",
  "Thưởng theo hiệu suất": "💰",
  "Đào tạo & phát triển": "📚",
  "Căn tin": "🍱",
  "Làm việc từ xa": "🏠",
};

export function BenefitsSection({ selected, onChange }: BenefitsSectionProps) {
  const toggle = (benefit: string) => {
    const next = selected.includes(benefit)
      ? selected.filter((b) => b !== benefit)
      : [...selected, benefit];
    onChange?.(next);
  };

  return (
    <SectionCard title="Phúc lợi mong muốn" icon={<Gift size={16} />} isEmpty={false}>
      <div className="space-y-3">
        {/* Checkbox grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {ALL_BENEFITS.map((b) => {
            const isSelected = selected.includes(b);
            return (
              <label key={b} className="flex items-center gap-2 cursor-pointer select-none group">
                <span
                  onClick={() => toggle(b)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm transition-colors ${isSelected ? "text-gray-800 font-medium" : "text-gray-600"}`}
                  onClick={() => toggle(b)}
                >
                  <span className="mr-1">{BENEFIT_ICONS[b]}</span>
                  {b}
                </span>
              </label>
            );
          })}
        </div>

        {/* Selected tags */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {selected.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg"
              >
                {BENEFIT_ICONS[b]} {b}
                <button
                  onClick={() => toggle(b)}
                  className="text-green-400 hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}