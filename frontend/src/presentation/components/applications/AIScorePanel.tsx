import type { AIScore } from "@/domain/models/Application";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  score:    AIScore;
  compact?: boolean;
}

function ScoreRing({ value }: { value: number }) {
  const color =
    value >= 80 ? "text-emerald-500" :
    value >= 60 ? "text-blue-500"    :
    value >= 40 ? "text-amber-500"   : "text-red-400";
  return (
    <div className={`text-2xl font-bold tabular-nums ${color}`}>
      {value}
      <span className="text-[16px] font-medium text-gray-400">/100</span>
    </div>
  );
}

function SubBar({ label, value }: { label: string; value: number }) {
  const bg =
    value >= 80 ? "bg-emerald-400" :
    value >= 60 ? "bg-blue-400"    :
    value >= 40 ? "bg-amber-400"   : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bg}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-medium text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

export function AIScorePanel({ score, compact }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
        <Zap size={12} className="text-blue-500 shrink-0" />
        <span className="text-xs text-blue-700 font-medium">AI Score:</span>
        <span className="text-xs font-bold text-blue-700">{score.score}/100</span>
        <span className="text-[11px] text-blue-500">· {score.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100
      rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-blue-500" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Score</span>
      </div>

      {/* Score + label */}
      <div className="flex items-end gap-3">
        <ScoreRing value={score.score} />
        <span className="text-[16px] text-gray-600 mb-0.5">{score.label}</span>
      </div>

      {/* Sub scores */}
      <div className="flex flex-col gap-2">
        <SubBar label="Kỹ năng"    value={score.skillMatchScore}  />
        <SubBar label="Kinh nghiệm" value={score.experienceScore} />
        <SubBar label="Học vấn"    value={score.educationScore}   />
      </div>

      {/* Summary */}
      {score.summary && (
        <p className="text-xs text-gray-600 italic leading-relaxed border-t border-blue-100 pt-3">
          {score.summary}
        </p>
      )}

      {/* Strengths / Gaps */}
      {(score.strengths?.length || score.gaps?.length) ? (
        <div className="grid grid-cols-2 gap-3">
          {score.strengths?.length ? (
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                <CheckCircle size={10} /> Điểm mạnh
              </p>
              <ul className="flex flex-col gap-0.5">
                {score.strengths.map((s, i) => (
                  <li key={i} className="text-[11px] text-gray-600">• {s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {score.gaps?.length ? (
            <div>
              <p className="text-[11px] font-semibold text-amber-600 mb-1 flex items-center gap-1">
                <AlertCircle size={10} /> Cần cải thiện
              </p>
              <ul className="flex flex-col gap-0.5">
                {score.gaps.map((g, i) => (
                  <li key={i} className="text-[11px] text-gray-600">• {g}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}