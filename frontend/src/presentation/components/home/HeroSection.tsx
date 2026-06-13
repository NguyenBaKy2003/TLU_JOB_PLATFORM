"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, ArrowRight, Star,
  Loader2, Clock, TrendingUp, ArrowUpRight,
  Globe, Briefcase, Users, Building2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { CITIES, POPULAR_SEARCHES } from "./constants";
import { AISearchService } from "@/application/services/AISearchService";
import { AISearchRepository } from "@/infrastructure/repositories/AISearchRepository";
import { useAuth } from "@/application/contexts/AuthContext";
import type { AutocompleteSuggestion } from "@/domain/models/AISearch";

const aiSearchService = new AISearchService(new AISearchRepository());

// ── Banner Slider ─────
// Replace src values with your actual banner image URLs
export const BANNERS = [
  { id: 1, src: "/banners/banner-1.png", alt: "Banner nhà tuyển dụng 1", href: "#" },
  { id: 2, src: "/banners/banner-2.png", alt: "Banner nhà tuyển dụng 2", href: "#" },
  { id: 3, src: "/banners/banner-3.png", alt: "Banner nhà tuyển dụng 3", href: "#" },
  { id: 4, src: "/banners/banner-4.png", alt: "Banner nhà tuyển dụng 4", href: "#" },
];

function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent((next + BANNERS.length) % BANNERS.length);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % BANNERS.length);
    }, 4000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handlePrev = () => { go(current - 1, -1); startTimer(); };
  const handleNext = () => { go(current + 1,  1); startTimer(); };

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative mx-auto max-w-2xl rounded-2xl overflow-hidden shadow-lg group">
      {/* Slides */}
      <div className="relative w-full" style={{ aspectRatio: "16/6" }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.a
            key={BANNERS[current].id}
            href={BANNERS[current].href}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 block"
            style={{ willChange: "transform" }}
          >
            <img
              src={BANNERS[current].src}
              alt={BANNERS[current].alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.a>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={handlePrev}
        aria-label="Ảnh trước"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
          bg-black/30 hover:bg-black/50 text-white flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={handleNext}
        aria-label="Ảnh tiếp"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
          bg-black/30 hover:bg-black/50 text-white flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i, i > current ? 1 : -1); startTimer(); }}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const ROTATING_WORDS = [
  { text: "Công Việc", color: "text-red-500" },
  { text: "Cơ Hội",   color: "text-blue-600" },
  { text: "Sự Nghiệp", color: "text-emerald-600" },
  { text: "Tương Lai", color: "text-violet-600" },
];

