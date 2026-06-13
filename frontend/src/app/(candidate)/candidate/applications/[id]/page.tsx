"use client";
import { useState, useEffect }    from "react";
import { useParams, useRouter }   from "next/navigation";
import Link                       from "next/link";
import {
  Briefcase, MapPin, Clock, ArrowLeft,
  ChevronRight, BadgeCheck, X, Eye, Sparkles,
  Building2, Calendar, TrendingUp, GraduationCap, Wrench,
  Loader2, Download,
} from "lucide-react";
import { ApplicationStatusBadge } from "@/presentation/components/applications/ApplicationStatusBadge";
import { StatusTimeline }         from "@/presentation/components/applications/StatusTimeline";
import { ApplicationService }     from "@/application/services/ApplicationService";
import { ApplicationRepository }  from "@/infrastructure/repositories/ApplicationRepository";
import type { ApplicationDetail } from "@/domain/models/Application";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import { useToast }               from "@/presentation/components/ui/toast";

const service = new ApplicationService(new ApplicationRepository());

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  "Toàn thời gian",
  PART_TIME:  "Bán thời gian",
  REMOTE:     "Remote",
  CONTRACT:   "Hợp đồng",
  INTERNSHIP: "Thực tập",
  FREELANCE:  "Freelance",
};

const LEVEL_LABELS: Record<string, string> = {
  INTERN:    "Thực tập sinh",
  FRESHER:   "Fresher",
  JUNIOR:    "Junior",
  MID:       "Middle",
  SENIOR:    "Senior",
  LEAD:      "Lead",
  MANAGER:   "Manager",
  DIRECTOR:  "Director",
};

// ── Skeleton ─────────
function PageSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5 max-w-2xl mx-auto px-4 py-6">
      <div className="h-4 w-32 bg-gray-100 rounded" />
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-24 bg-gray-100 rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}

// ── AI Score ring ─────
function ScoreRing({ score }: { score: number }) {
  const r      = 28;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : "#f59e0b";
  return (
    <svg width="72" height="72" className="shrink-0 -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700" />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        className="rotate-90" style={{ rotate: "90deg", transformOrigin: "36px 36px" }}
        fill={color} fontSize="14" fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

// ── Score bar ─────────
function ScoreBar({ label, value, icon }: {
  label: string; value: number; icon: React.ReactNode;
}) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}%</span>
    </div>
  );
}

