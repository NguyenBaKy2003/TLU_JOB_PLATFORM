// src/presentation/components/company-profile/VerificationStatusCard.tsx
import { CheckCircle2, Clock, XCircle, ShieldAlert, Send } from "lucide-react";
import type { VerificationStatus } from "@/domain/models/Company";

const CONFIG: Record<VerificationStatus, {
  icon:  React.ReactNode; title: string; desc: string;
  cls:   string; bg: string;
}> = {
  VERIFIED: {
    icon:  <CheckCircle2 size={20} className="text-green-600" />,
    title: "Đã xác thực",
    desc:  "Công ty của bạn đã được xác thực. Bạn có thể đăng tin tuyển dụng.",
    cls:   "border-green-200", bg: "bg-green-50",
  },
  UNVERIFIED: {
    icon:  <Clock size={20} className="text-yellow-600" />,
    title: "Chờ xác thực",
    desc:  "Hồ sơ đang được admin xem xét. Quá trình thường mất 1-2 ngày làm việc.",
    cls:   "border-yellow-200", bg: "bg-yellow-50",
  },
  REJECTED: {
    icon:  <XCircle size={20} className="text-red-500" />,
    title: "Bị từ chối",
    desc:  "Hồ sơ chưa đáp ứng yêu cầu. Vui lòng chỉnh sửa và gửi lại.",
    cls:   "border-red-200", bg: "bg-red-50",
  },
  SUSPENDED: {
    icon:  <ShieldAlert size={20} className="text-gray-500" />,
    title: "Đã bị khoá",
    desc:  "Tài khoản công ty tạm thời bị khoá. Liên hệ hỗ trợ để biết thêm.",
    cls:   "border-gray-200", bg: "bg-gray-50",
  },
};

interface Props {
  status:          VerificationStatus;
  rejectionReason?: string | null;
  onResubmit?:    () => void;
}

export function VerificationStatusCard({ status, rejectionReason, onResubmit }: Props) {
  const cfg = CONFIG[status];
  return (
    <div className={`rounded-2xl border p-5 ${cfg.cls} ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 mb-0.5">{cfg.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{cfg.desc}</p>
          {status === "REJECTED" && rejectionReason && (
            <p className="text-xs text-red-600 mt-2 bg-white/60 px-2 py-1.5 rounded-lg">
              <strong>Lý do:</strong> {rejectionReason}
            </p>
          )}
          {status === "REJECTED" && onResubmit && (
            <button onClick={onResubmit}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white
                text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors">
              <Send size={12} /> Gửi lại để xét duyệt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}