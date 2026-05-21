"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search, Clock, TrendingUp, Sparkles,
  Loader2, X, ArrowUpRight,
} from "lucide-react";
import { AISearchService } from "@/application/services/AISearchService";
import { AISearchRepository } from "@/infrastructure/repositories/AISearchRepository";
import { useAuth } from "@/application/contexts/AuthContext"; // thêm
import type { AutocompleteSuggestion } from "@/domain/models/AISearch";

const aiSearchService = new AISearchService(new AISearchRepository());

interface AISearchBoxProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function AISearchBox({
  placeholder = "Tìm kiếm việc làm, kỹ năng, công ty...",
  className = "",
  onSearch,
}: AISearchBoxProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth(); // thêm
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Autocomplete — không cần auth
  const { data: autocompleteData, isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ["ai", "autocomplete", debouncedQuery],
    queryFn: () => aiSearchService.getAutocomplete(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 1,
    staleTime: 2 * 60 * 1000,
  });

  // Track — chỉ fire nếu đã đăng nhập (service tự guard)
  const { mutate: trackSearch } = useMutation({
    mutationFn: (keyword: string) =>
      aiSearchService.trackSearch(keyword, isAuthenticated),
  });

  const suggestions = autocompleteData?.suggestions ?? [];

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      trackSearch(searchQuery.trim()); // service tự skip nếu chưa login
      setIsOpen(false);
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [router, onSearch, trackSearch],
  );

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.query);
    handleSearch(suggestion.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query.trim());
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getIcon = (type: AutocompleteSuggestion["type"]) => {
    switch (type) {
      case "RECENT":       return <Clock size={16} className="text-gray-400" />;
      case "TRENDING":     return <TrendingUp size={16} className="text-orange-400" />;
      case "AI_SUGGESTED": return <Sparkles size={16} className="text-purple-400" />;
    }
  };

  const getTypeLabel = (type: AutocompleteSuggestion["type"]) => {
    switch (type) {
      case "RECENT":       return "Gần đây";
      case "TRENDING":     return "Xu hướng";
      case "AI_SUGGESTED": return "AI gợi ý";
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 text-[15px] border border-gray-200 
            rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 
            focus:ring-blue-100 bg-white placeholder-gray-400 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 1 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border 
            border-gray-200 rounded-xl shadow-xl overflow-hidden z-50
            animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {isAutocompleteLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-[16px] text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              Đang tìm kiếm...
            </div>
          )}

          {!isAutocompleteLoading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-[16px] text-gray-400">
              Nhấn Enter để tìm "{query}"
            </div>
          )}

          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.query}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
                {getIcon(suggestion.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-gray-900 truncate">
                    {suggestion.query}
                  </span>
                  <ArrowUpRight size={12} className="text-gray-400 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{suggestion.reason}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      suggestion.type === "AI_SUGGESTED"
                        ? "bg-purple-100 text-purple-700"
                        : suggestion.type === "TRENDING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getTypeLabel(suggestion.type)}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      suggestion.relevanceScore >= 80
                        ? "bg-green-500"
                        : suggestion.relevanceScore >= 50
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                    }`}
                    style={{ width: `${suggestion.relevanceScore}%` }}
                  />
                </div>
              </div>
            </button>
          ))}

          {query.trim() && suggestions.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => handleSearch(query.trim())}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                  text-[14px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Search size={14} />
                Tìm kiếm "{query.trim()}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}