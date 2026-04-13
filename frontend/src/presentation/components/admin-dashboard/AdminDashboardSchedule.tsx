import { Activity } from "lucide-react";

const RECENT_ACTIONS = [
  { user: "Nguyễn Văn A", action: "Đăng ký tài khoản",   time: "2 phút trước",  color: "bg-green-500"  },
  { user: "TechCorp VN",  action: "Đăng tin tuyển dụng", time: "15 phút trước", color: "bg-blue-500"   },
  { user: "Trần Thị B",   action: "Nộp đơn ứng tuyển",   time: "32 phút trước", color: "bg-purple-500" },
  { user: "StartupHub",   action: "Nâng cấp gói Pro",     time: "1 giờ trước",   color: "bg-amber-500"  },
  { user: "Lê Văn C",     action: "Cập nhật hồ sơ",       time: "2 giờ trước",   color: "bg-teal-500"   },
];

export function AdminDashboardSchedule() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Hoạt động gần đây</h3>
        <div className="w-7 h-7 flex items-center justify-center rounded-lg
          bg-red-50 text-red-500">
          <Activity size={14} />
        </div>
      </div>

      <div className="space-y-2">
        {RECENT_ACTIONS.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl
            hover:bg-gray-50 transition-colors cursor-pointer">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{a.user}</p>
              <p className="text-[11px] text-gray-500">{a.action}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}