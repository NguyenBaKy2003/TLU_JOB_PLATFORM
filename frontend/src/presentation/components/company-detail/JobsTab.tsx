// src/presentation/components/company-detail/JobsTab.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ChevronRight, Wifi, Building2 } from "lucide-react";
import type { CompanyProfile } from "@/domain/models/Company";
import type { JobPost } from "@/domain/models/Job";
import { Pagination } from "@/presentation/components/common/Pagination";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";

interface Props {
  company: CompanyProfile;
}

const companyService = new CompanyService(new CompanyRepository());
const PAGE_SIZE = 10;

// ── Constants ─────────────────────────────────────────────────────────────────

const JOB_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  FULL_TIME:  { label: "Full Time",  className: "bg-blue-50   text-blue-800   border-blue-200" },
  PART_TIME:  { label: "Part Time",  className: "bg-purple-50 text-purple-800 border-purple-200" },
  REMOTE:     { label: "Remote",     className: "bg-violet-50 text-violet-800 border-violet-200" },
  HYBRID:     { label: "Hybrid",     className: "bg-teal-50   text-teal-800   border-teal-200" },
  INTERNSHIP: { label: "Thực tập",   className: "bg-pink-50   text-pink-800   border-pink-200" },
  CONTRACT:   { label: "Hợp đồng",   className: "bg-amber-50  text-amber-800  border-amber-200" },
};

const WORK_TYPE_ICON: Record<string, React.ReactNode> = {
  REMOTE: <Wifi size={10} />,
  HYBRID: <Building2 size={10} />,
};

const LEVEL_CONFIG: Record<string, { label: string; className: string }> = {
  INTERN:  { label: "Intern",  className: "bg-gray-50   text-gray-600   border-gray-200" },
  JUNIOR:  { label: "Junior",  className: "bg-green-50  text-green-800  border-green-200" },
  MIDDLE:  { label: "Middle",  className: "bg-purple-50 text-purple-800 border-purple-200" },
  SENIOR:  { label: "Senior",  className: "bg-orange-50 text-orange-800 border-orange-200" },
  LEAD:    { label: "Lead",    className: "bg-red-50    text-red-800    border-red-200" },
  MANAGER: { label: "Manager", className: "bg-blue-50   text-blue-800   border-blue-200" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function postedAgoLabel(createdAt?: string): string | null {
  if (!createdAt) return null;
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  if (diff < 30)  return `${diff} ngày trước`;
  return `${Math.floor(diff / 30)} tháng trước`;
}

function formatSalary(job: JobPost): string | null {
  // API trả salary object: { min, max, negotiable, currency }
  const s = (job as any).salary;
  if (!s) return null;
  if (s.negotiable && !s.min && !s.max) return "Thỏa thuận";
  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      notation: "compact", compactDisplay: "short",
      maximumFractionDigits: 0,
    }).format(n);
  if (s.min && s.max) return `${fmt(s.min)} – ${fmt(s.max)} ₫`;
  if (s.min) return `Từ ${fmt(s.min)} ₫`;
  if (s.max) return `Đến ${fmt(s.max)} ₫`;
  return "Thỏa thuận";
}

function getCity(job: JobPost): string | null {
  // API: workLocation.city
  return (job as any).workLocation?.city ?? (job as any).city ?? null;
}

function getWorkLocationType(job: JobPost): string | null {
  return (job as any).workLocation?.type ?? null;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function JobSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
      <div className="w-11 h-11 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="h-3.5 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-14" />
          <div className="h-3 bg-gray-100 rounded w-20 self-center" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-4 bg-gray-100 rounded w-12" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="h-3.5 w-16 bg-gray-100 rounded shrink-0" />
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({ job, company }: { job: JobPost; company: CompanyProfile }) {
  const ago         = postedAgoLabel(job.createdAt);
  const salary      = formatSalary(job);
  const city        = getCity(job);
  const workType    = getWorkLocationType(job);
  const jobTypeCfg  = JOB_TYPE_CONFIG[job.jobType ?? ""];
  const levelCfg    = LEVEL_CONFIG[(job as any).level ?? ""];
  const skills      = (job as any).skills as Array<{ skillName: string }> | undefined;
  const isNegotiable = !(salary) || salary === "Thỏa thuận";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white
        hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-150"
    >
      {/* Logo */}
      <div className="w-11 h-11 rounded-xl border border-gray-100 overflow-hidden shrink-0
        bg-gray-50 flex items-center justify-center">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <Briefcase size={18} className="text-gray-300" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-gray-800 truncate
          group-hover:text-blue-600 transition-colors mb-1.5">
          {job.title}
        </p>

        {/* Badges + meta */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {jobTypeCfg && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px]
              font-semibold rounded-full border ${jobTypeCfg.className}`}>
              {WORK_TYPE_ICON[workType ?? ""] ?? null}
              {jobTypeCfg.label}
            </span>
          )}
          {levelCfg && (
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${levelCfg.className}`}>
              {levelCfg.label}
            </span>
          )}
          {city && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
              <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                <MapPin size={11} /> {city}
              </span>
            </>
          )}
          {salary && !isNegotiable && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
              <span className="text-[12px] font-semibold text-emerald-600">{salary}</span>
            </>
          )}
          {isNegotiable && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
              <span className="text-[12px] text-gray-400 italic">Thỏa thuận</span>
            </>
          )}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {skills.slice(0, 4).map((s) => (
              <span key={s.skillName}
                className="px-2 py-0.5 text-[11px] rounded-md
                  bg-gray-50 text-gray-500 border border-gray-100">
                {s.skillName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {ago && (
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <Clock size={10} /> {ago}
          </span>
        )}
        <ChevronRight size={15}
          className="text-gray-300 group-hover:text-blue-400 transition-colors" />
      </div>
    </Link>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JobsTab({ company }: Props) {
  const [jobs, setJobs]             = useState<JobPost[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    companyService
      .getJobsByCompany(company.id, currentPage - 1, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setJobs(res.content);
        setTotal(res.totalElements);
        setTotalPages(res.totalPages);
      })
      .catch(() => { if (!cancelled) setJobs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [company.id, currentPage]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Việc làm đang tuyển</h2>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {total > 0
                ? `${total.toLocaleString()} vị trí tại ${company.name}`
                : `${company.name} hiện chưa có vị trí nào`}
            </p>
          )}
        </div>
        {total > 0 && (
          <Link href={`/jobs?company=${company.id}`}
            className="text-xs font-medium text-blue-600 hover:underline mt-1">
            Xem tất cả →
          </Link>
        )}
      </div>

      {/* Section label */}
      {!loading && total > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 mb-3
          bg-gray-50 rounded-xl border border-gray-100">
          <Briefcase size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500 flex-1">Tất cả vị trí</span>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px]
            px-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
            {total}
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3
          bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100
            flex items-center justify-center shadow-sm">
            <Briefcase size={22} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Hiện chưa có vị trí tuyển dụng</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {jobs.map((job) => <JobCard key={job.id} job={job} company={company} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}