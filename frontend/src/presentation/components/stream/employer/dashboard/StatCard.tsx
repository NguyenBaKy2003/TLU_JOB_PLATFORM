// components/stream/employer/dashboard/StatCard.tsx
import React from "react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: "red" | "amber" | "emerald" | "blue";
  pulse?: boolean;
}

const colorMap = {
  red: { gradient: "from-red-500 to-rose-600", bg: "bg-red-50" },
  amber: { gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
  emerald: { gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
  blue: { gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
};

export function StatCard({ icon: Icon, label, value, sub, color = "blue", pulse }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br ${colors.gradient} opacity-[0.03]`} />

      <div className="relative">
        {/* Icon & Pulse */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </p>

        {/* Value */}
        <p className="text-3xl font-bold text-slate-800 mb-1">
          {value}
        </p>

        {/* Sub */}
        {sub && (
          <p className="text-xs text-slate-400">{sub}</p>
        )}
      </div>
    </div>
  );
}