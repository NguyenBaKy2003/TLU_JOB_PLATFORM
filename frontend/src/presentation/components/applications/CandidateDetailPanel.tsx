// src/presentation/components/applications/CandidateDetailPanel.tsx
"use client";
import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, Clock,
         Eye, Download, Loader2 }        from "lucide-react";
import { CandidateAvatar }               from "./CandidateAvatar";
import { ApplicationStatusBadge }        from "./ApplicationStatusBadge";
import { StatusDropdown }                from "./StatusDropdown";
import { StatusTimeline }                from "./StatusTimeline";
import { AIScorePanel }                  from "./AIScorePanel";
import { ApplicationService }            from "@/application/services/ApplicationService";
import { ApplicationRepository }         from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                      from "@/presentation/components/ui/toast";
import { extractErrorMessage }           from "@/lib/extractErrorMessage";
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

  const [detail,  setDetail]  = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // CV action states
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

  // Dùng detail nếu đã load, fallback về app từ list
  const current     = detail ?? app;
  const candidate   = detail?.candidate;
  const name        = candidate?.fullName  ?? app.candidateName;
  const avatar      = candidate?.avatarUrl ?? app.candidateAvatar;
  const email       = candidate?.email     ?? app.candidateEmail;
  const phone       = candidate?.phone     ?? app.candidatePhone;
  const canSchedule = service.canScheduleInterview(current);

  // ── CV actions ───────
  // FIX: Dùng service thay vì <a href={cvUrl}> trực tiếp.
  // Request đi qua /employer/applications/{id}/cv/view|download
  // → được kiểm tra auth 2 lớp ở backend. S3 URL không lộ ra client.
  const handleViewCV = async () => {
    setCvViewing(true);
    try {
      await service.viewCVAsEmployer(app.id);
    } catch (e) {
      toast.error("Không thể mở CV", extractErrorMessage(e));
    } finally {
      setCvViewing(false);
    }
  };

  const handleDownloadCV = async () => {
    setCvDownloading(true);
    try {
      await service.downloadCVAsEmployer(app.id, name);
    } catch (e) {
      toast.error("Không thể tải CV", extractErrorMessage(e));
    } finally {
      setCvDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pb-4">

      {/* ── Candidate header ─── */}
      <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <CandidateAvatar name={name} src={avatar} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{name}</p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
              >
                <Mail size={11} /> {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={11} /> {phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Status + actions ─── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <ApplicationStatusBadge status={current.status} />
          <StatusDropdown current={current.status} onChange={onStatusChange} />
        </div>

        <div className="flex flex-col gap-2">
          {/* CV: Xem + Tải */}
          <div className="flex gap-2">
            <button
              onClick={handleViewCV}
              disabled={cvViewing || cvDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50
                rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50
                hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              {cvViewing
                ? <Loader2 size={13} className="animate-spin" />
                : <Eye size={13} />
              }
              {cvViewing ? "Đang mở..." : "Xem CV"}
            </button>

            <button
              onClick={handleDownloadCV}
              disabled={cvViewing || cvDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50
                rounded-xl text-xs font-medium text-gray-700 hover:bg-green-50
                hover:text-green-600 transition-colors disabled:opacity-60"
            >
              {cvDownloading
                ? <Loader2 size={13} className="animate-spin" />
                : <Download size={13} />
              }
              {cvDownloading ? "Đang tải..." : "Tải CV"}
            </button>
          </div>

          {/* Lên lịch phỏng vấn */}
          {canSchedule && (
            <button
              onClick={onScheduleInterview}
              className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl text-xs
                font-medium text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <Calendar size={13} /> Lên lịch phỏng vấn
            </button>
          )}
        </div>
      </div>

      {/* ── Application info ─── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Thông tin đơn
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-[16px]">
            <span className="text-gray-500">Ngày nộp</span>
            <span className="font-medium text-gray-800">
              {new Date(current.appliedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {current.expectedSalary != null && (
            <div className="flex justify-between text-[16px]">
              <span className="text-gray-500">Lương mong muốn</span>
              <span className="font-medium text-blue-600">
                {Number(current.expectedSalary).toLocaleString()} VND
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Score ──── */}
      {detail?.aiScore && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <AIScorePanel score={detail.aiScore} />
        </div>
      )}

      {/* ── Cover letter  */}
      {current.coverLetter && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Thư xin việc
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed whitespace-pre-line">
            {current.coverLetter}
          </p>
        </div>
      )}

      {/* ── Interview info ───── */}
      {current.scheduledAt && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <Clock size={12} /> Lịch phỏng vấn
          </p>
          <p className="text-[16px] font-semibold text-gray-900">
            {new Date(current.scheduledAt).toLocaleString("vi-VN")}
          </p>
          {current.interviewLocation && (
            <p className="text-xs text-gray-600 mt-0.5">{current.interviewLocation}</p>
          )}
          {current.interviewNote && (
            <p className="text-xs text-gray-500 mt-1 italic">{current.interviewNote}</p>
          )}
        </div>
      )}

      {/* ── Status timeline ──── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Lịch sử trạng thái
        </p>
        <StatusTimeline logs={detail?.statusHistory ?? []} loading={loading} />
        {error && (
          <p className="text-xs text-red-400 italic">Không thể tải lịch sử trạng thái.</p>
        )}
      </div>
    </div>
  );
}