"use client";
import { useState, useEffect }                    from "react";
import { useParams, useRouter }                    from "next/navigation";
import Link                                        from "next/link";
import {
  Briefcase, Eye, X, FileText, MapPin, Clock,
  ArrowLeft, ChevronRight,
} from "lucide-react";
import { ApplicationStatusBadge }                  from "@/presentation/components/applications/ApplicationStatusBadge";
import { StatusTimeline }                          from "@/presentation/components/applications/StatusTimeline";
import { ApplicationService }                      from "@/application/services/ApplicationService";
import { ApplicationRepository }                   from "@/infrastructure/repositories/ApplicationRepository";
import type { ApplicationDetail }                  from "@/domain/models/Application";
import { extractErrorMessage }                     from "@/lib/extractErrorMessage";
import { useToast }                                from "@/presentation/components/ui/toast";

const service = new ApplicationService(new ApplicationRepository());

// ── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5 max-w-2xl mx-auto px-4 py-6">
      <div className="h-4 w-32 bg-gray-100 rounded" />
      <div className="h-24 bg-gray-100 rounded-2xl" />
      <div className="h-6 bg-gray-100 rounded w-1/3" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full" />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast  = useToast();

  const [app,         setApp]         = useState<ApplicationDetail | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  // Load application detail — job, company, statusHistory đã có trong một response
  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await service.getById(params.id);
        setApp(data);
      } catch (e) {
        toast.error("Lỗi", extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, toast]);

  const handleWithdraw = async () => {
    if (!app) return;
    setWithdrawing(true);
    try {
      await service.withdraw(app.id);
      toast.success("Đã rút đơn", "Đơn ứng tuyển đã được rút thành công.");
      router.push("/candidate/applications");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setWithdrawing(false);
    }
  };

  // ── Loading / not found ──────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  if (!app) {
    return (
      <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
        <Briefcase size={40} strokeWidth={1.2} />
        <p className="text-sm">Không tìm thấy đơn ứng tuyển</p>
        <Link
          href="/candidate/applications"
          className="text-sm text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const canWithdraw  = service.canWithdraw(app);
  const jobTitle     = app.job?.title     ?? "—";
  const companyName  = app.company?.name  ?? "—";
  const companyLogo  = app.company?.logoUrl ?? null;
  const jobCity      = app.job?.city      ?? null;
  const jobType      = app.job?.jobType   ?? null;
  // backend field: interviewScheduledAt (ApplicationDetailResponse) hoặc scheduledAt (Application base)
  const scheduledAt  = app.interviewScheduledAt ?? app.scheduledAt ?? null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Breadcrumb / Back */}
      <nav className="flex items-center gap-1 text-xs text-gray-400">
        <Link
          href="/candidate/applications"
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Đơn ứng tuyển
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[200px]">{jobTitle}</span>
      </nav>

      {/* Job info card */}
      <div className="flex gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100
          shrink-0 flex items-center justify-center">
          {companyLogo
            ? <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
            : <Briefcase size={22} className="text-gray-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{companyName}</p>
          <p className="text-base font-semibold text-gray-900 truncate">{jobTitle}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
            {jobCity && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {jobCity}
              </span>
            )}
            {jobType && <span>{jobType}</span>}
          </div>
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-gray-500">Trạng thái hiện tại</span>
        <ApplicationStatusBadge status={app.status} />
      </div>

      {/* Details */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
        <div className="flex items-center justify-between px-5 py-3.5 text-sm">
          <span className="text-gray-500">Ngày nộp đơn</span>
          <span className="font-medium text-gray-800">
            {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
        {app.expectedSalary && (
          <div className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-gray-500">Mức lương mong muốn</span>
            <span className="font-medium text-gray-800">
              {Number(app.expectedSalary).toLocaleString()} VND
            </span>
          </div>
        )}
        {app.job?.deadline && (
          <div className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-gray-500">Hạn nộp hồ sơ</span>
            <span className="font-medium text-gray-800">
              {new Date(app.job.deadline).toLocaleDateString("vi-VN")}
            </span>
          </div>
        )}
      </div>

      {/* Interview info */}
      {scheduledAt && (
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <Clock size={12} /> Lịch phỏng vấn
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(scheduledAt).toLocaleString("vi-VN")}
          </p>
          {app.interviewLocation && (
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <MapPin size={11} /> {app.interviewLocation}
            </p>
          )}
          {app.interviewNote && (
            <p className="text-xs text-gray-500 mt-1">{app.interviewNote}</p>
          )}
        </div>
      )}

      {/* Cover letter */}
      {app.coverLetter && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Thư xin việc
          </p>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-100
            rounded-xl p-4 whitespace-pre-line">
            {app.coverLetter}
          </p>
        </div>
      )}

      {/* CV link */}
      <a
        href={app.cvUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
          rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300
          hover:text-blue-600 transition-colors w-fit"
      >
        <FileText size={14} /> Xem CV đã nộp
      </a>

      {/* Status timeline — statusHistory đã có sẵn trong response */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Lịch sử trạng thái
        </p>
        <StatusTimeline logs={app.statusHistory ?? []} loading={false} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-6">
        <Link
          href={`/jobs/${app.job?.slug ?? app.jobPostId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
            font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Eye size={15} /> Xem tin tuyển dụng
        </Link>
        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
              font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100
              transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={15} />
            {withdrawing ? "Đang rút đơn..." : "Rút đơn"}
          </button>
        )}
      </div>
    </div>
  );
}