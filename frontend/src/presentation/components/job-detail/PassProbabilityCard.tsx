import { Target, CircleCheck, CircleX } from "lucide-react";
import type { PassProbabilityResult } from "@/domain/models/Ai";

// ── Config ────────────────────────────────────────────────────────────────────

type ProbTier = "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH";

function getProbTier(p: number): ProbTier {
  if (p < 0.3) return "VERY_LOW";
  if (p < 0.6) return "LOW";
  if (p < 0.8) return "MEDIUM";
  return "HIGH";
}

const PROB_CONFIG: Record<ProbTier, {
  text: string; bar: string; bg: string; border: string; summaryBg: string; summaryBorder: string; summaryText: string;
}> = {
  VERY_LOW: {
    text: "text-red-700",
    bar: "bg-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    summaryBg: "bg-red-50",
    summaryBorder: "border-red-200",
    summaryText: "text-red-800",
  },
  LOW: {
    text: "text-orange-700",
    bar: "bg-orange-400",
    bg: "bg-orange-50",
    border: "border-orange-200",
    summaryBg: "bg-orange-50",
    summaryBorder: "border-orange-200",
    summaryText: "text-orange-800",
  },
  MEDIUM: {
    text: "text-yellow-700",
    bar: "bg-yellow-400",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    summaryBg: "bg-yellow-50",
    summaryBorder: "border-yellow-200",
    summaryText: "text-yellow-800",
  },
  HIGH: {
    text: "text-emerald-700",
    bar: "bg-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    summaryBg: "bg-emerald-50",
    summaryBorder: "border-emerald-200",
    summaryText: "text-emerald-800",
  },
};

const CONFIDENCE_CONFIG: Record<PassProbabilityResult["confidenceLevel"], { label: string; className: string }> = {
  LOW:    { label: "Độ tin cậy thấp",   className: "bg-gray-100 text-gray-600 border-gray-200"     },
  MEDIUM: { label: "Độ tin cậy trung bình", className: "bg-amber-50 text-amber-700 border-amber-200" },
  HIGH:   { label: "Độ tin cậy cao",    className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PassProbabilityCard({ data }: { data: PassProbabilityResult }) {
  const pct  = Math.round(data.probability * 100);
  const tier = getProbTier(data.probability);
  const cfg  = PROB_CONFIG[tier];
  const conf = CONFIDENCE_CONFIG[data.confidenceLevel];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      {/* ── Header ─────────── */}
      <div className="px-4 pt-4 pb-3.5 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={14} className={cfg.text} />
            <span className="text-xs font-semibold text-gray-700">Khả năng đậu</span>
          </div>
          <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${conf.className}`}>
            {conf.label}
          </span>
        </div>

        {/* Probability number */}
        <div className="flex items-end gap-2.5 mb-2.5">
          <span className={`text-4xl font-semibold leading-none ${cfg.text}`}>
            {pct}%
          </span>
          <span className="text-[11px] text-gray-400 mb-1">
            Điểm khớp: {data.matchScore}/100
          </span>
        </div>

        {/* Bar */}
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Body ───────────── */}
      <div className="px-4 py-3.5 flex flex-col gap-3.5">

        {/* Strong / Weak points */}
        <div className="grid grid-cols-2 gap-2">
          {/* Strong */}
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mb-2">
              <CircleCheck size={12} /> Điểm mạnh
            </p>
            <ul className="flex flex-col gap-1">
              {data.strongPoints.slice(0, 3).map((pt, i) => (
                <li
                  key={i}
                  className="text-[11px] text-gray-600 leading-snug flex gap-1.5 items-start"
                >
                  <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Weak */}
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 mb-2">
              <CircleX size={12} /> Điểm yếu
            </p>
            <ul className="flex flex-col gap-1">
              {data.weakPoints.slice(0, 3).map((pt, i) => (
                <li
                  key={i}
                  className="text-[11px] text-gray-600 leading-snug flex gap-1.5 items-start"
                >
                  <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvement tips */}
        {data.improvementTips.length > 0 && (
          <div>
            <p className="text-[11px] text-gray-400 mb-2">Gợi ý cải thiện</p>
            <div className="flex flex-col divide-y divide-gray-50">
              {data.improvementTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 py-2 first:pt-0 last:pb-0">
                  <span className="shrink-0 mt-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                    {tip.area}
                  </span>
                  <span className="text-[11px] text-gray-600 leading-snug flex-1">
                    {tip.tip}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-emerald-600 mt-0.5">
                    +{tip.estimatedBoost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {data.summary && (
          <p className={`text-[11px] leading-relaxed rounded-xl px-3 py-2.5 border ${cfg.summaryBg} ${cfg.summaryBorder} ${cfg.summaryText}`}>
            {data.summary}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function PassProbabilitySkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded" />
      <div className="h-1 bg-gray-200 rounded-full" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-2 items-center">
            <div className="h-4 w-14 bg-gray-200 rounded" />
            <div className="h-3 flex-1 bg-gray-200 rounded" />
            <div className="h-3 w-6 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}