const STATS = [
  { icon: Briefcase,  value: "30,000+", label: "Việc làm đang tuyển" },
  { icon: Globe,      value: "5,000+",  label: "Tin đăng mỗi ngày"   },
  { icon: Users,      value: "25,000+", label: "Ứng viên đã có việc" },
  { icon: Building2,  value: "1,000+",  label: "Công ty đối tác"     },
];

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

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [keyword,       setKeyword]       = useState("");
  const [debouncedKw,   setDebouncedKw]   = useState("");
  const [wordIndex,     setWordIndex]     = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKw(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((p) => (p + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const { data: autocompleteData, isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ["ai", "autocomplete", debouncedKw],
    queryFn:  () => aiSearchService.getAutocomplete(debouncedKw),
    enabled:  debouncedKw.trim().length >= 1,
    staleTime: 2 * 60 * 1000,
  });

  const { mutate: trackSearch } = useMutation({
    mutationFn: (kw: string) => aiSearchService.trackSearch(kw, isAuthenticated),
  });

  const suggestions: AutocompleteSuggestion[] = autocompleteData?.suggestions ?? [];

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      trackSearch(searchQuery.trim());
      setIsOpen(false);
      const params = new URLSearchParams();
      params.set("keyword", searchQuery.trim());
      router.push(`/jobs?${params.toString()}`);
    },
    [router, trackSearch],
  );

  const handleSelectSuggestion = (s: AutocompleteSuggestion) => {
    setKeyword(s.query);
    handleSearch(s.query);
  };

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

  return (
    <section className="relative overflow-hidden bg-[#DFEAFE] pt-14 sm:pt-20 pb-0">
      {/* Decorative blob icons — hidden on mobile to avoid crowding */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hidden md:flex absolute left-6 lg:left-12 top-1/3 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-white/60 backdrop-blur-sm items-center justify-center shadow-sm">
          <Globe className="w-6 h-6 lg:w-9 lg:h-9 text-gray-400" />
        </div>
        <div className="hidden md:flex absolute left-10 lg:left-20 top-[52%] w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-white/60 backdrop-blur-sm items-center justify-center shadow-sm">
          <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div className="hidden md:flex absolute right-6 lg:right-12 top-1/3 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-white/60 backdrop-blur-sm items-center justify-center shadow-sm">
          <Globe className="w-6 h-6 lg:w-9 lg:h-9 text-gray-400" />
        </div>
        <div className="hidden md:flex absolute right-10 lg:right-20 top-[52%] w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-white/60 backdrop-blur-sm items-center justify-center shadow-sm">
          <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-4 gap-24 opacity-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-28 h-40 rounded-full bg-gray-400/50" />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6"
        >
          Tìm{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className={`inline-block ${ROTATING_WORDS[wordIndex].color}`}
            >
              {ROTATING_WORDS[wordIndex].text}
            </motion.span>
          </AnimatePresence>{" "}
          Mơ Ước Với<br />
          Những Cơ Hội Bứt Phá.
        </motion.h1>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="max-w-2xl mx-auto mb-3 sm:mb-4"
        >
          <div ref={wrapperRef} className="relative">
            {/* Mobile: stacked layout / Desktop: inline row */}
            <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-2xl shadow-lg border border-white overflow-visible">

              {/* Search input */}
              <div className="flex flex-1 items-center gap-3 px-4 sm:px-5 py-3 sm:py-4
                              border-b sm:border-b-0 border-gray-100">
                {isAutocompleteLoading
                  ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
                  : <Search  className="w-5 h-5 text-gray-400 shrink-0" />
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
                  placeholder="Chức danh, mức lương, hoặc công ty..."
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder:text-gray-400 text-[16px] sm:text-base"
                  autoComplete="off"
                />
              </div>

              {/* CTA button — full width on mobile */}
              <button
                onClick={() => handleSearch(keyword)}
                className="m-2 px-5 sm:px-7 py-3 bg-orange-500 hover:bg-orange-600
                           active:scale-95 text-white font-semibold rounded-xl
                           transition-all flex items-center justify-center gap-2
                           text-[16px] sm:text-[15px]"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isOpen && keyword.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -6,  scale: 0.99 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-[calc(100%+6px)] w-full z-50
                             bg-white border border-gray-100 rounded-2xl
                             shadow-xl overflow-hidden"
                >
                  {isAutocompleteLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-[16px] text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      Đang tìm kiếm...
                    </div>
                  )}

                  {!isAutocompleteLoading && suggestions.length === 0 && (
                    <div className="px-4 py-3 text-[16px] text-gray-400">
                      Nhấn Enter để tìm "{keyword}"
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
                            <span className="text-[16px] font-medium text-gray-800 truncate">{s.query}</span>
                            <ArrowUpRight size={12} className="text-gray-300 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.reason && (
                              <span className="text-xs text-gray-400 truncate">{s.reason}</span>
                            )}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        {/* Hide relevance bar on very small screens */}
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

                  {keyword.trim() && suggestions.length > 0 && (
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onMouseDown={() => handleSearch(keyword.trim())}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl
                          text-[16px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
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

        {/* Popular tags */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 mb-7 sm:mb-10 px-2"
        >
          <span className="text-gray-500 text-xs sm:text-[16px] w-full sm:w-auto">Danh mục phổ biến:</span>
          {POPULAR_SEARCHES.map((tag, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(tag); handleSearch(tag); }}
              className="px-3 py-1 text-xs sm:text-[16px] text-blue-700 underline underline-offset-2 hover:text-blue-900 transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Banner slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
          className="px-0 sm:px-0"
        >
          <BannerSlider />
        </motion.div>

         <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-6 sm:mt-8  border-t border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* 2-col on mobile, 4-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <div
                key={i}
                className={`flex flex-col items-center py-5 sm:py-6 px-3 sm:px-4
                  ${i % 2 !== 0 ? "border-l border-gray-200" : ""}
                  ${i < 2 ? "border-b sm:border-b-0 border-gray-200" : ""}
                  sm:border-l sm:first:border-l-0`}
              >
                <span className="text-gray-500 text-xs sm:text-[16px] mb-1 text-center leading-tight">{label}</span>
                <span className="text-gray-900 font-extrabold text-xl sm:text-2xl">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      </div>

     
    </section>
  );
}