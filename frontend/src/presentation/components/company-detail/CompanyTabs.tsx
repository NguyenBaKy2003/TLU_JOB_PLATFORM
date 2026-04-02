// src/presentation/components/company-detail/CompanyTabs.tsx
"use client";
import { useState } from "react";

const TABS = [
  { id: "intro",     label: "Giới thiệu"        },
  { id: "team",      label: "Đội ngũ nhân viên"  },
  { id: "overview",  label: "Tổng quan"           },
  { id: "jobs",      label: "Việc làm đang tuyển" },
];

interface Props {
  active:   string;
  onChange: (id: string) => void;
}

export function CompanyTabs({ active, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                active === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}