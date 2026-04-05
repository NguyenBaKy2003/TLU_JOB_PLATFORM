// src/presentation/components/employer/jobs/JobStatsRow.tsx
// Summary stats bar phía trên bảng
import { FileText, CheckCircle2, Archive, Clock } from "lucide-react";
import type { JobPost, JobStatus } from "@/domain/models/Job";

interface Props { jobs: JobPost[] }

export function JobStatsRow({ jobs }: Props) {
  const count = (s: JobStatus) => jobs.filter(j => j.status === s).length;

  const stats = [
    { icon: <FileText size={16} />,     label: "Tổng tin đăng",    value: jobs.length,           color: "text-gray-700"  },
    { icon: <CheckCircle2 size={16} />, label: "Đang tuyển",       value: count("PUBLISHED"),    color: "text-green-600" },
    { icon: <Clock size={16} />,        label: "Nháp",             value: count("DRAFT"),        color: "text-yellow-600"},
    { icon: <Archive size={16} />,      label: "Đã đóng / Hết hạn",value: count("CLOSED") + count("EXPIRED"), color: "text-gray-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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