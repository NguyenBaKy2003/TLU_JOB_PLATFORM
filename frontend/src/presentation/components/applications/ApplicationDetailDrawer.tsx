"use client";
import { useEffect, useState }         from "react";
import { X, Clock, MapPin,
         User, Mail, Phone,
         Eye, Download, Loader2 }      from "lucide-react";
import { ApplicationStatusBadge }      from "@/presentation/components/applications/ApplicationStatusBadge";
import { StatusTimeline }              from "@/presentation/components/applications/StatusTimeline";
import { AIScorePanel }                from "@/presentation/components/applications/AIScorePanel";
import { StartConversationButton }     from "@/presentation/components/applications/StartConversationButton";
import { ApplicationService }          from "@/application/services/ApplicationService";
import { ApplicationRepository }       from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                    from "@/presentation/components/ui/toast";
import { extractErrorMessage }         from "@/lib/extractErrorMessage";
import type { ApplicationDetail }      from "@/domain/models/Application";
import type { ApplicationStatus }      from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS }   from "@/domain/models/Application";

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

interface Props {
  applicationId: string;
  onClose:       () => void;
  onUpdated?:    (app: ApplicationDetail) => void;
  /** "employer" shows schedule interview + start conversation; "admin" shows read-only */
  role:          "employer" | "admin";
}

export function ApplicationDetailDrawer({ applicationId, onClose, onUpdated, role }: Props) {
  const toast = useToast();

  const [detail,         setDetail]         = useState<ApplicationDetail | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [statusNote,     setStatusNote]     = useState("");
  const [updating,       setUpdating]       = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // CV action states
  const [cvViewing,     setCvViewing]     = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await service.getEmployerDetail(applicationId);
        setDetail(data);
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!detail) return;
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      await service.updateStatus(detail.id, newStatus, statusNote || undefined);
      const refreshed = await service.getEmployerDetail(applicationId);
      setDetail(refreshed);
      onUpdated?.(refreshed);
      setStatusNote("");
    } catch (e) {
      toast.error("Lỗi cập nhật", extractErrorMessage(e));
    } finally {
      setUpdating(false);
    }
  };

  // ── CV actions ─────────
  // Dùng service thay vì href trực tiếp → request đi qua auth middleware backend,
  // không lộ S3 URL ra ngoài.
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

  const allowedNext = detail ? (ALLOWED_TRANSITIONS[detail.status] ?? []) : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl
        flex flex-col overflow-hidden">

        {/* ── Header ────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-[16px] font-semibold text-gray-800">Chi tiết đơn ứng tuyển</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ──────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-20 bg-gray-100 rounded-2xl" />
              <div className="h-8  bg-gray-100 rounded-xl" />
              <div className="h-32 bg-gray-100 rounded-2xl" />
            </div>
          )}

          {!loading && detail && (
            <>
              {/* ── Candidate card ──────────── */}
              {detail.candidate && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  {detail.candidate.avatarUrl ? (
                    <img
                      src={detail.candidate.avatarUrl}
                      alt={detail.candidate.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200
                      flex items-center justify-center">
                      <User size={20} className="text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-gray-900 truncate">
                      {detail.candidate.fullName}
                    </p>
                    {detail.candidate.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={10} /> {detail.candidate.email}
                      </p>
                    )}
                    {detail.candidate.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} /> {detail.candidate.phone}
                      </p>
                    )}
                  </div>
                  {role === "employer" && (
                    <StartConversationButton
                      candidateId={detail.candidateId}
                      jobPostId={detail.jobPostId}
                      size="sm"
                      variant="ghost"
                    />
                  )}
                </div>
              )}

              {/* ── Status + update ─────────── */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Trạng thái:</span>
                  <ApplicationStatusBadge status={detail.status} size="md" />
                </div>

                {role === "employer" && allowedNext.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(v => !v)}
                      disabled={updating}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white
                        rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors
                        flex items-center gap-1.5"
                    >
                      {updating && <Loader2 size={11} className="animate-spin" />}
                      {updating ? "Đang cập nhật..." : "Cập nhật"}
                    </button>

                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-1 z-10 bg-white border
                        border-gray-200 rounded-xl shadow-lg min-w-[180px] py-1 flex flex-col">
                        {allowedNext.map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className="px-4 py-2 text-xs text-left text-gray-700
                              hover:bg-gray-50 transition-colors"
                          >
                            → {APPLICATION_STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Status note (employer only) ────────────── */}
              {role === "employer" && allowedNext.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">
                    Ghi chú khi đổi trạng thái (tuỳ chọn)
                  </label>
                  <input
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="Nhập ghi chú..."
                    className="border border-gray-200 rounded-xl px-3 py-2 text-[16px]
                      outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              {/* ── Meta ────── */}
              <div className="grid grid-cols-2 gap-2">
                <InfoItem
                  label="Ngày nộp"
                  value={new Date(detail.appliedAt).toLocaleDateString("vi-VN")}
                />
                {detail.expectedSalary && (
                  <InfoItem label="Lương mong muốn" value={String(detail.expectedSalary)} />
                )}
              </div>

              {/* ── AI Score ── */}
              {detail.aiScore && <AIScorePanel score={detail.aiScore} />}

              {/* ── Interview ─ */}
              {detail.interviewScheduledAt && (
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                  <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                    <Clock size={12} /> Lịch phỏng vấn
                  </p>
                  <p className="text-[16px] font-semibold text-gray-900">
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

              {/* ── Cover letter ────────────── */}
              {detail.coverLetter && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Thư xin việc
                  </p>
                  <p className="text-[16px] text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 whitespace-pre-line">
                    {detail.coverLetter}
                  </p>
                </div>
              )}

              {/* ── CV actions ─ */}
              {/* FIX: Dùng service thay vì <a href={cvUrl}> trực tiếp.
                  Request đi qua /employer/applications/{id}/cv/view|download
                  → được kiểm tra auth 2 lớp ở backend (employer owner + application thuộc company).
                  S3 URL không bị lộ ra client. */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
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

              {/* ── Status timeline ─────────── */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  Lịch sử trạng thái
                </p>
                <StatusTimeline logs={detail.statusHistory ?? []} />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ────── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[16px] font-medium text-gray-600
              hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-[16px] font-medium text-gray-800">{value}</p>
    </div>
  );
}