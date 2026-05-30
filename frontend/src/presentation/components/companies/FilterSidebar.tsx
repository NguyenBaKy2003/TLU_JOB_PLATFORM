// src/presentation/components/companies/FilterSidebar.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown, Award, Briefcase,
  SlidersHorizontal, Trash2, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanySize, CompanyPlanCode } from "@/domain/models/Company";
import { COMPANY_SIZE_LABELS, PLAN_BADGE_CONFIG } from "@/domain/models/Company";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompanySearchFilters {
  keyword?:   string;
  city?:      string;
  size?:      CompanySize | "";
  planCode?:  CompanyPlanCode | "";
  minRating?: number | null;
}

export const EMPTY_FILTERS: CompanySearchFilters = {
  keyword:   "",
  city:      "",
  size:      "",
  planCode:  "",
  minRating: null,
};

interface Props {
  filters:     CompanySearchFilters;
  onChange:    (f: CompanySearchFilters) => void;
  onClearAll?: () => void;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SIZE_OPTIONS: { label: string; value: CompanySize }[] = [
  { label: COMPANY_SIZE_LABELS.STARTUP,     value: "STARTUP"     },
  { label: COMPANY_SIZE_LABELS.SMALL,       value: "SMALL"       },
  { label: COMPANY_SIZE_LABELS.MEDIUM,      value: "MEDIUM"      },
  { label: COMPANY_SIZE_LABELS.LARGE,       value: "LARGE"       },
  { label: COMPANY_SIZE_LABELS.ENTERPRISE,  value: "ENTERPRISE"  },
  { label: COMPANY_SIZE_LABELS.CORPORATION, value: "CORPORATION" },
];

const PLAN_OPTIONS: { label: string; value: Exclude<CompanyPlanCode, "FREE_COMPANY"> }[] = [
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Business",   value: "BUSINESS"   },
  { label: "Starter",    value: "STARTER"    },
];

const RATING_OPTIONS = [
  { label: "4.5 sao trở lên", value: 4.5 },
  { label: "4.0 sao trở lên", value: 4.0 },
  { label: "3.5 sao trở lên", value: 3.5 },
  { label: "3.0 sao trở lên", value: 3.0 },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({
  title, icon: Icon, children, defaultOpen = true,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
          <span className="text-xs font-semibold text-gray-700">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={13} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RadioRow({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg
        text-left transition-colors duration-150
        ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
        shrink-0 transition-colors
        ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-xs transition-colors
        ${selected ? "text-blue-700 font-medium" : "text-gray-600"}`}>
        {label}
      </span>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function FilterSidebar({ filters, onChange, onClearAll }: Props) {
  const hasActive =
    !!filters.size ||
    !!filters.planCode ||
    (filters.minRating != null && filters.minRating > 0);

  const activeCount = [
    filters.size,
    filters.planCode,
    filters.minRating != null && filters.minRating > 0 ? 1 : 0,
  ].filter(Boolean).length;

  const clear = () => {
    onChange(EMPTY_FILTERS);
    onClearAll?.();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold
              bg-blue-100 text-blue-700 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {hasActive && (
          <button
            onClick={clear}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium
              text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Xóa
          </button>
        )}
      </div>

      {/* Plan tier */}
      <FilterSection title="Gói dịch vụ" icon={Award} defaultOpen>
        <div className="space-y-0.5">
          {PLAN_OPTIONS.map(p => {
            const cfg = PLAN_BADGE_CONFIG[p.value];
            return (
              <RadioRow
                key={p.value}
                label={p.label}
                selected={filters.planCode === p.value}
                onClick={() => onChange({
                  ...filters,
                  planCode: filters.planCode === p.value ? "" : p.value,
                })}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Đánh giá tối thiểu" icon={Star} defaultOpen>
        <div className="space-y-0.5">
          {RATING_OPTIONS.map(r => (
            <RadioRow
              key={r.value}
              label={r.label}
              selected={filters.minRating === r.value}
              onClick={() => onChange({
                ...filters,
                minRating: filters.minRating === r.value ? null : r.value,
              })}
            />
          ))}
        </div>
        {filters.minRating != null && filters.minRating > 0 && (
          <div className="mt-2 flex items-center gap-0.5 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(filters.minRating!)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200 fill-gray-200"
                }
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">trở lên</span>
          </div>
        )}
      </FilterSection>

      {/* Company size */}
      <FilterSection title="Quy mô" icon={Briefcase} defaultOpen={false}>
        <div className="space-y-0.5">
          {SIZE_OPTIONS.map(s => (
            <RadioRow
              key={s.value}
              label={s.label}
              selected={filters.size === s.value}
              onClick={() => onChange({
                ...filters,
                size: filters.size === s.value ? "" : s.value,
              })}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}