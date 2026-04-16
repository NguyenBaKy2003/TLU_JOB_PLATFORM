"use client";
import {
  MapPin, Clock, Users, Briefcase,
  Bookmark, Share2, Building2,
  CalendarDays, Star, CheckCircle2,
} from "lucide-react";
import type { JobPostDetail } from "@/domain/models/Job";
import { JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS } from "@/domain/models/Job";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatSalary(job: JobPostDetail): string {
  const { salary } = job;
  if (!salary || salary.negotiable) return "Thoả thuận";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} triệu` : `${n.toLocaleString()}`;
  const cur = salary.currency === "VND" ? "" : ` ${salary.currency}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)}${cur}`;
  if (salary.min)               return `Từ ${fmt(salary.min)}${cur}`;
  if (salary.max)               return `Đến ${fmt(salary.max)}${cur}`;
  return "Thoả thuận";
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ── CompanyLogo ───────────────────────────────────────────────────────────────

const LOGO_COLORS = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-violet-500 to-violet-700",
  "from-orange-500 to-orange-600",
];

export function CompanyLogo({
  name, src, size = "md",
}: { name: string; src?: string | null; size?: "sm" | "md" | "lg" }) {
  const color = LOGO_COLORS[(name?.charCodeAt(0) ?? 0) % LOGO_COLORS.length];
  const sz = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-xl";
  if (src) return <img src={src} alt={name} className="w-full h-full object-cover" />;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center
      justify-center text-white font-bold ${sz}`}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── MetaChip ──────────────────────────────────────────────────────────────────

export function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl
      text-xs text-gray-700 border border-gray-100">
      <span className="text-gray-400">{icon}</span>
      {label}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

// ── HtmlContent ───────────────────────────────────────────────────────────────

export function HtmlContent({ html }: { html: string }) {
  return (
    <div
      className="job-html-content text-sm text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── SkillLevel colors ─────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản":    "bg-gray-100 text-gray-600",
  "Trung cấp": "bg-blue-50 text-blue-700",
  "Nâng cao":  "bg-violet-50 text-violet-700",
};

// ── JobHeroCard ───────────────────────────────────────────────────────────────

interface JobHeroCardProps {
  job:        JobPostDetail;
  saved?:     boolean;
  onSave?:    () => void;
  onShare?:   () => void;
  /** Slot để employer render badge riêng (VD: "14 ứng viên") */
  actionSlot?: React.ReactNode;
}

export function JobHeroCard({ job, saved, onSave, onShare, actionSlot }: JobHeroCardProps) {
  const tags = [
    job.jobType           && JOB_TYPE_LABELS[job.jobType],
    job.level             && JOB_LEVEL_LABELS[job.level],
    job.workLocationCity && WORK_LOC_LABELS[job.workLocationType],
  ].filter(Boolean) as string[];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-4 mb-5">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
          <CompanyLogo name={job.companyName} src={job.companyLogoUrl} />
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">{job.companyName}</p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{job.title}</h1>
          {job.category && (
            <p className="text-sm text-gray-500 mt-0.5">{job.category}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(t => (
              <span key={t} className="px-2.5 py-0.5 text-[11px] font-semibold
                bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actionSlot}
          {onSave && (
            <button onClick={onSave}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border
                transition-colors ${saved
                  ? "border-blue-300 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600"}`}>
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
          )}
          {onShare && (
            <button onClick={onShare}
              className="w-9 h-9 flex items-center justify-center rounded-xl border
                border-gray-200 text-gray-400 hover:border-gray-300 transition-colors">
              <Share2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        {job.workLocationCity && (
          <MetaChip icon={<MapPin size={13} />} label={job.workLocationCity} />
        )}
        {job.experienceYears != null && (
          <MetaChip icon={<Briefcase size={13} />}
            label={job.experienceYears === 0
              ? "Chưa có kinh nghiệm"
              : `${job.experienceYears} năm kinh nghiệm`} />
        )}
        {job.vacancies > 0 && (
          <MetaChip icon={<Users size={13} />} label={`${job.vacancies} vị trí`} />
        )}
        {job.deadline && (
          <MetaChip icon={<CalendarDays size={13} />}
            label={`Hạn: ${formatDate(job.deadline)}`} />
        )}
      </div>
    </div>
  );
}

// ── JobDescriptionCards ───────────────────────────────────────────────────────

export function JobDescriptionCards({ job }: { job: JobPostDetail }) {
  return (
    <>
      {job.description && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Section title="Mô tả công việc">
            <HtmlContent html={job.description} />
          </Section>
        </div>
      )}

      {job.requirements && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Section title="Yêu cầu ứng viên">
            <HtmlContent html={job.requirements} />
          </Section>
        </div>
      )}

      {job.skills && job.skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Section title="Kỹ năng yêu cầu">
            <div className="flex flex-col gap-2">
              {job.skills.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3
                  px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    {s.required && (
                      <Star size={12} className="text-yellow-500 fill-yellow-400 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-800">{s.skillName}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full
                    ${LEVEL_COLORS[s.level] ?? "bg-gray-100 text-gray-600"}`}>
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
              <Star size={10} className="text-yellow-500 fill-yellow-400" />
              = Kỹ năng bắt buộc
            </p>
          </Section>
        </div>
      )}

      {job.benefits && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Section title="Phúc lợi">
            <HtmlContent html={job.benefits} />
          </Section>
        </div>
      )}
    </>
  );
}

// ── JobInfoSidebar ────────────────────────────────────────────────────────────

export function JobInfoSidebar({ job }: { job: JobPostDetail }) {
  const rows = [
    { icon: <Briefcase size={14} />,   label: "Hình thức", value: job.jobType ? JOB_TYPE_LABELS[job.jobType]  : "—" },
    { icon: <Star size={14} />,         label: "Cấp bậc",  value: job.level   ? JOB_LEVEL_LABELS[job.level]   : "—" },
    { icon: <MapPin size={14} />,       label: "Địa điểm", value: job.workLocationAddress ?? "—" },
    { icon: <Users size={14} />,        label: "Số lượng", value: `${job.vacancies} người` },
    { icon: <CalendarDays size={14} />, label: "Hạn nộp",  value: formatDate(job.deadline) },
    { icon: <Clock size={14} />,        label: "Đăng ngày",value: formatDate(job.publishedAt) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Thông tin việc làm</h3>
      <div className="flex flex-col gap-3">
        {rows.map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CompanyCard ───────────────────────────────────────────────────────────────

import Link from "next/link";

export function CompanyCard({ job }: { job: JobPostDetail }) {
  return (
    <Link href={`/companies?q=${encodeURIComponent(job.companyName)}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
        hover:border-blue-200 transition-colors group block">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
          <CompanyLogo name={job.companyName} src={job.companyLogoUrl} size="sm" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate
            group-hover:text-blue-600 transition-colors">
            {job.companyName}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Building2 size={11} /> Xem trang công ty
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── AppliedBadge ──────────────────────────────────────────────────────────────

export function AppliedBadge() {
  return (
    <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700
      text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
      <CheckCircle2 size={16} />
      Đã ứng tuyển
    </div>
  );
}

// ── JobDetailSkeleton ─────────────────────────────────────────────────────────

export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-48 bg-white rounded-2xl border border-gray-100" />
            <div className="h-64 bg-white rounded-2xl border border-gray-100" />
            <div className="h-48 bg-white rounded-2xl border border-gray-100" />
          </div>
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="h-48 bg-white rounded-2xl border border-gray-100" />
            <div className="h-56 bg-white rounded-2xl border border-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}