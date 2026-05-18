// src/presentation/components/company-profile/CompanyProfileCompletionCard.tsx
import { CheckCircle2, Circle } from "lucide-react";
import type { CompanyProfile }  from "@/domain/models/Company";

interface Step { 
  label: string; 
  done: boolean; 
  percent: number;
  description?: string;
}

function calcCompletion(p: CompanyProfile): { percentage: number; steps: Step[]; completedSteps: Step[] } {
  const checks: Step[] = [
    // ── Thông tin cơ bản (40%) ─
    { label: "Tên công ty",           done: !!(p.name),                          percent: 10 },
    { label: "Lĩnh vực hoạt động",    done: !!(p.industry),                     percent: 5 },
    { label: "Mô tả công ty",         done: !!(p.description && p.description.length > 50), percent: 15 },
    { label: "Quy mô công ty",        done: !!(p.size && p.size !== "UNKNOWN"), percent: 5 },
    { label: "Năm thành lập",         done: !!(p.foundedYear),                  percent: 5 },
    
    // ── Thông tin liên hệ (20%) 
    { label: "Email liên hệ",         done: !!(p.email),                        percent: 5 },
    { label: "Số điện thoại",         done: !!(p.phone),                        percent: 5 },
    { label: "Địa chỉ",               done: !!(p.address),                      percent: 5 },
    { label: "Thành phố & Quốc gia",  done: !!(p.city && p.country),            percent: 5 },
    
    // ── Hình ảnh & Website (20%) ──────────────
    { label: "Website công ty",       done: !!(p.website),                      percent: 5 },
    { label: "Logo công ty",          done: !!(p.logoUrl),                      percent: 10 },
    { label: "Ảnh bìa",               done: !!(p.coverImageUrl),                percent: 5 },
    
    // ── Nội dung mở rộng (20%) ─
    { label: "Đội ngũ lãnh đạo",      done: !!(p.teamMembers && p.teamMembers.length > 0), percent: 10,
      description: "Thêm ít nhất 1 thành viên" },
    { label: "Thư viện ảnh",          done: !!(p.gallery && p.gallery.length >= 3), percent: 10,
      description: "Thêm ít nhất 3 ảnh" },
  ];

  // Tính tổng phần trăm
  let percentage = 0;
  const completedSteps: Step[] = [];
  const incompleteSteps: Step[] = [];

  for (const step of checks) {
    if (step.done) {
      percentage += step.percent;
      completedSteps.push(step);
    } else {
      incompleteSteps.push(step);
    }
  }

  // Bonus points cho các hoàn thiện thêm
  if (p.description && p.description.length > 200) percentage = Math.min(100, percentage + 3);
  if (p.teamMembers && p.teamMembers.length >= 3) percentage = Math.min(100, percentage + 2);
  if (p.gallery && p.gallery.length >= 5) percentage = Math.min(100, percentage + 3);
  if (p.website && p.logoUrl && p.coverImageUrl) percentage = Math.min(100, percentage + 2);
  
  // Điều chỉnh làm tròn
  percentage = Math.min(100, Math.max(0, percentage));

  return { 
    percentage, 
    steps: incompleteSteps.slice(0, 5), // Chỉ hiển thị tối đa 5 bước cần làm
    completedSteps 
  };
}

// Helper để lấy message dựa trên percentage
function getMotivationMessage(percentage: number, isVerified: boolean): { message: string; emoji: string } {
  if (isVerified && percentage >= 90) {
    return { message: "Hồ sơ xuất sắc! Bạn đã sẵn sàng thu hút ứng viên", emoji: "🏆" };
  }
  if (percentage >= 80) {
    return { message: "Tuyệt vời! Chỉ còn vài bước nhỏ nữa thôi", emoji: "🚀" };
  }
  if (percentage >= 60) {
    return { message: "Đang đi đúng hướng, hãy tiếp tục hoàn thiện", emoji: "📈" };
  }
  if (percentage >= 40) {
    return { message: "Hồ sơ còn nhiều thiếu sót, hãy cập nhật thêm", emoji: "⚠️" };
  }
  return { message: "Hãy bắt đầu xây dựng hồ sơ công ty chuyên nghiệp", emoji: "✨" };
}

export function CompanyProfileCompletionCard({ profile }: { profile: CompanyProfile }) {
  const { percentage, steps, completedSteps } = calcCompletion(profile);
  const isVerified = profile.verificationStatus === "VERIFIED";
  const motivation = getMotivationMessage(percentage, isVerified);

  const color = percentage >= 80 ? "bg-green-500"
              : percentage >= 60 ? "bg-blue-500"
              : percentage >= 40 ? "bg-yellow-500"
              : "bg-gray-400";

  const statusColor = percentage >= 80 ? "text-green-600"
                    : percentage >= 60 ? "text-blue-600"
                    : percentage >= 40 ? "text-yellow-600"
                    : "text-gray-500";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-semibold text-gray-800">Độ hoàn thiện hồ sơ</h3>
        <span className={`text-xs font-bold ${statusColor}`}>{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }} 
        />
      </div>

      {/* Motivation message */}
      <div className="flex items-center gap-1.5 mt-2 mb-4">
        <span className="text-[16px]">{motivation.emoji}</span>
        <p className="text-xs text-gray-500">{motivation.message}</p>
      </div>

      {/* Verification status impact */}
      {!isVerified && (
        <div className="mb-4 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs text-orange-700">
            <span className="font-semibold">🔒 Cần xác thực</span>
            <br />
            Hồ sơ cần được xác thực trước khi đăng tin tuyển dụng
          </p>
        </div>
      )}

      {/* Steps to complete */}
      {steps.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-gray-700">Cần hoàn thiện:</p>
            <p className="text-[10px] text-gray-400">{steps.length} bước</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {steps.map((step) => (
              <div key={step.label} className="group">
                <div className="flex items-center gap-2">
                  <Circle size={14} className="text-gray-300 shrink-0 group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs text-gray-600 flex-1">{step.label}</span>
                  <span className="text-[10px] font-semibold text-blue-500">+{step.percent}%</span>
                </div>
                {step.description && (
                  <p className="text-[10px] text-gray-400 ml-6 mt-0.5">{step.description}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Completed state */}
      {steps.length === 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <span className="text-[16px] font-semibold">Hồ sơ hoàn hảo!</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {isVerified 
              ? "Hồ sơ của bạn đã sẵn sàng để thu hút ứng viên" 
              : "Chờ xác thực để bắt đầu đăng tin tuyển dụng"}
          </p>
        </div>
      )}

      {/* Quick stats */}
      {completedSteps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Đã hoàn thành: {completedSteps.length}/{completedSteps.length + steps.length}</span>
            {profile.canPostJobs !== undefined && (
              <span className={profile.canPostJobs ? "text-green-600" : "text-gray-400"}>
                {profile.canPostJobs ? "✓ Có thể đăng tin" : "✗ Chưa thể đăng tin"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}