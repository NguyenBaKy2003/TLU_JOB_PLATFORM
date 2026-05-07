// src/presentation/components/jobs/JobCard.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Bookmark, Building2,
  DollarSign, Sparkles, ArrowRight,
  Users, Flame,
} from "lucide-react";
import { useState } from "react";
import type { JobPost } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS } from "@/domain/models/Job";

// ── Company Logo ──────────────────────────────────────────────────────────────

function CompanyLogo({ name, src }: { name: string; src?: string | null }) {
  const [imgError, setImgError] = useState(false);
  const COLORS = [
    "from-blue-500 to-blue-700", "from-green-500 to-green-700",
    "from-purple-500 to-purple-700", "from-orange-500 to-orange-600",
    "from-red-500 to-red-700", "from-teal-500 to-teal-700",
    "from-pink-500 to-pink-700", "from-indigo-500 to-indigo-700",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  if (src && !imgError) {
    return (
      <img
        src={src} alt={name}
        className="w-full h-full object-cover rounded-xl"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
      <span className="text-white font-bold text-lg">{name?.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  FULL_TIME:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   icon: "💼" },
  PART_TIME:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "⏰" },
  CONTRACT:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "📄" },
  INTERN:     { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200",   icon: "🎓" },
  REMOTE:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: "🏠" },
  HYBRID:     { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   icon: "🔄" },
  ONSITE:     { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200",   icon: "🏢" },
  SENIOR:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: "⭐" },
  MID_LEVEL:  { bg: "bg-lime-50",   text: "text-lime-700",   border: "border-lime-200",   icon: "📊" },
  JUNIOR:     { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    icon: "🌱" },
  LEAD:       { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "👑" },
  MANAGER:    { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200",   icon: "📋" },
};

function Tag({ value }: { value: string }) {
  const label =
    JOB_TYPE_LABELS[value as keyof typeof JOB_TYPE_LABELS] ??
    JOB_LEVEL_LABELS[value as keyof typeof JOB_LEVEL_LABELS] ??
    WORK_LOC_LABELS[value as keyof typeof WORK_LOC_LABELS] ??
    value;
  const style = TAG_STYLES[value] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon && <span className="text-xs">{style.icon}</span>}
      {label}
    </span>
  );
}

// ── Competition Badge ─────────────────────────────────────────────────────────

export type CompetitionLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

const COMPETITION_CFG: Record<CompetitionLevel, { label: string; className: string }> = {
  LOW:       { label: "Ít cạnh tranh",  className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MEDIUM:    { label: "Trung bình",      className: "bg-yellow-50  text-yellow-700  border-yellow-200"  },
  HIGH:      { label: "Khá cạnh tranh", className: "bg-orange-50  text-orange-700  border-orange-200"  },
  VERY_HIGH: { label: "Rất cạnh tranh", className: "bg-red-50     text-red-700     border-red-200"     },
};

function CompetitionBadge({ level }: { level: CompetitionLevel }) {
  const cfg = COMPETITION_CFG[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cfg.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSalary(salary: any): string {
  if (!salary) return "Thương lượng";
  if (typeof salary === "string") return salary;
  if (salary.min && salary.max) return `${salary.min.toLocaleString()} – ${salary.max.toLocaleString()} ${salary.currency || "VND"}`;
  if (salary.min) return `Từ ${salary.min.toLocaleString()} ${salary.currency || "VND"}`;
  if (salary.max) return `Đến ${salary.max.toLocaleString()} ${salary.currency || "VND"}`;
  return "Thương lượng";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return `${Math.floor(days / 7)} tuần trước`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  job: JobPost;
  onSave?: (id: string) => void;
  saved?: boolean;
  featured?: boolean;
  competitionLevel?: CompetitionLevel;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JobCard({ job, onSave, saved = false, featured = false, competitionLevel }: Props) {
  const [isSaved,   setIsSaved]   = useState(saved);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(v => !v);
    onSave?.(job.id);
  };

  const tags = [job.jobType, job.level, job.workLocationCity].filter(Boolean) as string[];
  const salaryDisplay = formatSalary(job.salaryRange ?? job.salaryDisplay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.25 }}
    >
      <Link href={`/jobs/${job.id}`} className="block group">
        <div className={`relative bg-white rounded-2xl transition-all duration-300 border overflow-hidden
          ${isHovered ? "border-blue-200 shadow-xl shadow-blue-100/40" : "border-gray-100 shadow-sm"}`}>

          {featured && (
            <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 px-2 py-0.5
              bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-white" />
              <span className="text-[9px] font-bold text-white tracking-wide">GỢI Ý</span>
            </div>
          )}

          {job.isUrgent && (
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1 px-2 py-0.5
              bg-red-500 rounded-full shadow-sm">
              <Flame className="w-2.5 h-2.5 text-white" />
              <span className="text-[9px] font-bold text-white">GẤP</span>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex gap-3.5">

              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <CompanyLogo name={job.companyName} src={job.companyLogoUrl} />
                </div>
                {job.companyIsActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white block" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Clock className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {timeAgo(job.publishedAt ?? job.createdAt)}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600
                  transition-colors line-clamp-1 mb-2">
                  {job.title}
                </h3>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {tags.slice(0, 3).map(t => <Tag key={t} value={t} />)}
                    {tags.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate max-w-[100px]">{job.workLocationCity || "Đang cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    <span className="truncate max-w-[120px]">{salaryDisplay}</span>
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {job.skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] text-gray-400">+{job.skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {job.applicantCount != null && job.applicantCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{job.applicantCount} ứng viên</span>
                    </div>
                  )}
                  {competitionLevel && (
                    <CompetitionBadge level={competitionLevel} />
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                <button
                  onClick={handleSave}
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isSaved
                      ? "bg-blue-500 text-white shadow-sm scale-105"
                      : "bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                  }`}
                >
                  <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                </button>

                <motion.div
                  animate={{ x: isHovered ? 0 : 4, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-0.5 text-blue-600 text-[10px] font-medium"
                >
                  <span>Xem</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </motion.div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500"
            initial={{ width: "0%" }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}