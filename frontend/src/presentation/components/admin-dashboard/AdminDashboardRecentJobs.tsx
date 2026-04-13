import Link from "next/link";
import { ChevronRight, Users, Building2 } from "lucide-react";

const MOCK_POSTS = [
  { id: "1", title: "Senior React Developer", company: "TechCorp VN",    applications: 48,  status: "ACTIVE",  postedAt: "2 giờ trước"  },
  { id: "2", title: "Product Manager",         company: "StartupHub",     applications: 123, status: "ACTIVE",  postedAt: "5 giờ trước"  },
  { id: "3", title: "Data Scientist",           company: "FinTech JSC",    applications: 31,  status: "PENDING", postedAt: "1 ngày trước" },
  { id: "4", title: "UX/UI Designer",           company: "Creative Studio", applications: 87,  status: "ACTIVE",  postedAt: "1 ngày trước" },
];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:  "bg-green-50 text-green-600 border-green-100",
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CLOSED:  "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang hoạt động", PENDING: "Chờ duyệt", CLOSED: "Đã đóng",
};

export function AdminDashboardRecentJobs() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Tin đăng gần đây</h2>
        <Link href="/admin/jobs"
          className="flex items-center gap-1 text-xs text-red-600 font-medium hover:underline">
          Xem tất cả <ChevronRight size={13} />
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 font-medium border-b border-gray-100">
            {["Vị trí", "Công ty", "Trạng thái", "Ứng tuyển", "Thao tác"].map(h => (
              <th key={h} className="text-left pb-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_POSTS.map(job => (
            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3.5 pr-4">
                <p className="font-semibold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400">{job.postedAt}</p>
              </td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Building2 size={13} className="text-gray-400" />
                  <span className="text-xs">{job.company}</span>
                </div>
              </td>
              <td className="py-3.5 pr-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-semibold border ${STATUS_STYLE[job.status]}`}>
                  {job.status === "ACTIVE" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                  {STATUS_LABEL[job.status]}
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Users size={13} className="text-gray-400" />
                  <span className="font-medium">{job.applications.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs">lượt</span>
                </div>
              </td>
              <td className="py-3.5">
                <Link href={`/admin/jobs/${job.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border
                    border-gray-200 text-xs font-semibold text-gray-700
                    hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
                  Chi tiết <ChevronRight size={12} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}