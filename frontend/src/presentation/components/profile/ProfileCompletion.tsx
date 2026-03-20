"use client";

import React from "react";

interface CompletionItem {
  label:   string;
  percent: number;
  done:    boolean;
}

interface ProfileCompletionProps {
  percent?:  number | null;   
  items?:    CompletionItem[];
}

const DEFAULT_ITEMS: CompletionItem[] = [
  { label: "Hoàn thành chức danh công việc", percent: 5, done: false },
  { label: "Hoàn thiện thông tin cá nhân",   percent: 5, done: false },
  { label: "Thêm kinh nghiệm làm việc",       percent: 5, done: false },
];

const RADIUS       = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileCompletion({
  percent = 0,
  items   = DEFAULT_ITEMS,
}: ProfileCompletionProps) {
  const safePercent = Math.min(100, Math.max(0, percent ?? 0));
  const offset      = CIRCUMFERENCE - (safePercent / 100) * CIRCUMFERENCE;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Hoàn Thiện Hồ Sơ</h3>

      {/* Circle progress */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={RADIUS} fill="none"
              stroke="#f3f4f6" strokeWidth="8" />
            <circle cx="50" cy="50" r={RADIUS} fill="none"
              stroke="#2563eb" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{safePercent}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 text-center mb-4">
        Hồ sơ của bạn mới hoàn thành{" "}
        <span className="font-semibold text-gray-700">{safePercent}%</span>! Hãy cải thiện nhé.
      </p>

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              item.done ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
            }`}>
              +{item.percent}%
            </span>
            <span className={`text-xs ${item.done ? "text-gray-400 line-through" : "text-gray-600"}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}