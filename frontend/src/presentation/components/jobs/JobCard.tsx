// src/presentation/components/jobs/JobCard.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, Bookmark, Briefcase, 
  DollarSign, TrendingUp, Building2, Sparkles,
  Eye, ArrowRight, CheckCircle
} from "lucide-react";
import { useState } from "react";
import type { JobPost } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS } from "@/domain/models/Job";

// ── Company Avatar với animation 
function CompanyLogo({ name, src, size = 56 }: { name: string; src?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const COLORS = [
    "from-blue-500 to-blue-700", "from-green-500 to-green-700",
    "from-purple-500 to-purple-700", "from-orange-500 to-orange-600",
    "from-red-500 to-red-700", "from-teal-500 to-teal-700",
    "from-pink-500 to-pink-700", "from-indigo-500 to-indigo-700",
  ];
  const colorIndex = (name?.charCodeAt(0) ?? 0) % COLORS.length;
  const color = COLORS[colorIndex];
  
  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={name} 
        className="w-full h-full object-cover rounded-xl"
        onError={() => setImgError(true)}
      />
    );
  }
  
  return (
    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold text-lg">{name?.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

// ── Tag với màu sắc động 
const TAG_STYLES: Record<string, { bg: string; text: string; border: string; icon?: string }> = {
  FULL_TIME:  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "💼" },
  PART_TIME:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "⏰" },
  CONTRACT:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "📄" },
  INTERN:     { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "🎓" },
  REMOTE:     { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "🏠" },
  HYBRID:     { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "🔄" },
  ONSITE:     { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "🏢" },
  SENIOR:     { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "⭐" },
  MID_LEVEL:  { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", icon: "📊" },
  JUNIOR:     { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: "🌱" },
  LEAD:       { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "👑" },
  MANAGER:    { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "📋" },
};

function Tag({ value }: { value: string }) {
  const label =
    JOB_TYPE_LABELS[value as keyof typeof JOB_TYPE_LABELS] ??
    JOB_LEVEL_LABELS[value as keyof typeof JOB_LEVEL_LABELS] ??
    WORK_LOC_LABELS[value as keyof typeof WORK_LOC_LABELS] ??
    value;
  
  const style = TAG_STYLES[value] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon && <span className="text-xs">{style.icon}</span>}
      {label}
    </span>
  );
}

// ── Salary Formatter ─────
function formatSalary(salary: any): string {
  if (!salary) return "Thương lượng";
  if (typeof salary === "string") return salary;
  if (salary.min && salary.max) return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || "VND"}`;
  if (salary.min) return `Từ ${salary.min.toLocaleString()} ${salary.currency || "VND"}`;
  if (salary.max) return `Đến ${salary.max.toLocaleString()} ${salary.currency || "VND"}`;
  return "Thương lượng";
}

// ── Time ago formatter ───
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  const weeks = Math.floor(days / 7);
  return `${weeks} tuần trước`;
}

// ── Main Component ───────
interface Props {
  job: JobPost;
  onSave?: (id: string) => void;
  saved?: boolean;
  featured?: boolean;
}

export function JobCard({ job, onSave, saved = false, featured = false }: Props) {
  const [isSaved, setIsSaved] = useState(saved);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(v => !v);
    onSave?.(job.id);
  };

  const tags = [
    job.jobType,
    job.level,
    job.workLocationCity,
  ].filter(Boolean) as string[];

  const salaryDisplay = formatSalary(job.salaryRange || job.salaryDisplay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/jobs/${job.id}`} className="block group">
        <div className={`
          relative bg-white rounded-2xl transition-all duration-300
          border ${isHovered ? 'border-blue-200 shadow-xl shadow-blue-100/50' : 'border-gray-100 shadow-sm'}
          hover:shadow-xl overflow-hidden
        `}>
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-md">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">GỢI Ý</span>
              </div>
            </div>
          )}

          {/* Urgent Badge */}
          {job.isUrgent && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 rounded-full shadow-md animate-pulse">
                <span className="text-[10px] font-bold text-white">🔥 GẤP</span>
              </div>
            </div>
          )}

          <div className="p-5">
            <div className="flex gap-4">
              {/* Company Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <CompanyLogo name={job.companyName} src={job.companyLogoUrl} size={56} />
                </div>
                
                {/* Online indicator */}
                {job.companyIsActive && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white">
                    <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-75" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Company Name & Time */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500 truncate">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {timeAgo(job.publishedAt ?? job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Job Title */}
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                  {job.title}
                </h3>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.slice(0, 3).map(t => <Tag key={t} value={t} />)}
                    {tags.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Location & Salary Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{job.workLocationCity || "Đang cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{salaryDisplay}</span>
                  </div>
                </div>

                {/* Skills/Requirements Preview */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Applicants Count */}
                {job.applicantCount && job.applicantCount > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{job.applicantCount} ứng viên đã ứng tuyển</span>
                  </div>
                )}
              </div>

              {/* Save Button & View Details */}
              <div className="flex flex-col items-end justify-between gap-3">
                <button
                  onClick={handleSave}
                  className={`
                    p-2 rounded-xl transition-all duration-200
                    ${isSaved 
                      ? 'bg-blue-500 text-white shadow-md scale-105' 
                      : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
                    }
                  `}
                >
                  <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                </button>
                
                <motion.div
                  animate={{ x: isHovered ? 0 : 5 }}
                  className="flex items-center gap-1 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>Chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress bar animation on hover */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// Thêm import Users nếu chưa có
import { Users } from "lucide-react";