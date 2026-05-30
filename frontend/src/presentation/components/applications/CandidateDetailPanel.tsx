// src/presentation/components/applications/CandidateDetailPanel.tsx
"use client";
import { useState, useEffect }          from "react";
import { Mail, Phone, Calendar, Clock,
         Eye, Download, Loader2, Zap }  from "lucide-react";
import { CandidateAvatar }              from "./CandidateAvatar";
import { ApplicationStatusBadge }       from "./ApplicationStatusBadge";
import { StatusDropdown }               from "./StatusDropdown";
import { StatusTimeline }               from "./StatusTimeline";
import { AIScorePanel }                 from "./AIScorePanel";
import { ApplicationService }           from "@/application/services/ApplicationService";
import { ApplicationRepository }        from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                     from "@/presentation/components/ui/toast";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";
import type {
  ApplicationWithCandidate,
  ApplicationDetail,
  ApplicationStatus,
} from "@/domain/models/Application";

const service = new ApplicationService(new ApplicationRepository());

export function CandidateDetailPanel({
  app,
  onStatusChange,
  onScheduleInterview,
}: {
  app:                 ApplicationWithCandidate;
  onStatusChange:      (s: ApplicationStatus, note?: string) => void;
  onScheduleInterview: () => void;
}) {
  const toast = useToast();

  const [detail,        setDetail]        = useState<ApplicationDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(false);
  const [cvViewing,     setCvViewing]     = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  useEffect(() => {
    setDetail(null);
    setLoading(true);
    setError(false);
    service
      .getEmployerDetail(app.id)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [app.id]);

  const current   = detail ?? app;
  const candidate = detail?.candidate;
  const name      = candidate?.fullName  ?? app.candidateName;
  const avatar    = candidate?.avatarUrl ?? app.candidateAvatar;
  const email     = candidate?.email     ?? app.candidateEmail;
  const phone     = candidate?.phone     ?? app.candidatePhone;
  const boosted   = candidate?.boosted   ?? app.candidate?.boosted;
  const canSchedule = service.canScheduleInterview(current);

  const handleViewCV = async () => {
    setCvViewing(true);
    try { await service.viewCVAsEmployer(app.id); }
    catch (e) { toast.error("Không thể mở CV", extractErrorMessage(e)); }
    finally   { setCvViewing(false); }
  };

  const handleDownloadCV = async () => {
    setCvDownloading(true);
    try { await service.downloadCVAsEmployer(app.id, name); }
    catch (e) { toast.error("Không thể tải CV", extractErrorMessage(e)); }
    finally   { setCvDownloading(false); }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pb-4">

      {/* ── Header card ──────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl border shadow-sm
        ${boosted
          ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50"
          : "border-gray-100 bg-white"
        }`}
      >
        {/* Decorative top stripe for boosted */}
        {boosted && (
          <div className="h-[3px] w-full bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />
        )}

        <div className="flex items-center gap-4 px-4 pt-4 pb-3">
          {/* Avatar with optional ring + dot */}
          <div className="relative shrink-0">
            <div className={boosted
              ? "rounded-full ring-2 ring-amber-400 ring-offset-2"
              : ""
            }>
              <CandidateAvatar name={name} src={avatar} size="lg" />
            </div>
            {boosted && (
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center
                w-[18px] h-[18px] rounded-full bg-amber-400 border-2 border-white shadow-sm">
                <Zap size={9} strokeWidth={2.5} className="text-white" />
              </span>
            )}
          </div>

          {/* Name, badge, contact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                {name}
              </h2>
              {boosted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  text-[10px] font-semibold bg-amber-100 text-amber-800
                  border border-amber-300 whitespace-nowrap">
                  <Zap size={8} strokeWidth={2.5} className="text-amber-500" />
                  Ứng viên nổi bật
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              {email && (
                <a href={`mailto:${email}`}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate">
                  <Mail size={10} /> {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`}
                  className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Phone size={10} /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Boosted notice strip */}
        {boosted && (
          <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2
            bg-amber-50 border border-amber-200 rounded-lg">
            <Zap size={12} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-snug">
              Hồ sơ này được ưu tiên hiển thị nhờ tính năng <span className="font-semibold">Boost</span>.
            </p>
          </div>
        )}
      </div>

      {/* ── Status + actions ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <ApplicationStatusBadge status={current.status} />
          <StatusDropdown current={current.status} onChange={onStatusChange} />
        </div>

        {/* CV actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleViewCV}
            disabled={cvViewing || cvDownloading}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px]
              font-medium bg-gray-50 text-gray-700 border border-gray-100
              hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100
              disabled:opacity-50 transition-all"
          >
            {cvViewing
              ? <Loader2 size={12} className="animate-spin" />
              : <Eye size={12} />
            }
            {cvViewing ? "Đang mở..." : "Xem CV"}
          </button>

          <button
            onClick={handleDownloadCV}
            disabled={cvViewing || cvDownloading}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px]
              font-medium bg-gray-50 text-gray-700 border border-gray-100
              hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100
              disabled:opacity-50 transition-all"
          >
            {cvDownloading
              ? <Loader2 size={12} className="animate-spin" />
              : <Download size={12} />
            }
            {cvDownloading ? "Đang tải..." : "Tải CV"}
          </button>
        </div>

        {/* Schedule interview */}
        {canSchedule && (
          <button
            onClick={onScheduleInterview}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-[12px]
              font-medium bg-violet-50 text-violet-700 border border-violet-200
              hover:bg-violet-100 transition-all"
          >
            <Calendar size={12} /> Lên lịch phỏng vấn
          </button>
        )}
      </div>

      {/* ── Application info ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Thông tin đơn
        </p>
        <div className="flex flex-col divide-y divide-gray-50">
          <div className="flex items-center justify-between py-2 text-[12px]">
            <span className="text-gray-500">Ngày nộp</span>
            <span className="font-medium text-gray-800">
              {new Date(current.appliedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {current.expectedSalary != null && (
            <div className="flex items-center justify-between py-2 text-[12px]">
              <span className="text-gray-500">Lương mong muốn</span>
              <span className="font-semibold text-blue-600">
                {Number(current.expectedSalary).toLocaleString()} VND
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Score ─────────────────────────────────────────────── */}
      {detail?.aiScore && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <AIScorePanel score={detail.aiScore} />
        </div>
      )}

      {/* ── Cover letter ─────────────────────────────────────────── */}
      {current.coverLetter && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Thư xin việc
          </p>
          <p className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-line">
            {current.coverLetter}
          </p>
        </div>
      )}

      {/* ── Interview info ────────────────────────────────────────── */}
      {current.scheduledAt && (
        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
          <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest
            mb-2 flex items-center gap-1.5">
            <Clock size={11} /> Lịch phỏng vấn
          </p>
          <p className="text-[13px] font-semibold text-gray-900">
            {new Date(current.scheduledAt).toLocaleString("vi-VN")}
          </p>
          {current.interviewLocation && (
            <p className="text-[11px] text-gray-600 mt-0.5">{current.interviewLocation}</p>
          )}
          {current.interviewNote && (
            <p className="text-[11px] text-gray-400 mt-1 italic">{current.interviewNote}</p>
          )}
        </div>
      )}

      {/* ── Status timeline ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Lịch sử trạng thái
        </p>
        <StatusTimeline logs={detail?.statusHistory ?? []} loading={loading} />
        {error && (
          <p className="text-[11px] text-red-400 italic mt-1">
            Không thể tải lịch sử trạng thái.
          </p>
        )}
      </div>

    </div>
  );
}