// ── Page ──────────────
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast  = useToast();

  const [app,           setApp]           = useState<ApplicationDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [withdrawing,   setWithdrawing]   = useState(false);
  const [accepting,     setAccepting]     = useState(false);
  const [declining,     setDeclining]     = useState(false);
  const [cvViewing,     setCvViewing]     = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await service.getById(params.id);
        setApp(data as ApplicationDetail);
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, toast]);

  // ── Handlers ─────

  const handleWithdraw = async () => {
    if (!app) return;
    setWithdrawing(true);
    try {
      await service.withdraw(app.id);
      toast.success("Đã rút đơn", "Đơn ứng tuyển đã được rút thành công.");
      router.push("/candidate/applications");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setWithdrawing(false); }
  };

  const handleAcceptOffer = async () => {
    if (!app) return;
    setAccepting(true);
    try {
      const updated = await service.acceptOffer(app.id);
      setApp(prev => prev ? { ...prev, status: updated.status } : prev);
      toast.success("Chúc mừng!", "Bạn đã chấp nhận offer thành công.");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setAccepting(false); }
  };

  const handleDeclineOffer = async () => {
    if (!app) return;
    setDeclining(true);
    try {
      const updated = await service.declineOffer(app.id);
      setApp(prev => prev ? { ...prev, status: updated.status } : prev);
      toast.success("Đã từ chối", "Bạn đã từ chối offer của nhà tuyển dụng.");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally { setDeclining(false); }
  };

  const handleViewCV = async () => {
    if (!app) return;
    setCvViewing(true);
    try {
      await service.viewCVAsCandidate(app.id);
    } catch (e) {
      toast.error("Không thể mở CV", extractErrorMessage(e));
    } finally { setCvViewing(false); }
  };

  const handleDownloadCV = async () => {
    if (!app) return;
    setCvDownloading(true);
    try {
      await service.downloadCVAsCandidate(app.id, "cv-da-nop");
    } catch (e) {
      toast.error("Không thể tải CV", extractErrorMessage(e));
    } finally { setCvDownloading(false); }
  };

  // ── Render ───────

  if (loading) return <PageSkeleton />;

  if (!app) {
    return (
      <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
        <Briefcase size={40} strokeWidth={1.2} />
        <p className="text-sm">Không tìm thấy đơn ứng tuyển</p>
        <Link href="/candidate/applications" className="text-sm text-blue-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const canWithdraw     = service.canWithdraw(app);
  const canAcceptOffer  = service.canAcceptOffer(app);
  const canDeclineOffer = service.canDeclineOffer(app);

  const jobTitle    = app.job?.title       ?? "—";
  const companyName = app.company?.name    ?? "—";
  const companyLogo = app.company?.logoUrl ?? null;
  const city        = app.company?.city    ?? null;
  const jobType     = app.job?.jobType ? JOB_TYPE_LABELS[app.job.jobType] ?? app.job.jobType : null;
  const level       = app.job?.level   ? LEVEL_LABELS[app.job.level]     ?? app.job.level   : null;
  const salary      = (app.job as any)?.salary ?? null;
  const scheduledAt = app.interviewScheduledAt ?? app.scheduledAt ?? null;
  const aiScore     = app.aiScore as any;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-gray-400">
        <Link href="/candidate/applications"
          className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ArrowLeft size={13} /> Đơn ứng tuyển
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[220px]">{jobTitle}</span>
      </nav>

      {/* ── Job hero card ── */}
      <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100
          shrink-0 flex items-center justify-center">
          {companyLogo
            ? <img src={companyLogo} alt={companyName} className="w-full h-full object-contain p-1" />
            : <Building2 size={22} className="text-gray-300" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{companyName}</p>
          <p className="text-base font-semibold text-gray-900 leading-snug mt-0.5 line-clamp-2">
            {jobTitle}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {jobType && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                {jobType}
              </span>
            )}
            {level && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full">
                {level}
              </span>
            )}
            {city && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px]
                font-medium bg-gray-100 text-gray-600 rounded-full">
                <MapPin size={9} /> {city}
              </span>
            )}
            {salary && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50
                text-emerald-700 rounded-full ml-auto">
                {salary}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Status row ── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-500 font-medium">Trạng thái hiện tại</span>
        <ApplicationStatusBadge status={app.status} />
      </div>

      {/* ── Offer banner ── */}
      {canAcceptOffer && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <BadgeCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Bạn đã nhận được offer!</p>
            <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
              Hãy xem xét và phản hồi nhà tuyển dụng. Chấp nhận nếu bạn đồng ý với các điều kiện đề ra.
            </p>
          </div>
        </div>
      )}

      {/* ── Interview card ── */}
      {scheduledAt && (
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex flex-col gap-2">
          <p className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
            <Calendar size={12} /> Lịch phỏng vấn
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(scheduledAt).toLocaleString("vi-VN")}
          </p>
          {app.interviewLocation && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin size={11} className="shrink-0" /> {app.interviewLocation}
            </p>
          )}
          {app.interviewNote && (
            <p className="text-xs text-gray-500 italic">{app.interviewNote}</p>
          )}
        </div>
      )}

      {/* ── AI Score card ── */}
      {app.aiScoreCalculated && aiScore && (
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles size={12} className="text-amber-500" /> Đánh giá AI
          </p>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
              <ScoreRing score={aiScore.score} />
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                aiScore.score >= 80
                  ? "bg-emerald-50 text-emerald-700"
                  : aiScore.score >= 60
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
              }`}>
                {aiScore.label}
              </span>
            </div>
            {aiScore.summary && (
              <p className="flex-1 text-xs text-gray-600 leading-relaxed pt-1">
                {aiScore.summary}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <ScoreBar label="Kỹ năng"     value={aiScore.skillMatchScore} icon={<Wrench size={13} />} />
            <ScoreBar label="Kinh nghiệm" value={aiScore.experienceScore} icon={<TrendingUp size={13} />} />
            <ScoreBar label="Học vấn"     value={aiScore.educationScore}  icon={<GraduationCap size={13} />} />
          </div>
        </div>
      )}

      {/* ── Application details ── */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 text-sm">
          <span className="text-gray-500">Ngày nộp đơn</span>
          <span className="font-medium text-gray-800">
            {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
        {app.updatedAt && app.updatedAt !== app.appliedAt && (
          <div className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-gray-500">Cập nhật lần cuối</span>
            <span className="font-medium text-gray-800">
              {new Date(app.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        )}
        {app.expectedSalary && (
          <div className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-gray-500">Mức lương mong muốn</span>
            <span className="font-medium text-gray-800">{app.expectedSalary}</span>
          </div>
        )}
        {app.job?.deadline && (
          <div className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Clock size={12} /> Hạn nộp hồ sơ
            </span>
            <span className={`font-medium ${
              new Date(app.job.deadline) < new Date() ? "text-red-500" : "text-gray-800"
            }`}>
              {new Date(app.job.deadline).toLocaleDateString("vi-VN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Cover letter ── */}
      {app.coverLetter && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Thư xin việc
          </p>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-100
            rounded-xl p-4 whitespace-pre-line">
            {app.coverLetter}
          </p>
        </div>
      )}

      {/* ── CV đã nộp ── */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          CV đã nộp
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleViewCV}
            disabled={cvViewing || cvDownloading}
            className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200
              rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600
              transition-colors shadow-sm disabled:opacity-60"
          >
            {cvViewing
              ? <Loader2 size={15} className="animate-spin text-blue-500" />
              : <Eye size={15} className="text-blue-500" />
            }
            {cvViewing ? "Đang mở..." : "Xem CV"}
          </button>

          <button
            onClick={handleDownloadCV}
            disabled={cvViewing || cvDownloading}
            className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200
              rounded-xl text-sm font-medium text-gray-700 hover:border-green-300 hover:text-green-600
              transition-colors shadow-sm disabled:opacity-60"
          >
            {cvDownloading
              ? <Loader2 size={15} className="animate-spin text-green-500" />
              : <Download size={15} className="text-green-500" />
            }
            {cvDownloading ? "Đang tải..." : "Tải CV"}
          </button>
        </div>
      </div>

      {/* ── Status timeline ── */}
      {(app.statusHistory?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Lịch sử trạng thái
          </p>
          <StatusTimeline logs={app.statusHistory} loading={false} />
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2 pt-2 pb-8">
        <Link href={`/jobs/${app.jobPostId}`}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium
            text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Eye size={15} /> Xem tin tuyển dụng
        </Link>

        {canAcceptOffer && (
          <button onClick={handleAcceptOffer} disabled={accepting}
            className="flex items-center justify-center gap-2 py-3 text-sm font-semibold
              text-white bg-emerald-600 rounded-xl hover:bg-emerald-700
              transition-colors disabled:opacity-50">
            <BadgeCheck size={15} />
            {accepting ? "Đang xử lý..." : "Chấp nhận offer"}
          </button>
        )}

        {canDeclineOffer && (
          <button onClick={handleDeclineOffer} disabled={declining || accepting}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium
              text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100
              border border-orange-200 transition-colors disabled:opacity-50">
            <X size={15} />
            {declining ? "Đang xử lý..." : "Từ chối offer"}
          </button>
        )}

        {canWithdraw && (
          <button onClick={handleWithdraw} disabled={withdrawing}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium
              text-red-600 bg-red-50 rounded-xl hover:bg-red-100
              border border-red-200 transition-colors disabled:opacity-50">
            <X size={15} />
            {withdrawing ? "Đang rút đơn..." : "Rút đơn ứng tuyển"}
          </button>
        )}
      </div>
    </div>
  );
}