"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

const MAX_LENGTH = 512;

interface BioSectionProps {
  value?:    string | null;
  onChange?: (val: string) => void;
}

export function BioSection({ value = "", onChange }: BioSectionProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText]       = useState(value ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_LENGTH);
    setText(val);
  };

  const handleSave = () => {
    onChange?.(text);
    setEditing(false);
  };

  return (
    <SectionCard
      title="Giới thiệu bản thân"
      icon={<FileText size={16} />}
      isEmpty={false}
      onEdit={() => setEditing(true)}
    >
      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={text}
            onChange={handleChange}
            autoFocus
            placeholder="Giới thiệu về bản thân bạn..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-300 leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className={`text-[11px] tabular-nums ${text.length >= MAX_LENGTH ? "text-red-500" : "text-gray-400"}`}>
              {text.length}/{MAX_LENGTH}
            </span>
            <div className="flex gap-2">
              <button onClick={handleSave}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                Lưu
              </button>
              <button onClick={() => { setText(value ?? ""); setEditing(false); }}
                className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {text || <span className="text-gray-400 italic">Chưa có giới thiệu.</span>}
        </p>
      )}
    </SectionCard>
  );
}