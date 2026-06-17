"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Clock, Users, Eye, Briefcase,
  XCircle, ChevronRight, Wifi, Building2, Globe, Sparkles,
} from "lucide-react";
import type { JobPost, JobStatus } from "@/domain/models/Job";
import { useState } from "react";
import { JobActionMenu } from "./JobActionMenu";
import { CandidateSuggestPanel } from "@/presentation/components/ai/CandidateSuggestPanel";

// ── Helpers ───────────

function statusBadge(status: JobStatus) {
  const map: Record<JobStatus, { label: string; cls: string }> = {
    PUBLISHED:      { label: "Đang tuyển",  cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    DRAFT:          { label: "Nháp",        cls: "bg-gray-100   text-gray-500   border border-gray-200"    },
    CLOSED:         { label: "Đã đóng",     cls: "bg-orange-50  text-orange-500 border border-orange-100"  },
    EXPIRED:        { label: "Hết hạn",     cls: "bg-purple-50  text-purple-500 border border-purple-100"  },
    PENDING_REVIEW: { label: "Chờ duyệt",   cls: "bg-amber-50   text-amber-600  border border-amber-100"   },
    REJECTED:       { label: "Bị từ chối",  cls: "bg-red-50     text-red-500    border border-red-100"     },
  };
  const { label, cls } = map[status] ?? map.DRAFT;
  return (
    <span className={`px-2 py-0.5 rounded-full text-base font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function workTypeBadge(type: string) {
  const map: Record<string, { label: string; icon: React.ReactNode }> = {
    REMOTE: { label: "Remote", icon: <Wifi      size={11} /> },
    HYBRID: { label: "Hybrid", icon: <Globe     size={11} /> },
    ONSITE: { label: "Onsite", icon: <Building2 size={11} /> },
  };
  const { label, icon } = map[type] ?? { label: type, icon: null };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      text-base font-medium bg-blue-50 text-blue-600 border border-blue-100">
      {icon}{label}
    </span>
  );
}

function levelLabel(level: string) {
  const map: Record<string, string> = {
    INTERN: "Intern", FRESHER: "Fresher", JUNIOR: "Junior",
    MIDDLE: "Middle", SENIOR: "Senior",   LEAD: "Lead", MANAGER: "Manager",
  };
  return map[level] ?? level;
}

function daysUntilDeadline(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { text: "Đã hết hạn",       urgent: true  };
  if (diff === 0) return { text: "Hết hạn hôm nay",  urgent: true  };
  if (diff <= 7)  return { text: `Còn ${diff} ngày`, urgent: true  };
  return           { text: `Còn ${diff} ngày`,        urgent: false };
}

// ── Rejection modal ───

const VIOLATION_LABELS: Record<string, string> = {
  DISCRIMINATION:      "Phân biệt đối xử",
  MISLEADING_SALARY:   "Lương không rõ ràng",
  ILLEGAL_REQUIREMENT: "Yêu cầu bất hợp pháp",
  TOXIC_LANGUAGE:      "Ngôn ngữ thiếu tôn trọng",
  UNREALISTIC_DEMAND:  "Yêu cầu không thực tế",
  SPAM:                "Nội dung spam",
  CONTACT_INFO:        "Thông tin liên hệ không hợp lệ",
  DUPLICATE:           "Bài đăng trùng lặp",
  INAPPROPRIATE:       "Nội dung không phù hợp",
  MISLEADING_INFO:     "Thông tin sai lệch",
};

function parseRejectionReason(raw: string) {
  const overallMatch = raw.match(/Nhận xét tổng thể:\s*(.+)$/s);
  const overall = overallMatch?.[1]?.trim() ?? null;
  const violations: { type: string; excerpt: string; reason: string; suggestion: string }[] = [];
  const pattern = /\d+\.\s+\[([^\]]+)\]\s*[\r\n]+\s*Nội dung vi phạm:\s*"([^"]+)"\s*[\r\n]+\s*Lý do:\s*([^\r\n]+)\s*[\r\n]+\s*Gợi ý sửa:\s*([^\r\n]+)/g;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    violations.push({ type: match[1], excerpt: match[2], reason: match[3].trim(), suggestion: match[4].trim() });
  }
  return { violations, overall };
}

function RejectionReasonModal({ jobId, reason, onClose }: {
  jobId: string; reason: string; onClose: () => void;
}) {
  const { violations, overall } = parseRejectionReason(reason);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">Lý do từ chối</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {violations.length > 0 ? violations.map((v, i) => (
            <div key={i} className="rounded-xl border border-red-100 bg-red-50 p-3 flex flex-col gap-1.5">
              <span className="inline-flex items-center text-base font-semibold
                text-red-600 bg-red-100 px-2 py-0.5 rounded-full w-fit">
                {VIOLATION_LABELS[v.type] ?? v.type}
              </span>
              <p className="text-base text-gray-700">
                <span className="font-medium text-gray-500">Vi phạm: </span>
                <span className="italic">"{v.excerpt}"</span>
              </p>
              <p className="text-base text-gray-600">
                <span className="font-medium text-gray-500">Lý do: </span>{v.reason}
              </p>
              <p className="text-base text-emerald-700">
                <span className="font-medium">💡 Gợi ý: </span>{v.suggestion}
              </p>
            </div>
          )) : (
            <pre className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
              {reason}
            </pre>
          )}
          {overall && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-base font-semibold text-gray-600 mb-1">Nhận xét tổng thể</p>
              <p className="text-base text-gray-700 leading-relaxed">{overall}</p>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-base font-semibold text-gray-600
              bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Đóng
          </button>
          <Link href={`/employer/jobs/${jobId}/edit`} onClick={onClose}
            className="flex-1 text-center py-2.5 text-base font-semibold
              text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors">
            Chỉnh sửa bài đăng
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Job card ──────────

function JobCard({
  job, acting, onSubmit, onClose, onDelete,
}: {
  job:      JobPost;
  acting:   boolean;
  onSubmit: (id: string) => void;
  onClose:  (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router   = useRouter();
  const deadline = daysUntilDeadline(job.deadline);
  const [showRejection, setShowRejection] = useState(false);
  const [showSuggest,   setShowSuggest]   = useState(false);

  // Chỉ hiện nút gợi ý khi bài đang PUBLISHED (có ứng viên để tìm)
  const canSuggest = job.status === "PUBLISHED";

  return (
  <>
    {/* 1. Thêm "flex flex-col h-full" vào thẻ bọc ngoài cùng */}
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm
      hover:border-gray-200 hover:shadow-md transition-all duration-200 p-5
      flex flex-col h-full">

      {/* Rejection banner */}
      {job.status === "REJECTED" && job.rejectionReason && (
        <button onClick={() => setShowRejection(true)}
          className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-xl
            bg-red-50 border border-red-100 text-base text-red-600
            hover:bg-red-100 transition-colors text-left shrink-0">
          <XCircle size={13} className="shrink-0" />
          <span className="flex-1 truncate">Bài đăng bị từ chối — Xem lý do</span>
          <ChevronRight size={13} className="shrink-0" />
        </button>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <Link 
            href={`/employer/jobs/${job.id}/edit`}
            className="text-base font-semibold text-gray-900 hover:text-violet-600
              transition-colors line-clamp-2 leading-snug min-h-[44px]"
          >
            {job.title}
          </Link>
          <p className="text-base text-gray-400 mt-0.5 truncate">
            {job.category} · {levelLabel(job.level ?? "")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(job.status)}
          {acting
            ? <span className="w-8 h-8 flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </span>
            : <JobActionMenu
                jobId={job.id}
                status={job.status}
                onSubmit={() => onSubmit(job.id)}
                onClose={() => onClose(job.id)}
                onDelete={() => onDelete(job.id)}
                onEdit={() => router.push(`/employer/jobs/${job.id}/edit`)}
                onView={() => router.push(`/jobs/${job.id}`)}
              />
          }
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.workLocationType && workTypeBadge(job.workLocationType)}
        {job.workLocationCity && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-base font-medium bg-gray-100 text-gray-600">
            <MapPin size={11} />{job.workLocationCity}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
          text-base font-medium bg-gray-100 text-gray-600">
          <Briefcase size={11} />
          {job.jobType === "FULL_TIME" ? "Full-time"
            : job.jobType === "PART_TIME" ? "Part-time"
            : job.jobType}
        </span>
      </div>

      {/* Salary */}
      <p className="text-base font-semibold text-gray-800 mb-4">{job.salaryDisplay}</p>

      {/* Stats - 2. Thêm "mt-auto" vào đây để ép nguyên khối Stats và Nút xuống đáy */}
      <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-gray-50 mt-auto">
        {/* Cột 1: Lượt xem */}
        <div className="flex items-center gap-1.5 text-base text-gray-500">
          <Eye size={13} className="text-gray-400 shrink-0" />
          <span>{job.viewCount} lượt xem</span>
        </div>

        {/* Cột 2: Đơn ứng tuyển */}
        <div className="flex items-center gap-1.5 text-base text-gray-500">
          <Users size={13} className="text-gray-400 shrink-0" />
          <Link href={`/employer/jobs/${job.id}/applications`}
            className="hover:text-violet-600 transition-colors">
            {job.applicationCount} đơn
          </Link>
        </div>

        {/* Cột 3 (trở thành hàng 2, cột 1): Vị trí */}
        <div className="flex items-center gap-1.5 text-base text-gray-500">
          <Users size={13} className="text-gray-400 shrink-0" />
          <span>{job.vacancies} vị trí</span>
        </div>

        {/* Cột 4 (trở thành hàng 2, cột 2): Hạn nộp */}
        <div className="flex items-center gap-1 text-base">
          <Clock size={12} className={deadline.urgent ? "text-red-400 shrink-0" : "text-gray-400 shrink-0"} />
          <span className={deadline.urgent ? "text-red-500 font-medium" : "text-gray-400"}>
            {deadline.text}
          </span>
        </div>
      </div>

      {/* AI Suggest button */}
      {canSuggest && (
        <button
          onClick={() => setShowSuggest(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5
            py-2 rounded-xl text-base font-medium
            text-white bg-[#155DFC] border border-[#155DFC] hover:bg-[#1253ED] transition-colors shrink-0"
        >
          <Sparkles size={13} />
          Gợi ý ứng viên phù hợp
        </button>
      )}
    </div>

    {/* Rejection modal */}
    {showRejection && job.rejectionReason && (
      <RejectionReasonModal
        jobId={job.id}
        reason={job.rejectionReason}
        onClose={() => setShowRejection(false)}
      />
    )}

    {/* Suggest panel (slide-over) */}
    {showSuggest && (
      <CandidateSuggestPanel
        jobPostId={job.id}
        jobTitle={job.title}
        onClose={() => setShowSuggest(false)}
      />
    )}
  </>
);
}

// ── Grid ──────────────

export function EmployerJobsCards({
  jobs, actingId, onSubmit, onClose, onDelete,
}: {
  jobs:     JobPost[];
  actingId: string | null;
  onSubmit: (id: string) => void;
  onClose:  (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          acting={actingId === job.id}
          onSubmit={onSubmit}
          onClose={onClose}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}