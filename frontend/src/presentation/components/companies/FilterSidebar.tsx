// src/presentation/components/companies/FilterSidebar.tsx
"use client";
import { useState } from "react";
import { 
  ChevronUp, ChevronDown, X, 
  Coffee, Gift, Heart, Car, Home, Plane,
  Users, Briefcase, TrendingUp, Award, Zap,
  Filter, SlidersHorizontal, RotateCcw, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanyFilters } from "./types";

interface Props {
  filters: CompanyFilters;
  onChange: (f: CompanyFilters) => void;
  activeTagsDisplay: { label: string; key: string }[];
  onRemoveTag: (key: string) => void;
  onClearAll?: () => void;
}

// Icon mapping cho benefits
const benefitIcons: Record<string, any> = {
  "Bảo hiểm sức khỏe": Heart,
  "Du lịch hàng năm": Plane,
  "Đào tạo chuyên sâu": TrendingUp,
  "Lương thưởng hấp dẫn": Award,
  "Cơ hội thăng tiến": Zap,
  "Làm việc từ xa": Home,
  "Xe đưa đón": Car,
  "Ăn trưa miễn phí": Coffee,
  "Quà tặng dịp lễ": Gift,
};

function FilterSection({ 
  title, 
  children, 
  defaultOpen = true,
  icon: Icon,
  count
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  icon?: any;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <motion.div 
      className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0"
      initial={false}
    >
      <button 
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {count !== undefined && count > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 rounded-full"
            >
              {count}
            </motion.span>
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={15} className="text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FilterSidebar({ 
  filters, 
  onChange, 
  activeTagsDisplay, 
  onRemoveTag,
  onClearAll 
}: Props) {
  const toggleBenefit = (b: string) => {
    const next = filters.benefits.includes(b)
      ? filters.benefits.filter(x => x !== b)
      : [...filters.benefits, b];
    onChange({ ...filters, benefits: next });
  };

  const hasActiveFilters = filters.benefits.length > 0 || 
                           filters.gender !== "" || 
                           filters.companySize !== "";

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      // Default clear all
      onChange({
        benefits: [],
        gender: "",
        companySize: "",
      });
    }
  };

  return (
    <aside className="w-64 shrink-0">
      {/* Header with gradient */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Bộ lọc</h3>
          </div>
          
          {/* Clear All Button in Header */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium
                text-red-600 bg-red-50 rounded-lg hover:bg-red-100 
                transition-all duration-200 group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Xóa tất cả
            </motion.button>
          )}
        </div>
        
        {/* Active filters */}
        <AnimatePresence>
          {activeTagsDisplay.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Đang áp dụng ({activeTagsDisplay.length})
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Xóa tất cả
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTagsDisplay.map(tag => (
                  <motion.span
                    key={tag.key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    layout
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full
                      border border-blue-100 shadow-sm"
                  >
                    {tag.label}
                    <button
                      onClick={() => onRemoveTag(tag.key)}
                      className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Benefits Section */}
      <FilterSection 
        title="Phúc lợi" 
        icon={Gift}
        count={filters.benefits.length}
      >
        <div className="space-y-3">
          {BENEFIT_OPTIONS.map(b => {
            const Icon = benefitIcons[b] || Heart;
            const isSelected = filters.benefits.includes(b);
            
            return (
              <motion.label
                key={b}
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-2.5 cursor-pointer group
                  p-2 rounded-lg transition-all duration-200
                  ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => toggleBenefit(b)}
              >
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected 
                    ? "border-blue-500 bg-blue-500 shadow-sm" 
                    : "border-gray-300 group-hover:border-blue-400"}
                `}>
                  {isSelected && (
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      viewBox="0 0 12 12" 
                      className="w-3 h-3"
                    >
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </motion.svg>
                  )}
                </div>
                <Icon className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`text-sm transition-colors ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {b}
                </span>
              </motion.label>
            );
          })}
        </div>
      </FilterSection>

      {/* Gender Section */}
      <FilterSection title="Giới tính" icon={Users}>
        <div className="space-y-2.5">
          {[
            { value: "Nam", label: "Nam", icon: "👨" },
            { value: "Nữ", label: "Nữ", icon: "👩" },
            { value: "Khác", label: "Khác", icon: "👥" }
          ].map(g => {
            const isSelected = filters.gender === g.value;
            
            return (
              <motion.label
                key={g.value}
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 cursor-pointer group
                  p-2 rounded-lg transition-all duration-200
                  ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => onChange({ 
                  ...filters, 
                  gender: filters.gender === g.value ? "" : g.value 
                })}
              >
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected 
                    ? "border-blue-500 bg-blue-500 shadow-sm" 
                    : "border-gray-300 group-hover:border-blue-400"}
                `}>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white" 
                    />
                  )}
                </div>
                <span className="text-lg">{g.icon}</span>
                <span className={`text-sm transition-colors ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {g.label}
                </span>
              </motion.label>
            );
          })}
        </div>
      </FilterSection>

      {/* Company Size Section */}
      <FilterSection title="Quy mô công ty" icon={Briefcase}>
        <div className="space-y-2.5">
          {SIZE_OPTIONS.map(({ label, value }) => {
            const isSelected = filters.companySize === value;
            
            return (
              <motion.label
                key={value}
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 cursor-pointer group
                  p-2 rounded-lg transition-all duration-200
                  ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => onChange({ 
                  ...filters, 
                  companySize: filters.companySize === value ? "" : value 
                })}
              >
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected 
                    ? "border-blue-500 bg-blue-500 shadow-sm" 
                    : "border-gray-300 group-hover:border-blue-400"}
                `}>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white" 
                    />
                  )}
                </div>
                <span className={`text-sm transition-colors ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {label}
                </span>
              </motion.label>
            );
          })}
        </div>
      </FilterSection>

      {/* Results Count & Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="space-y-2">
            <p className="text-xs text-center">
              <span className="font-semibold text-blue-600">
                {BENEFIT_OPTIONS.length} phúc lợi
              </span>
              {" • "}
              <span className="font-semibold text-blue-600">
                {SIZE_OPTIONS.length} quy mô
              </span>
            </p>
            
            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-blue-100">
                <p className="text-[10px] text-center text-blue-600">
                  Đang lọc theo {[
                    filters.benefits.length > 0 && `${filters.benefits.length} phúc lợi`,
                    filters.gender && `giới tính ${filters.gender}`,
                    filters.companySize && `quy mô ${SIZE_OPTIONS.find(s => s.value === filters.companySize)?.label}`
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mock data
const BENEFIT_OPTIONS = [
  "Bảo hiểm sức khỏe",
  "Du lịch hàng năm",
  "Đào tạo chuyên sâu",
  "Lương thưởng hấp dẫn",
  "Cơ hội thăng tiến",
  "Làm việc từ xa",
  "Xe đưa đón",
  "Ăn trưa miễn phí",
  "Quà tặng dịp lễ",
];

const SIZE_OPTIONS = [
  { label: "Dưới 50 nhân viên", value: "small" },
  { label: "50 - 200 nhân viên", value: "medium" },
  { label: "200 - 500 nhân viên", value: "large" },
  { label: "Trên 500 nhân viên", value: "enterprise" },
];