"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Sparkles, ArrowRight, Star,
  Loader2, Clock, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { CITIES, POPULAR_SEARCHES } from "./constants";
import { FloatingElements } from "./FloatingElements";
import { AISearchService } from "@/application/services/AISearchService";
import { AISearchRepository } from "@/infrastructure/repositories/AISearchRepository";
import { useAuth } from "@/application/contexts/AuthContext";
import type { AutocompleteSuggestion } from "@/domain/models/AISearch";

// ── Singleton service (tương tự AISearchBox) ────────────────────────────────
const aiSearchService = new AISearchService(new AISearchRepository());

// ── Rotating words ───────────────────────────────────────────────────────────
const ROTATING_WORDS = [
  { text: "CHẤT LƯỢNG", gradient: "from-blue-400 to-cyan-400" },
  { text: "PHÙ HỢP",    gradient: "from-purple-400 to-pink-400" },
  { text: "UY TÍN",     gradient: "from-emerald-400 to-teal-400" },
  { text: "NHANH CHÓNG",gradient: "from-orange-400 to-amber-400" },
];

// ── Helpers (giống AISearchBox) ──────────────────────────────────────────────
function getSuggestionIcon(type: AutocompleteSuggestion["type"]) {
  switch (type) {
    case "RECENT":       return <Clock      size={14} className="text-white/40" />;
    case "TRENDING":     return <TrendingUp size={14} className="text-orange-400" />;
    case "AI_SUGGESTED": return <Sparkles   size={14} className="text-purple-400" />;
  }
}

