"use client";

interface CompletionStep {
  label: string;
  percent: number;
  done: boolean;
}

interface ProfileCompletionCardProps {
  percentage: number;
  steps: CompletionStep[];
}

export default function ProfileCompletionCard({ percentage, steps }: ProfileCompletionCardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[16px] font-semibold text-gray-900 mb-4">Hoàn thiện hồ sơ</h3>

      {/* Circle progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke={percentage >= 70 ? "#3b82f6" : percentage >= 40 ? "#60a5fa" : "#93c5fd"}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500 mb-4">
        Hồ sơ của bạn mới hoàn thành {percentage}%! Hãy cải thiện nhé.
      </p>

      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <div key={step.label}
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${step.done ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            <span className="font-bold shrink-0">+{step.percent}%</span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}