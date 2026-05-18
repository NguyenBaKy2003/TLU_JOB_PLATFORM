"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Clock,
  MapPin, User, Mail, Phone,
  Eye, Download, Loader2, Calendar,
} from "lucide-react";

import { ApplicationStatusBadge }   from "@/presentation/components/applications/ApplicationStatusBadge";
import { StatusTimeline }           from "@/presentation/components/applications/StatusTimeline";
import { AIScorePanel }             from "@/presentation/components/applications/AIScorePanel";
import { StartConversationButton }  from "@/presentation/components/applications/StartConversationButton";
import { ScheduleInterviewModal }   from "@/presentation/components/applications/ScheduleInterviewModal";

import { ApplicationService }    from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";

import type { ApplicationDetail, ApplicationStatus } from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS }                 from "@/domain/models/Application";
import { extractErrorMessage }                       from "@/lib/extractErrorMessage";
import { useToast }                                  from "@/presentation/components/ui/toast";

const service = new ApplicationService(new ApplicationRepository());

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED:           ["REVIEWING", "REJECTED"],
  PENDING:             ["REVIEWING", "REJECTED"],
  REVIEWING:           ["SHORTLISTED", "REJECTED"],
  SHORTLISTED:         ["INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["INTERVIEWED", "REJECTED"],
  INTERVIEWED:         ["OFFERED", "REJECTED"],
  OFFERED:             ["HIRED", "DECLINED"],
  HIRED:               [],
  ACCEPTED:            ["HIRED"],
  DECLINED:            [],
  REJECTED:            [],
  WITHDRAWN:           [],
  CANCELLED:           [],
};

