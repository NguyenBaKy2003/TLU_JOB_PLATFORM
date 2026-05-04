// src/presentation/components/jobs/JobFilterSidebar.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, X, Filter, 
  Calendar, Briefcase, TrendingUp, MapPin, 
  DollarSign, RotateCcw, SlidersHorizontal,
  Clock, Building2, Users, Award
} from "lucide-react";
import type { JobType, JobLevel } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from "@/domain/models/Job";

export interface JobFilters {
  jobTypes:      JobType[];
  levels:        JobLevel[];
  minSalary:     string;
  maxSalary:     string;
  workLocType:   string;
  postedWithin:  string;
}

export const EMPTY_FILTERS: JobFilters = {
  jobTypes: [], levels: [], minSalary: "", maxSalary: "",
  workLocType: "", postedWithin: "",
};

interface Props {
  filters:  JobFilters;
  onChange: (f: JobFilters) => void;
  onClearAll?: () => void;
}

// ── Accordion section với animation ────────────
function Section({ 
  title, 
  children, 
  icon: Icon,
  defaultOpen = true,
  count = 0
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: any;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <motion.div 
      className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
      initial={false}
    >
      <button 
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {count > 0 && (
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

// ── Checkbox row với thiết kế đẹp ──────────────
function CheckRow({ label, checked, onChange, icon }: {
  label: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
  icon?: string;
}) {
  return (
    <motion.label
      whileHover={{ x: 4 }}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div 
        onClick={() => onChange(!checked)}
        className={`
          w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-all
          ${checked 
            ? "border-blue-500 bg-blue-500 shadow-sm" 
            : "border-gray-300 group-hover:border-blue-400"
          }
        `}
      >
        {checked && (
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
      {icon && <span className="text-base">{icon}</span>}
      <span className={`text-sm transition-colors ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
    </motion.label>
  );
}

// ── Radio row ─────────────
function RadioRow({ label, checked, onChange, icon }: {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: string;
}) {
  return (
    <motion.label
      whileHover={{ x: 4 }}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
      onClick={onChange}
    >
      <div className={`
        w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
        ${checked 
          ? "border-blue-500" 
          : "border-gray-300 group-hover:border-blue-400"
        }
      `}>
        {checked && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2.5 h-2.5 rounded-full bg-blue-500" 
          />
        )}
      </div>
      {icon && <span className="text-base">{icon}</span>}
      <span className={`text-sm transition-colors ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
    </motion.label>
  );
}

// ── Main component ───────
export function JobFilterSidebar({ filters, onChange, onClearAll }: Props) {
  const toggleJobType = (t: JobType) => {
    const next = filters.jobTypes.includes(t)
      ? filters.jobTypes.filter(x => x !== t)
      : [...filters.jobTypes, t];
    onChange({ ...filters, jobTypes: next });
  };

  const toggleLevel = (l: JobLevel) => {
    const next = filters.levels.includes(l)
      ? filters.levels.filter(x => x !== l)
      : [...filters.levels, l];
    onChange({ ...filters, levels: next });
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      onChange(EMPTY_FILTERS);
    }
  };

  const hasActiveFilters = 
    filters.jobTypes.length > 0 || 
    filters.levels.length > 0 ||
    filters.minSalary || 
    filters.maxSalary ||
    filters.workLocType || 
    filters.postedWithin;

  const activeCount = 
    filters.jobTypes.length + 
    filters.levels.length + 
    (filters.workLocType ? 1 : 0) +
    (filters.postedWithin ? 1 : 0);

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
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium
                text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Xóa hết
            </motion.button>
          )}
        </div>
        
        {/* Active tags */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Đang áp dụng ({activeCount})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {filters.jobTypes.map(t => (
                  <motion.span
                    key={t}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                      bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                  >
                    {JOB_TYPE_LABELS[t]}
                    <button 
                      onClick={() => toggleJobType(t)} 
                      className="text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.span>
                ))}
                {filters.levels.map(l => (
                  <motion.span
                    key={l}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                      bg-purple-50 text-purple-700 rounded-full border border-purple-100"
                  >
                    {JOB_LEVEL_LABELS[l]}
                    <button 
                      onClick={() => toggleLevel(l)} 
                      className="text-purple-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.span>
                ))}
                {filters.workLocType && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                      bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100"
                  >
                    {filters.workLocType === "ONSITE" && "Tại văn phòng"}
                    {filters.workLocType === "REMOTE" && "Làm việc từ xa"}
                    {filters.workLocType === "HYBRID" && "Kết hợp"}
                    <button 
                      onClick={() => onChange({ ...filters, workLocType: "" })} 
                      className="text-emerald-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.span>
                )}
                {filters.postedWithin && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                      bg-amber-50 text-amber-700 rounded-full border border-amber-100"
                  >
                    {filters.postedWithin === "1d" && "Hôm nay"}
                    {filters.postedWithin === "3d" && "3 ngày qua"}
                    {filters.postedWithin === "7d" && "Tuần này"}
                    {filters.postedWithin === "30d" && "Tháng này"}
                    <button 
                      onClick={() => onChange({ ...filters, postedWithin: "" })} 
                      className="text-amber-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ngày đăng tuyển */}
      <Section title="Ngày đăng" icon={Calendar}>
        <div className="space-y-1">
          {[
            { value: "1d",  label: "Hôm nay", icon: "🔥" },
            { value: "3d",  label: "3 ngày gần đây", icon: "📅" },
            { value: "7d",  label: "Tuần này", icon: "📆" },
            { value: "30d", label: "Tháng này", icon: "📊" },
          ].map(o => (
            <RadioRow 
              key={o.value} 
              label={o.label} 
              icon={o.icon}
              checked={filters.postedWithin === o.value}
              onChange={() => onChange({ 
                ...filters, 
                postedWithin: filters.postedWithin === o.value ? "" : o.value 
              })}
            />
          ))}
        </div>
      </Section>

      {/* Hình thức làm việc */}
      <Section title="Hình thức" icon={Briefcase} count={filters.jobTypes.length}>
        <div className="space-y-1">
          {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map(t => (
            <CheckRow 
              key={t} 
              label={JOB_TYPE_LABELS[t]} 
              checked={filters.jobTypes.includes(t)}
              onChange={() => toggleJobType(t)}
            />
          ))}
        </div>
      </Section>

      {/* Cấp bậc */}
      <Section title="Cấp bậc" icon={TrendingUp} count={filters.levels.length} defaultOpen={false}>
        <div className="space-y-1">
          {(Object.keys(JOB_LEVEL_LABELS) as JobLevel[]).map(l => (
            <CheckRow 
              key={l} 
              label={JOB_LEVEL_LABELS[l]} 
              checked={filters.levels.includes(l)}
              onChange={() => toggleLevel(l)}
            />
          ))}
        </div>
      </Section>

      {/* Địa điểm làm việc */}
      <Section title="Địa điểm" icon={MapPin} defaultOpen={false}>
        <div className="space-y-1">
          {[
            { value: "ONSITE", label: "Tại văn phòng", icon: "🏢" },
            { value: "REMOTE", label: "Làm việc từ xa", icon: "🏠" },
            { value: "HYBRID", label: "Kết hợp", icon: "🔄" },
          ].map(o => (
            <RadioRow 
              key={o.value} 
              label={o.label} 
              icon={o.icon}
              checked={filters.workLocType === o.value}
              onChange={() => onChange({ 
                ...filters, 
                workLocType: filters.workLocType === o.value ? "" : o.value 
              })}
            />
          ))}
        </div>
      </Section>

      {/* Mức lương */}
      <Section title="Mức lương" icon={DollarSign} defaultOpen={false}>
        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">Tối thiểu (VNĐ)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="number" 
                value={filters.minSalary} 
                min={0}
                onChange={e => onChange({ ...filters, minSalary: e.target.value })}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  placeholder:text-gray-300"
              />
            </div>
          </div>
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">Tối đa (VNĐ)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="number" 
                value={filters.maxSalary} 
                min={0}
                onChange={e => onChange({ ...filters, maxSalary: e.target.value })}
                placeholder="Không giới hạn"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Tips */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-800">Mẹo tìm kiếm</p>
          </div>
          <p className="text-[10px] text-blue-600">
            Sử dụng bộ lọc để tìm đúng công việc phù hợp với kỹ năng và mong muốn của bạn
          </p>
        </div>
      </div>
    </aside>
  );
}