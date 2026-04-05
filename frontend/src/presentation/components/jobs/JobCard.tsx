// src/presentation/components/jobs/JobCard.tsx
"use client";
import Link                    from "next/link";
import { MapPin, Clock, Bookmark } from "lucide-react";
import { useState }            from "react";
import type { JobPost }        from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS } from "@/domain/models/Job";

// ── Company avatar ─────────────────────────────────────────────────────────────

function CompanyLogo({ name, src }: { name: string; src?: string | null }) {
  const COLORS = [
    "from-blue-500 to-blue-700",   "from-green-500 to-green-700",
    "from-purple-500 to-purple-700","from-orange-500 to-orange-600",
    "from-red-500 to-red-700",     "from-teal-500 to-teal-700",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  if (src) return <img src={src} alt={name} className="w-full h-full object-cover" />;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color}
      flex items-center justify-center text-white font-bold text-base`}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Tag ────────────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, string> = {
  FULL_TIME:  "bg-blue-50 text-blue-700 border-blue-200",
  PART_TIME:  "bg-purple-50 text-purple-700 border-purple-200",
  CONTRACT:   "bg-orange-50 text-orange-700 border-orange-200",
  INTERN:     "bg-pink-50 text-pink-700 border-pink-200",
  REMOTE:     "bg-green-50 text-green-700 border-green-200",
  HYBRID:     "bg-teal-50 text-teal-700 border-teal-200",
  ONSITE:     "bg-gray-50 text-gray-700 border-gray-200",
  SENIOR:     "bg-amber-50 text-amber-700 border-amber-200",
  MID_LEVEL:  "bg-lime-50 text-lime-700 border-lime-200",
  JUNIOR:     "bg-sky-50 text-sky-700 border-sky-200",
  LEAD:       "bg-violet-50 text-violet-700 border-violet-200",
  MANAGER:    "bg-rose-50 text-rose-700 border-rose-200",
};

function Tag({ value }: { value: string }) {
  const label =
    JOB_TYPE_LABELS[value as keyof typeof JOB_TYPE_LABELS]   ??
    JOB_LEVEL_LABELS[value as keyof typeof JOB_LEVEL_LABELS] ??
    WORK_LOC_LABELS[value as keyof typeof WORK_LOC_LABELS]   ??
    value;
  const cls = TAG_STYLES[value] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ── Salary formatter ────────────────────────────────────────────────────────────

function formatSalary(job: JobPost): string {
  const { salary } = job;
  if (!salary || salary.negotiable) return "Thoả thuận";
  const fmt = (n: number) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(0)} tr`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}k`
      : `${n}`;
  const cur = salary.currency === "VND" ? "" : ` ${salary.currency}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)}${cur}`;
  if (salary.min) return `Từ ${fmt(salary.min)}${cur}`;
  if (salary.max) return `Đến ${fmt(salary.max)}${cur}`;
  return "Thoả thuận";
}

// ── Time ago ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// ── Props & component ──────────────────────────────────────────────────────────

interface Props {
  job:        JobPost;
  onSave?:    (id: string) => void;
  saved?:     boolean;
}

export function JobCard({ job, onSave, saved = false }: Props) {
  const [isSaved, setIsSaved] = useState(saved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(v => !v);
    onSave?.(job.id);
  };

  const tags = [
    job.jobType,
    job.level,
    job.workLocation?.type,
  ].filter(Boolean) as string[];

  return (
    <Link href={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 p-5 bg-white border border-gray-100 rounded-2xl
        hover:border-blue-200 hover:shadow-md transition-all">

      {/* Header: logo + company + time + save */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100 shrink-0">
          <CompanyLogo name={job.companyName} src={job.companyLogo} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 truncate">{job.companyName}</p>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600
            transition-colors truncate leading-snug">
            {job.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button onClick={handleSave}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved ? "text-blue-600 bg-blue-50" : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
            }`}>
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {timeAgo(job.publishedAt ?? job.createdAt)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => <Tag key={t} value={t} />)}
        </div>
      )}

      {/* Location + salary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">
            {job.workLocation?.city ?? "—"}
          </span>
        </div>
        <p className="text-sm font-bold text-blue-600 shrink-0 whitespace-nowrap">
          {formatSalary(job)}
        </p>
      </div>
    </Link>
  );
}