function getSuggestionBadge(type: AutocompleteSuggestion["type"]) {
  switch (type) {
    case "RECENT":       return { label: "Gần đây",  cls: "bg-white/10 text-white/50" };
    case "TRENDING":     return { label: "Xu hướng", cls: "bg-orange-500/20 text-orange-300" };
    case "AI_SUGGESTED": return { label: "AI gợi ý", cls: "bg-purple-500/20 text-purple-300" };
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [keyword,       setKeyword]       = useState("");
  const [debouncedKw,   setDebouncedKw]   = useState("");
  const [location,      setLocation]      = useState("");
  const [wordIndex,     setWordIndex]     = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Debounce keyword (300 ms, giống AISearchBox) ─────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKw(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  // ── Rotating words ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((p) => (p + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // ── Click-outside (giống AISearchBox) ────────────────────────────────────
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── useQuery: autocomplete (giống AISearchBox) ────────────────────────────
  const { data: autocompleteData, isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ["ai", "autocomplete", debouncedKw],
    queryFn:  () => aiSearchService.getAutocomplete(debouncedKw),
    enabled:  debouncedKw.trim().length >= 1,
    staleTime: 2 * 60 * 1000,
  });

  // ── useMutation: trackSearch (giống AISearchBox) ──────────────────────────
  const { mutate: trackSearch } = useMutation({
    mutationFn: (kw: string) => aiSearchService.trackSearch(kw, isAuthenticated),
  });

  const suggestions: AutocompleteSuggestion[] = autocompleteData?.suggestions ?? [];

  // ── handleSearch ──────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      trackSearch(searchQuery.trim());
      setIsOpen(false);
      const params = new URLSearchParams();
      params.set("keyword", searchQuery.trim());
      if (location) params.set("location", location);
      router.push(`/jobs?${params.toString()}`);
    },
    [router, location, trackSearch],
  );

  const handleSelectSuggestion = (s: AutocompleteSuggestion) => {
    setKeyword(s.query);
    handleSearch(s.query);
  };

  // ── Keyboard nav (giống AISearchBox) ─────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && keyword.trim()) handleSearch(keyword.trim());
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (keyword.trim()) {
          handleSearch(keyword.trim());
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
      <FloatingElements />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-white/80 text-[16px] font-medium">Nền tảng tuyển dụng #1 Việt Nam</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Tìm Việc Làm{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className={`bg-gradient-to-r ${ROTATING_WORDS[wordIndex].gradient} bg-clip-text text-transparent inline-block`}
            >
              {ROTATING_WORDS[wordIndex].text}
            </motion.span>
          </AnimatePresence>
          <br />
          <span className="text-white/90">Cùng Joblin</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Kết nối trực tiếp với nhà tuyển dụng qua livestream,
          phỏng vấn realtime và tìm kiếm công việc phù hợp nhất với bạn.
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          {/* ── Click-outside wrapper ── */}
          <div ref={wrapperRef} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />

            <div className="relative flex flex-col sm:flex-row bg-white/10 backdrop-blur-md rounded-2xl overflow-visible border border-white/20">

              {/* Keyword input */}
              <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/10">
                {isAutocompleteLoading
                  ? <Loader2 className="w-5 h-5 text-white/60 animate-spin shrink-0" />
                  : <Search  className="w-5 h-5 text-white/60 shrink-0" />
                }
                <input
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setIsOpen(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tên công việc, kỹ năng..."
                  className="flex-1 outline-none bg-transparent text-white placeholder:text-white/40"
                  autoComplete="off"
                />
              </div>

              {/* Location select */}
              <div className="flex items-center gap-2 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <MapPin className="w-5 h-5 text-white/60 shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-white cursor-pointer"
                >
                  <option value="" className="bg-[#1a1a2e]">Địa điểm</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city} className="bg-[#1a1a2e]">{city}</option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <button
                onClick={() => handleSearch(keyword)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* ── Autocomplete Dropdown (style của AISearchBox, màu dark) ── */}
            <AnimatePresence>
              {isOpen && keyword.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -8,  scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-[calc(100%+8px)] w-full sm:w-[calc(100%-theme(spacing.32))] z-50
                             bg-[#1a1a2e]/95 backdrop-blur-md border border-white/15 rounded-xl
                             shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* Loading */}
                  {isAutocompleteLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/40">
                      <Loader2 size={14} className="animate-spin" />
                      Đang tìm kiếm...
                    </div>
                  )}

                  {/* Empty */}
                  {!isAutocompleteLoading && suggestions.length === 0 && (
                    <div className="px-4 py-3 text-sm text-white/40">
                      Nhấn Enter để tìm "{keyword}"
                    </div>
                  )}

                  {/* Suggestion items (giống AISearchBox) */}
                  {suggestions.map((s, i) => {
                    const badge = getSuggestionBadge(s.type);
                    return (
                      <button
                        key={`${s.type}-${s.query}`}
                        onMouseDown={() => handleSelectSuggestion(s)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                          ${i === selectedIndex ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10">
                          {getSuggestionIcon(s.type)}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{s.query}</span>
                            <ArrowUpRight size={12} className="text-white/30 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.reason && (
                              <span className="text-xs text-white/30 truncate">{s.reason}</span>
                            )}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>

                        {/* Relevance bar */}
                        <div className="flex-shrink-0 w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.relevanceScore >= 80 ? "bg-green-500"
                              : s.relevanceScore >= 50 ? "bg-yellow-500"
                              : "bg-white/20"
                            }`}
                            style={{ width: `${s.relevanceScore}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}

                  {/* "Tìm kiếm X" footer (giống AISearchBox) */}
                  {keyword.trim() && suggestions.length > 0 && (
                    <div className="border-t border-white/10 p-2">
                      <button
                        onMouseDown={() => handleSearch(keyword.trim())}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                          text-sm font-medium text-blue-400 hover:bg-white/5 transition-colors"
                      >
                        <Search size={14} />
                        Tìm kiếm "{keyword.trim()}"
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Popular searches */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          <span className="text-white/40 text-[16px]">Phổ biến:</span>
          {POPULAR_SEARCHES.map((tag, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(tag); handleSearch(tag); }}
              className="px-3 py-1.5 text-[16px] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-[#1a1a2e] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">U{i}</span>
                </div>
              ))}
            </div>
            <span className="text-white/60 text-[16px]">+420,000 người dùng</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-white/60 text-[16px] ml-2">4.9/5 từ 10,000+ đánh giá</span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}