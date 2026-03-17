"use client";

import React, { useState } from "react";
import { Link2, X, Plus } from "lucide-react";
import { SectionCard } from "@/presentation/components/layout/profile/SectionCard";

import { SocialLink } from "@/types/profile";

interface LinksSectionProps {
  links: SocialLink[];
  onAdd?:    (link: SocialLink) => void;
  onRemove?: (id: string) => void;
}

const PLATFORMS = ["Dribble", "Instagram", "LinkedIn", "GitHub", "Portfolio", "Behance"];
const PLATFORM_COLORS: Record<string, string> = {
  Dribble:   "bg-pink-100 text-pink-700 border-pink-200",
  Instagram: "bg-orange-100 text-orange-700 border-orange-200",
  LinkedIn:  "bg-blue-100 text-blue-700 border-blue-200",
  GitHub:    "bg-gray-100 text-gray-700 border-gray-200",
  Portfolio: "bg-purple-100 text-purple-700 border-purple-200",
  Behance:   "bg-blue-100 text-blue-800 border-blue-200",
};

export function LinksSection({ links, onAdd, onRemove }: LinksSectionProps) {
  const [adding, setAdding]     = useState(false);
  const [platform, setPlatform] = useState("Dribble");
  const [url, setUrl]           = useState("");

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onAdd?.({ id: Date.now().toString(), platform, url: trimmed });
    setUrl("");
    setAdding(false);
  };

  const suggestions = PLATFORMS.filter(
    (p) => !links.some((l) => l.platform.toLowerCase() === p.toLowerCase())
  );

  return (
    <SectionCard title="Liên kết" icon={<Link2 size={16} />} isEmpty={false}>
      {/* Input row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Link2 size={14} />
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://your-link.com"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-300"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
        >
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Added links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-lg border ${
                PLATFORM_COLORS[link.platform] ?? "bg-gray-100 text-gray-700 border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {link.platform}
              <button
                onClick={(e) => { e.preventDefault(); onRemove?.(link.id); }}
                className="ml-0.5 opacity-70 hover:opacity-100 hover:text-red-500 transition-all"
              >
                <X size={11} />
              </button>
            </a>
          ))}
        </div>
      )}

      {/* Suggestion buttons */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 4).map((p) => (
            <button
              key={p}
              onClick={() => { setPlatform(p); setAdding(true); }}
              className="text-xs px-2.5 py-1 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              + {p}
            </button>
          ))}
          <span className="text-xs text-gray-400 self-center">Khác</span>
        </div>
      )}

      {url && (
        <button
          onClick={handleAdd}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} /> Thêm liên kết
        </button>
      )}
    </SectionCard>
  );
}