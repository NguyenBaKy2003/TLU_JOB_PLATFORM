// src/presentation/components/employer-dashboard/DashboardRecentJobs.tsx
import Link               from "next/link";
import { ChevronRight, Users, DollarSign } from "lucide-react";
import { MOCK_JOBS }      from "./types";

export function DashboardRecentJobs() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Công việc đã đăng gần đây</h2>
        <Link href="/employer/jobs"
          className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
          Xem tất cả <ChevronRight size={13} />
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 font-medium border-b border-gray-100">
            {["Công việc","Trạng thái","Đơn ứng tuyển","Mức lương","Thao tác"].map(h => (
              <th key={h} className="text-left pb-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_JOBS.map(job => (
            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3.5 pr-4">
                <p className="font-semibold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400">{job.type} • Còn lại {job.daysLeft} ngày</p>
              </td>
              <td className="py-3.5 pr-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Đang hoạt động
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Users size={13} className="text-gray-400" />
                  <span className="font-medium">{job.applications.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs">lượt</span>
                </div>
              </td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-1 text-gray-700">
                  <DollarSign size={13} className="text-gray-400" />
                  <span className="font-medium">{job.salary}</span>
                </div>
              </td>
              <td className="py-3.5">
                <Link href={`/employer/jobs/${job.id}/applications`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border
                    border-gray-200 text-xs font-semibold text-gray-700
                    hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  Xem đơn ứng tuyển <ChevronRight size={12} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}