"use client";

import React, { useState } from "react";
import { Link2, X, Plus } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";
import { SocialLink } from "@/types/profile";

interface LinksSectionProps {
  links: SocialLink[];
  onAdd?: (link: SocialLink) => void;
  onRemove?: (id: string) => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Dribble:   <span className="w-3 h-3 rounded-full bg-pink-500 flex-shrink-0" />,
  Instagram: <span className="text-[10px]">📷</span>,
  LinkedIn:  <span className="text-[10px]">in</span>,
  GitHub:    <span className="text-[10px]">GH</span>,
  Portfolio: <span className="text-[10px]">🌐</span>,
  Behance:   <span className="text-[10px]">Be</span>,
};

const PLATFORM_COLORS: Record<string, string> = {
  Dribble:   "bg-pink-50 text-pink-700 border-pink-200",
  Instagram: "bg-orange-50 text-orange-700 border-orange-200",
  LinkedIn:  "bg-blue-50 text-blue-700 border-blue-200",
  GitHub:    "bg-gray-100 text-gray-700 border-gray-200",
  Portfolio: "bg-purple-50 text-purple-700 border-purple-200",
  Behance:   "bg-blue-50 text-blue-800 border-blue-200",
};

const PLATFORMS = Object.keys(PLATFORM_COLORS);

export function LinksSection({ links, onAdd, onRemove }: LinksSectionProps) {
  const [input, setInput] = useState("");

  const handleAdd = (platformName?: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // Try to detect platform from URL or use provided
    const detected = platformName ?? PLATFORMS.find((p) =>
      trimmed.toLowerCase().includes(p.toLowerCase())
    ) ?? "Portfolio";
    onAdd?.({ id: Date.now().toString(), platform: detected, url: trimmed });
    setInput("");
  };

  const remaining = PLATFORMS.filter(
    (p) => !links.some((l) => l.platform.toLowerCase() === p.toLowerCase())
  );

  return (
    <SectionCard title="Liên kết" icon={<Link2 size={16} />} isEmpty={false}>
      <div className="space-y-3">
        {/* Floating input */}
        <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">
            Mạng xã hội
          </label>
          <input
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Input"
            className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5"
          />
        </div>

        {/* Added link tags */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <span
                key={link.id}
                className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border ${
                  PLATFORM_COLORS[link.platform] ?? "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {PLATFORM_ICONS[link.platform]}
                {link.platform}
                <button
                  onClick={() => onRemove?.(link.id)}
                  className="ml-0.5 opacity-70 hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* + Khác */}
        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus size={15} /> Khác
        </button>
      </div>
    </SectionCard>
  );
}