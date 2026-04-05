// src/app/(main)/jobs/[id]/page.tsx
"use client";
import { useState, useEffect, useRef }  from "react";
import { useParams, useRouter }         from "next/navigation";
import Link                             from "next/link";
import {
  MapPin, Clock, Users, Briefcase, DollarSign,
  Bookmark, Share2, ChevronLeft, Building2,
  CalendarDays, Star,
} from "lucide-react";
import { JobService }                   from "@/application/services/JobService";
import { JobRepository }                from "@/infrastructure/repositories/JobRepository";
import type { JobPostDetail }           from "@/domain/models/Job";
import {
  JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS,
} from "@/domain/models/Job";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";

const service = new JobService(new JobRepository());

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSalary(job: JobPostDetail): string {
  const { salary } = job;
  if (!salary || salary.negotiable) return "Thoả thuận";
  const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(0)} triệu` : `${n.toLocaleString()}`;
  const cur  = salary.currency === "VND" ? "" : ` ${salary.currency}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)}${cur}`;
  if (salary.min) return `Từ ${fmt(salary.min)}${cur}`;
  if (salary.max) return `Đến ${fmt(salary.max)}${cur}`;
  return "Thoả thuận";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function CompanyLogo({ name, src }: { name: string; src?: string | null }) {
  const COLORS = ["from-blue-500 to-blue-700","from-green-500 to-green-700",
    "from-purple-500 to-purple-700","from-orange-500 to-orange-600"];
  const color  = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  if (src) return <img src={src} alt={name} className="w-full h-full object-cover" />;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center
      justify-center text-white font-bold text-xl`}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-700">
      <span className="text-gray-400">{icon}</span> {label}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

// ── Skill badge ────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản":   "bg-gray-100 text-gray-700",
  "Trung cấp":"bg-blue-50 text-blue-700",
  "Nâng cao": "bg-purple-50 text-purple-700",
};

// ── Page ────────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [job,     setJob]     = useState<JobPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);
  const [applying,setApplying]= useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !id) return;
    hasLoaded.current = true;
    (async () => {
      setLoading(true);
      try {
        const data = await service.getById(id);
        setJob(data);
      } catch (e) {
        setError(extractErrorMessage(e, "Không tìm thấy tin tuyển dụng"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!job) return;
    try { await service.toggleSave(job.id); setSaved(v => !v); } catch {}
  };

  const handleApply = async () => {
    setApplying(true);
    await new Promise(r => setTimeout(r, 800));
    setApplying(false);
    // TODO: router.push(`/jobs/${job?.id}/apply`)
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 flex flex-col gap-4">
              <div className="h-48 bg-white rounded-2xl border border-gray-100" />
              <div className="h-64 bg-white rounded-2xl border border-gray-100" />
            </div>
            <div className="h-80 bg-white rounded-2xl border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error ?? "Không tìm thấy việc làm"}</p>
        <Link href="/jobs" className="text-sm text-blue-600 hover:underline">← Quay lại tìm kiếm</Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const tags = [
    job.jobType && JOB_TYPE_LABELS[job.jobType],
    job.level   && JOB_LEVEL_LABELS[job.level],
    job.workLocation?.type && WORK_LOC_LABELS[job.workLocation.type],
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
            transition-colors mb-6">
          <ChevronLeft size={16} /> Quay lại kết quả tìm kiếm
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: main content ────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                  <CompanyLogo name={job.companyName} src={job.companyLogo} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{job.companyName}</p>
                  <h1 className="text-xl font-bold text-gray-900 leading-snug">{job.title}</h1>
                  {job.category && <p className="text-sm text-gray-500 mt-0.5">{job.category}</p>}
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map(t => (
                      <span key={t} className="px-2.5 py-0.5 text-[11px] font-semibold
                        bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Action buttons — top right */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={handleSave}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border
                      transition-colors ${saved
                        ? "border-blue-300 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600"}`}>
                    <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl border
                    border-gray-200 text-gray-400 hover:border-gray-300 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                {job.workLocation?.city && (
                  <MetaChip icon={<MapPin size={13} />} label={job.workLocation.city} />
                )}
                {job.experienceYears !== null && job.experienceYears !== undefined && (
                  <MetaChip icon={<Briefcase size={13} />}
                    label={job.experienceYears === 0 ? "Chưa có kinh nghiệm" : `${job.experienceYears} năm kinh nghiệm`} />
                )}
                {job.vacancies > 0 && (
                  <MetaChip icon={<Users size={13} />} label={`${job.vacancies} vị trí`} />
                )}
                {job.deadline && (
                  <MetaChip icon={<CalendarDays size={13} />} label={`Hạn: ${formatDate(job.deadline)}`} />
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Section title="Mô tả công việc">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </Section>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Section title="Yêu cầu ứng viên">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </p>
                </Section>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Section title="Kỹ năng yêu cầu">
                  <div className="flex flex-col gap-2">
                    {job.skills.map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-3
                        px-3 py-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          {s.required && (
                            <Star size={12} className="text-yellow-500 fill-yellow-400 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-800">{s.skillName}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full
                          ${LEVEL_COLORS[s.level] ?? "bg-gray-100 text-gray-700"}`}>
                          {s.level}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
                    <Star size={10} className="text-yellow-500 fill-yellow-400" /> = Kỹ năng bắt buộc
                  </p>
                </Section>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Section title="Phúc lợi">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </p>
                </Section>
              </div>
            )}
          </div>

          {/* ── Right: apply card ──────────────────────────────── */}
          <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">

            {/* Salary + apply */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Mức lương</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">{formatSalary(job)}</p>

              <button onClick={handleApply} disabled={applying}
                className="w-full py-3 bg-blue-600 text-white text-sm font-semibold
                  rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors
                  flex items-center justify-center gap-2 mb-2">
                {applying && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {applying ? "Đang xử lý..." : "Ứng tuyển ngay"}
              </button>
              <button onClick={handleSave}
                className={`w-full py-2.5 text-sm font-medium rounded-xl border transition-colors
                  ${saved
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}>
                {saved ? "Đã lưu" : "Lưu tin"}
              </button>
            </div>

            {/* Job info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Thông tin việc làm</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <Briefcase size={14} />,   label: "Hình thức",  value: job.jobType   ? JOB_TYPE_LABELS[job.jobType]   : "—" },
                  { icon: <Star size={14} />,         label: "Cấp bậc",   value: job.level     ? JOB_LEVEL_LABELS[job.level]   : "—" },
                  { icon: <MapPin size={14} />,       label: "Địa điểm",  value: job.workLocation?.city ?? "—" },
                  { icon: <Users size={14} />,        label: "Số lượng",  value: `${job.vacancies} người` },
                  { icon: <CalendarDays size={14} />, label: "Hạn nộp",   value: formatDate(job.deadline) },
                  { icon: <Clock size={14} />,        label: "Đăng ngày", value: formatDate(job.publishedAt) },
                ].map(({ icon, label, value }) => (
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

            {/* Company quick info */}
            <Link href={`/companies?q=${encodeURIComponent(job.companyName)}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                hover:border-blue-200 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                  <CompanyLogo name={job.companyName} src={job.companyLogo} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                    {job.companyName}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Building2 size={11} /> Xem trang công ty
                  </p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}