export default function EmployerApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast  = useToast();

  const [detail,         setDetail]         = useState<ApplicationDetail | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [statusNote,     setStatusNote]     = useState("");
  const [updating,       setUpdating]       = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // CV action states
  const [cvViewing,     setCvViewing]     = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  // Interview scheduling state
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await service.getEmployerDetail(params.id);
        setDetail(data);
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, toast]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!detail) return;
    setUpdating(true);
    try {
      await service.updateStatus(detail.id, newStatus, statusNote || undefined);
      const refreshed = await service.getEmployerDetail(detail.id);
      setDetail(refreshed);
      setStatusNote("");
      setShowStatusMenu(false);
    } catch (e) {
      toast.error("Lỗi cập nhật", extractErrorMessage(e));
    } finally {
      setUpdating(false);
    }
  };

  // ── CV actions ──────────
  const handleViewCV = async () => {
    if (!detail) return;
    setCvViewing(true);
    try {
      await service.viewCVAsEmployer(detail.id);
    } catch (e) {
      toast.error("Không thể mở CV", extractErrorMessage(e));
    } finally {
      setCvViewing(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!detail) return;
    setCvDownloading(true);
    try {
      const candidateName = detail.candidate?.fullName ?? "ung-vien";
      await service.downloadCVAsEmployer(detail.id, candidateName);
    } catch (e) {
      toast.error("Không thể tải CV", extractErrorMessage(e));
    } finally {
      setCvDownloading(false);
    }
  };

  // ── Interview scheduling ──────────
  const canScheduleInterview = detail?.status === "SHORTLISTED";

  const handleScheduleSuccess = async () => {
    if (!detail) return;
    try {
      const refreshed = await service.getEmployerDetail(detail.id);
      setDetail(refreshed);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    }
    setShowSchedule(false);
  };

  const allowedNext = detail ? (ALLOWED_TRANSITIONS[detail.status] ?? []) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-[16px] text-gray-500">Không tìm thấy dữ liệu</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Back button */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[16px] text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">

          {/* ── Candidate info ─── */}
          {detail.candidate && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              {detail.candidate.avatarUrl ? (
                <img
                  src={detail.candidate.avatarUrl}
                  alt={detail.candidate.fullName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {detail.candidate.fullName}
                </p>
                {detail.candidate.email && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail size={10} /> {detail.candidate.email}
                  </p>
                )}
                {detail.candidate.phone && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {detail.candidate.phone}
                  </p>
                )}
              </div>

              <StartConversationButton
                candidateId={detail.candidateId}
                jobPostId={detail.jobPostId}
              />
            </div>
          )}

          {/* ── Status + Update ── */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ApplicationStatusBadge status={detail.status} />

            {allowedNext.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(v => !v)}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5
                    rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors
                    disabled:opacity-60"
                >
                  {updating && <Loader2 size={12} className="animate-spin" />}
                  Cập nhật trạng thái
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-100
                    rounded-xl shadow-lg z-10 min-w-[160px] py-1 overflow-hidden">
                    {allowedNext.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="block w-full px-4 py-2.5 text-[16px] text-left text-gray-700
                          hover:bg-gray-50 transition-colors"
                      >
                        {APPLICATION_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Schedule Interview (SHORTLISTED only) ── */}
          {canScheduleInterview && (
            <div className="flex items-center justify-between gap-3 p-4 bg-purple-50
              border border-purple-100 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-purple-800">Ứng viên đã được rút gọn</p>
                  <p className="text-xs text-purple-500 mt-0.5">Bạn có thể lên lịch phỏng vấn ngay bây giờ</p>
                </div>
              </div>
              <button
                onClick={() => setShowSchedule(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-600
                  text-white text-xs font-semibold rounded-xl hover:bg-purple-700
                  transition-colors whitespace-nowrap"
              >
                <Calendar size={13} />
                Lên lịch
              </button>
            </div>
          )}

          {/* ── Meta info ─ */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem
              label="Ngày nộp"
              value={new Date(detail.appliedAt).toLocaleDateString("vi-VN")}
            />
            {detail.expectedSalary && (
              <InfoItem
                label="Lương mong muốn"
                value={String(detail.expectedSalary)}
              />
            )}
          </div>

          {/* ── AI Score ── */}
          {detail.aiScore && <AIScorePanel score={detail.aiScore} />}

          {/* ── Interview info ─── */}
          {detail.interviewScheduledAt && (
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
              <p className="text-[16px] font-semibold text-purple-700 flex items-center gap-1.5 mb-2">
                <Clock size={14} /> Lịch phỏng vấn
              </p>
              <p className="text-[16px] font-medium text-gray-900">
                {new Date(detail.interviewScheduledAt).toLocaleString("vi-VN")}
              </p>
              {detail.interviewLocation && (
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <MapPin size={11} /> {detail.interviewLocation}
                </p>
              )}
              {detail.interviewNote && (
                <p className="text-xs text-gray-500 mt-1">{detail.interviewNote}</p>
              )}
            </div>
          )}

          {/* ── CV actions  */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              CV ứng viên
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleViewCV}
                disabled={cvViewing || cvDownloading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                  rounded-xl text-[16px] font-medium text-gray-700 hover:border-blue-300
                  hover:text-blue-600 transition-colors disabled:opacity-60"
              >
                {cvViewing
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Eye size={14} />
                }
                {cvViewing ? "Đang mở..." : "Xem CV"}
              </button>

              <button
                onClick={handleDownloadCV}
                disabled={cvViewing || cvDownloading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                  rounded-xl text-[16px] font-medium text-gray-700 hover:border-green-300
                  hover:text-green-600 transition-colors disabled:opacity-60"
              >
                {cvDownloading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Download size={14} />
                }
                {cvDownloading ? "Đang tải..." : "Tải CV"}
              </button>
            </div>
          </div>

          {/* ── Status timeline ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Lịch sử trạng thái
            </p>
            <StatusTimeline logs={detail.statusHistory ?? []} />
          </div>

        </div>
      </div>

      {/* ── Schedule Interview Modal ── */}
      {showSchedule && detail && (
        <ScheduleInterviewModal
          applicationId={detail.id}
          candidateName={detail.candidate?.fullName ?? "Ứng viên"}
          onSuccess={handleScheduleSuccess}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-[16px] font-medium text-gray-800">{value}</p>
    </div>
  );
}