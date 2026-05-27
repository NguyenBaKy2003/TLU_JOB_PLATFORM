// src/presentation/components/employer/jobs/JobStatsRow.tsx
import { FileText, CheckCircle2, Archive, Clock, XCircle } from "lucide-react";
import type { JobStatusCounts } from "@/domain/repositories/IJobRepository";

interface Props { counts: JobStatusCounts }

export function JobStatsRow({ counts }: Props) {
  const stats = [
    {
      icon:  <FileText size={16} />,
      label: "Tổng tin đăng",
      value: counts.total,
      color: "text-gray-700",
    },
    {
      icon:  <CheckCircle2 size={16} />,
      label: "Đang tuyển",
      value: counts.PUBLISHED ?? 0,
      color: "text-green-600",
    },
    {
      icon:  <Clock size={16} />,
      label: "Nháp / Chờ duyệt",
      value: (counts.DRAFT ?? 0) + (counts.PENDING_REVIEW ?? 0),
      color: "text-yellow-600",
    },
    {
      icon:  <XCircle size={16} />,
      label: "Từ chối",
      value: counts.REJECTED ?? 0,
      color: "text-red-500",
    },
    {
      icon:  <Archive size={16} />,
      label: "Đã đóng / Hết hạn",
      value: (counts.CLOSED ?? 0) + (counts.EXPIRED ?? 0),
      color: "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
          <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
            {s.icon}
            <span className="text-xs font-medium">{s.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
        </div>
      ))}
    </div>
  );
}