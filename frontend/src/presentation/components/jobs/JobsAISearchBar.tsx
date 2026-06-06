"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, MapPin, X,
  Loader2, Clock, TrendingUp, Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { AISearchService }    from "@/application/services/AISearchService";
import { AISearchRepository } from "@/infrastructure/repositories/AISearchRepository";
import { useAuth }            from "@/application/contexts/AuthContext";
import type { AutocompleteSuggestion } from "@/domain/models/AISearch";

const aiSearchService = new AISearchService(new AISearchRepository());

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSuggestionIcon(type: AutocompleteSuggestion["type"]) {
  switch (type) {
    case "RECENT":       return <Clock      size={14} className="text-gray-400" />;
    case "TRENDING":     return <TrendingUp size={14} className="text-orange-500" />;
    case "AI_SUGGESTED": return <Sparkles   size={14} className="text-violet-500" />;
  }
}

function getSuggestionBadge(type: AutocompleteSuggestion["type"]) {
  switch (type) {
    case "RECENT":       return { label: "Gần đây",  cls: "bg-gray-100 text-gray-500" };
    case "TRENDING":     return { label: "Xu hướng", cls: "bg-orange-100 text-orange-600" };
    case "AI_SUGGESTED": return { label: "AI gợi ý", cls: "bg-violet-100 text-violet-600" };
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface JobsAISearchBarProps {
  keyword: string;
  city: string;
  onSearch: (keyword: string, city: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JobsAISearchBar({ keyword, city, onSearch }: JobsAISearchBarProps) {
  const { isAuthenticated } = useAuth();

  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const [draftCity,    setDraftCity]    = useState(city);

  // Sync khi parent thay đổi (URL navigation, handleClearAll…)
  useEffect(() => { setDraftKeyword(keyword); }, [keyword]);
  useEffect(() => { setDraftCity(city); },      [city]);

  const [debouncedKw,   setDebouncedKw]   = useState(keyword);
  const [isOpen,        setIsOpen]        = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce keyword cho autocomplete
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKw(draftKeyword), 300);
    return () => clearTimeout(t);
  }, [draftKeyword]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Autocomplete query
  const { data: autocompleteData, isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ["ai", "autocomplete", "jobs", debouncedKw],
    queryFn:  () => aiSearchService.getAutocomplete(debouncedKw),
    enabled:  debouncedKw.trim().length >= 1,
    staleTime: 2 * 60 * 1000,
  });

  const { mutate: trackSearch } = useMutation({
    mutationFn: (kw: string) => aiSearchService.trackSearch(kw, isAuthenticated),
  });

  const suggestions: AutocompleteSuggestion[] = autocompleteData?.suggestions ?? [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearch = useCallback((kw: string, ct?: string) => {
    if (kw.trim()) trackSearch(kw.trim());
    setIsOpen(false);
    onSearch(kw.trim(), ct ?? draftCity);
  }, [draftCity, onSearch, trackSearch]);

  const handleSelectSuggestion = (s: AutocompleteSuggestion) => {
    setDraftKeyword(s.query);
    handleSearch(s.query, draftCity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch(draftKeyword);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(p => (p < suggestions.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(p => (p > 0 ? p - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch(draftKeyword);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="relative max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row rounded-2xl border border-white/20
        bg-white shadow-2xl">

        {/* Keyword input */}
        <div className="flex items-center gap-2 flex-1 px-4 py-3.5
          border-b sm:border-b-0 sm:border-r border-gray-100">
          {isAutocompleteLoading
            ? <Loader2 size={16} className="text-gray-400 animate-spin shrink-0" />
            : <Search  size={16} className="text-gray-400 shrink-0" />
          }
          <input
            value={draftKeyword}
            onChange={e => {
              setDraftKeyword(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tên công việc, kỹ năng, công ty..."
            className="flex-1 text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none bg-transparent"
            autoComplete="off"
          />
          {draftKeyword && (
            <button
              onClick={() => { setDraftKeyword(""); setIsOpen(false); }}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* City — free-text input (không dùng select) */}
        <div className="flex items-center gap-2 px-4 py-3.5
          border-b sm:border-b-0 sm:border-r border-gray-100 sm:w-48">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <input
            value={draftCity}
            onChange={e => setDraftCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(draftKeyword)}
            placeholder="Địa điểm"
            className="flex-1 text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none bg-transparent"
          />
          {draftCity && (
            <button
              onClick={() => setDraftCity("")}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={() => handleSearch(draftKeyword)}
          className="flex items-center justify-center gap-2 px-7 py-3.5
            bg-blue-600 text-white text-sm font-semibold
            hover:bg-blue-700 active:bg-blue-800 transition-colors
            rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl"
        >
          <Search size={15} /> Tìm kiếm
        </button>
      </div>

      {/* ── AI Autocomplete Dropdown ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && draftKeyword.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6,  scale: 0.99 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 top-[calc(100%+6px)] w-full z-50
              bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
          >
            {isAutocompleteLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Đang tìm kiếm...
              </div>
            )}

            {!isAutocompleteLoading && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400">
                Nhấn Enter để tìm "{draftKeyword}"
              </div>
            )}

            {suggestions.map((s, i) => {
              const badge = getSuggestionBadge(s.type);
              return (
                <button
                  key={`${s.type}-${s.query}`}
                  onMouseDown={() => handleSelectSuggestion(s)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${i === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                    {getSuggestionIcon(s.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{s.query}</span>
                      <ArrowUpRight size={12} className="text-gray-300 flex-shrink-0" />
                    </div>
                    {s.reason && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">{s.reason}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block flex-shrink-0 w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.relevanceScore >= 80 ? "bg-green-500"
                        : s.relevanceScore >= 50 ? "bg-yellow-400"
                        : "bg-gray-300"
                      }`}
                      style={{ width: `${s.relevanceScore}%` }}
                    />
                  </div>
                </button>
              );
            })}

            {draftKeyword.trim() && suggestions.length > 0 && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onMouseDown={() => handleSearch(draftKeyword.trim())}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl
                    text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Search size={14} />
                  Tìm kiếm "{draftKeyword.trim()}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}