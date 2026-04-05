// src/presentation/components/company-profile/CompanyProfileCompletionCard.tsx
import { CheckCircle2, Circle } from "lucide-react";
import type { CompanyProfile }  from "@/domain/models/Company";

interface Step { label: string; done: boolean; percent: number; }

function calcCompletion(p: CompanyProfile): { percentage: number; steps: Step[] } {
  const checks: Step[] = [
    { label: "Tên & lĩnh vực hoạt động", done: !!(p.name && p.industry),         percent: 20 },
    { label: "Mô tả công ty",            done: !!(p.description),                percent: 20 },
    { label: "Thông tin liên hệ",        done: !!(p.email && p.phone),           percent: 15 },
    { label: "Địa chỉ & thành phố",      done: !!(p.city && p.country),          percent: 15 },
    { label: "Logo công ty",             done: !!(p.logoUrl),                    percent: 15 },
    { label: "Ảnh bìa",                  done: !!(p.coverImageUrl),              percent: 10 },
    { label: "Website & năm thành lập",  done: !!(p.website && p.foundedYear),   percent: 5  },
  ];
  const percentage = checks.reduce((s, c) => s + (c.done ? c.percent : 0), 0);
  return { percentage, steps: checks.filter(c => !c.done).slice(0, 4) };
}

export function CompanyProfileCompletionCard({ profile }: { profile: CompanyProfile }) {
  const { percentage, steps } = calcCompletion(profile);

  const color = percentage >= 80 ? "bg-green-500"
              : percentage >= 50 ? "bg-blue-500"
              : "bg-yellow-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Độ hoàn thiện hồ sơ</h3>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-right text-xs font-semibold text-gray-600 mb-4">{percentage}%</p>

      {steps.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-2.5">Cần hoàn thiện:</p>
          <div className="flex flex-col gap-2">
            {steps.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <Circle size={14} className="text-gray-300 shrink-0" />
                <span className="text-xs text-gray-600">{s.label}</span>
                <span className="ml-auto text-[10px] font-semibold text-blue-500">+{s.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {steps.length === 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-xs font-semibold">Hồ sơ đã hoàn thiện!</span>
        </div>
      )}
    </div>
  );
}