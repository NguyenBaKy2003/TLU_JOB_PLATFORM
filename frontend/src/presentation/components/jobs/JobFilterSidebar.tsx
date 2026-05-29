// src/presentation/components/jobs/JobFilterSidebar.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, X, Calendar, Briefcase, TrendingUp,
  MapPin, DollarSign, RotateCcw, SlidersHorizontal,
  Award, Search,
} from "lucide-react";
import type { JobType, JobLevel } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS } from "@/domain/models/Job";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobFilters {
  jobTypes:     JobType[];
  levels:       JobLevel[];
  minSalary:    string;
  maxSalary:    string;
  currency:     string;
  workLocType:  string;
  postedWithin: string;
}

export const EMPTY_FILTERS: JobFilters = {
  jobTypes: [], levels: [], minSalary: "", maxSalary: "",
  currency: "", workLocType: "", postedWithin: "",
};

interface Props {
  /** Giá trị filter đang áp dụng (đã search) */
  appliedFilters: JobFilters;
  /** Callback khi nhấn "Áp dụng" — truyền filters mới để trigger search */
  onApply: (f: JobFilters) => void;
  onClearAll?: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title, children, icon: Icon, defaultOpen = true, count = 0,
}: {
  title: string; children: React.ReactNode; icon?: any;
  defaultOpen?: boolean; count?: number;
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
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full"
            >
              {count}
            </motion.span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CheckRow({ label, checked, onChange, icon }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; icon?: string;
}) {
  return (
    <motion.label
      whileHover={{ x: 3 }}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-1 rounded-lg
        hover:bg-gray-50 transition-colors"
    >
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
          ${checked ? "border-blue-500 bg-blue-500" : "border-gray-300 group-hover:border-blue-300"}`}
      >
        {checked && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} viewBox="0 0 12 12" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </motion.svg>
        )}
      </div>
      {icon && <span className="text-sm">{icon}</span>}
      <span className={`text-sm transition-colors ${checked ? "text-blue-700 font-medium" : "text-gray-600"}`}>
        {label}
      </span>
    </motion.label>
  );
}

function RadioRow({ label, checked, onChange, icon }: {
  label: string; checked: boolean; onChange: () => void; icon?: string;
}) {
  return (
    <motion.label
      whileHover={{ x: 3 }}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-1 rounded-lg
        hover:bg-gray-50 transition-colors"
      onClick={onChange}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
        ${checked ? "border-blue-500" : "border-gray-300 group-hover:border-blue-300"}`}>
        {checked && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-blue-500"
          />
        )}
      </div>
      {icon && <span className="text-sm">{icon}</span>}
      <span className={`text-sm transition-colors ${checked ? "text-blue-700 font-medium" : "text-gray-600"}`}>
        {label}
      </span>
    </motion.label>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function JobFilterSidebar({ appliedFilters, onApply, onClearAll }: Props) {
  // draft = trạng thái đang chỉnh, chưa apply
  const [draft, setDraft] = useState<JobFilters>(appliedFilters);

  // Đếm thay đổi so với appliedFilters để hiện badge "chưa apply"
  const hasPendingChanges = JSON.stringify(draft) !== JSON.stringify(appliedFilters);

  const toggleJobType = (t: JobType) => {
    const next = draft.jobTypes.includes(t)
      ? draft.jobTypes.filter(x => x !== t)
      : [...draft.jobTypes, t];
    setDraft(d => ({ ...d, jobTypes: next }));
  };

  const toggleLevel = (l: JobLevel) => {
    const next = draft.levels.includes(l)
      ? draft.levels.filter(x => x !== l)
      : [...draft.levels, l];
    setDraft(d => ({ ...d, levels: next }));
  };

  const handleApply = () => onApply(draft);

  const handleClearAll = () => {
    setDraft(EMPTY_FILTERS);
    if (onClearAll) onClearAll();
    else onApply(EMPTY_FILTERS);
  };

  // Đồng bộ draft khi appliedFilters reset từ bên ngoài (e.g. handleClearAll từ page)
  // Dùng key pattern ở component cha sẽ sạch hơn, nhưng effect này cũng ok
  // useEffect(() => { setDraft(appliedFilters); }, [appliedFilters]);

  const activeCount =
    appliedFilters.jobTypes.length +
    appliedFilters.levels.length +
    (appliedFilters.currency ? 1 : 0) +
    (appliedFilters.workLocType ? 1 : 0) +
    (appliedFilters.postedWithin ? 1 : 0);

  const draftCount =
    draft.jobTypes.length +
    draft.levels.length +
    (draft.currency ? 1 : 0) +
    (draft.workLocType ? 1 : 0) +
    (draft.postedWithin ? 1 : 0);

  const hasApplied =
    appliedFilters.jobTypes.length > 0 || appliedFilters.levels.length > 0 ||
    appliedFilters.currency || appliedFilters.workLocType || appliedFilters.postedWithin ||
    appliedFilters.minSalary || appliedFilters.maxSalary;

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-0">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500
              flex items-center justify-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Bộ lọc</h3>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full">
                {activeCount}
              </span>
            )}
          </div>

          {hasApplied && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium
                text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Xóa hết
            </motion.button>
          )}
        </div>

        {/* Applied tags — chỉ hiện filters đã được apply */}
        <AnimatePresence>
          {hasApplied && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Đang lọc
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {appliedFilters.jobTypes.map(t => (
                  <span key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
                      bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {JOB_TYPE_LABELS[t]}
                  </span>
                ))}
                {appliedFilters.levels.map(l => (
                  <span key={l}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
                      bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                    {JOB_LEVEL_LABELS[l]}
                  </span>
                ))}
                {appliedFilters.workLocType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
                    bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    {appliedFilters.workLocType === "ONSITE" ? "Tại VP"
                      : appliedFilters.workLocType === "REMOTE" ? "Remote" : "Hybrid"}
                  </span>
                )}
                {appliedFilters.currency && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
                    bg-green-50 text-green-700 rounded-full border border-green-100">
                    {appliedFilters.currency}
                  </span>
                )}
                {appliedFilters.postedWithin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium
                    bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                    {appliedFilters.postedWithin === "1d" ? "Hôm nay"
                      : appliedFilters.postedWithin === "3d" ? "3 ngày"
                      : appliedFilters.postedWithin === "7d" ? "Tuần này" : "Tháng này"}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filter sections (chỉnh draft) ───────────────────────────────────── */}

      {/* Ngày đăng */}
      <Section title="Ngày đăng" icon={Calendar}>
        <div className="space-y-0.5">
          {[
            { value: "1d",  label: "Hôm nay",        icon: "🔥" },
            { value: "3d",  label: "3 ngày gần đây",  icon: "📅" },
            { value: "7d",  label: "Tuần này",         icon: "📆" },
            { value: "30d", label: "Tháng này",        icon: "📊" },
          ].map(o => (
            <RadioRow
              key={o.value} label={o.label} icon={o.icon}
              checked={draft.postedWithin === o.value}
              onChange={() => setDraft(d => ({
                ...d, postedWithin: d.postedWithin === o.value ? "" : o.value,
              }))}
            />
          ))}
        </div>
      </Section>

      {/* Hình thức */}
      <Section title="Hình thức" icon={Briefcase} count={draft.jobTypes.length}>
        <div className="space-y-0.5">
          {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map(t => (
            <CheckRow
              key={t} label={JOB_TYPE_LABELS[t]}
              checked={draft.jobTypes.includes(t)}
              onChange={() => toggleJobType(t)}
            />
          ))}
        </div>
      </Section>

      {/* Cấp bậc */}
      <Section title="Cấp bậc" icon={TrendingUp} count={draft.levels.length} defaultOpen={false}>
        <div className="space-y-0.5">
          {(Object.keys(JOB_LEVEL_LABELS) as JobLevel[]).map(l => (
            <CheckRow
              key={l} label={JOB_LEVEL_LABELS[l]}
              checked={draft.levels.includes(l)}
              onChange={() => toggleLevel(l)}
            />
          ))}
        </div>
      </Section>

      {/* Địa điểm */}
      <Section title="Địa điểm" icon={MapPin} defaultOpen={false}>
        <div className="space-y-0.5">
          {[
            { value: "ONSITE", label: "Tại văn phòng", icon: "🏢" },
            { value: "REMOTE", label: "Làm việc từ xa", icon: "🏠" },
            { value: "HYBRID", label: "Kết hợp",        icon: "🔄" },
          ].map(o => (
            <RadioRow
              key={o.value} label={o.label} icon={o.icon}
              checked={draft.workLocType === o.value}
              onChange={() => setDraft(d => ({
                ...d, workLocType: d.workLocType === o.value ? "" : o.value,
              }))}
            />
          ))}
        </div>
      </Section>

      {/* Mức lương */}
      <Section title="Mức lương" icon={DollarSign} defaultOpen={false}>
        <div className="space-y-3">

          {/* Currency */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Đơn vị tiền tệ</label>
            <div className="flex gap-1.5">
              {[
                { value: "",    label: "Tất cả" },
                { value: "VND", label: "VNĐ" },
                { value: "USD", label: "USD" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDraft(d => ({ ...d, currency: opt.value }))}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all
                    ${draft.currency === opt.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tối thiểu</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                type="number" min={0}
                value={draft.minSalary}
                onChange={e => setDraft(d => ({ ...d, minSalary: e.target.value }))}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Max */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tối đa</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                type="number" min={0}
                value={draft.maxSalary}
                onChange={e => setDraft(d => ({ ...d, maxSalary: e.target.value }))}
                placeholder="Không giới hạn"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Apply button ─────────────────────────────────────────────────────── */}
      <div className="mt-4 space-y-2">
        <motion.button
          onClick={handleApply}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            text-sm font-semibold transition-all duration-200
            ${hasPendingChanges
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-default"
            }`}
        >
          <Search className="w-3.5 h-3.5" />
          {hasPendingChanges ? "Áp dụng bộ lọc" : "Đã áp dụng"}
        </motion.button>

        {hasPendingChanges && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setDraft(appliedFilters)}
            className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Hoàn tác thay đổi
          </motion.button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-[11px] font-semibold text-blue-700">Mẹo tìm kiếm</p>
          </div>
          <p className="text-[10px] text-blue-500 leading-relaxed">
            Chọn bộ lọc xong nhấn <strong>Áp dụng</strong> để tìm kiếm chính xác hơn.
          </p>
        </div>
      </div>
    </aside>
  );
}