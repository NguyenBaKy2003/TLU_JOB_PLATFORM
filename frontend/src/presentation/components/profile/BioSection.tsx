"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

const MAX_LENGTH = 512;

interface BioSectionProps {
  value?: string;
  onChange?: (val: string) => void;
}

export function BioSection({ value = "", onChange }: BioSectionProps) {
  const [text, setText] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_LENGTH);
    setText(val);
    onChange?.(val);
  };

  return (
    <SectionCard title="Giới thiệu bản thân" icon={<FileText size={16} />} isEmpty={false}>
      <div className="space-y-2">
        <label className="text-[11px] text-gray-400">Tóm tắt hồ sơ</label>
        <textarea
          rows={4}
          value={text}
          onChange={handleChange}
          placeholder="write about yourself"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-300 leading-relaxed"
        />
        <div className="flex justify-end">
          <span
            className={`text-[11px] tabular-nums ${
              text.length >= MAX_LENGTH ? "text-red-500" : "text-gray-400"
            }`}
          >
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}