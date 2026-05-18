// src/presentation/components/applications/CandidateRow.tsx
import { Clock, Zap } from "lucide-react";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import type { ApplicationWithCandidate } from "@/domain/models/Application";
import { CandidateAvatar } from "./CandidateAvatar";

export function CandidateRow({
  app,
  active,
  onClick,
}: {
  app:     ApplicationWithCandidate;
  active:  boolean;
  onClick: () => void;
}) {
  // Ưu tiên nested candidate (nếu backend populate), fallback flat fields
  const name   = app.candidate?.fullName  ?? app.candidateName;
  const avatar = app.candidate?.avatarUrl ?? app.candidateAvatar;
  const email  = app.candidate?.email     ?? app.candidateEmail;
  const score  = app.aiScore?.score;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 text-left transition-all rounded-xl ${
        active
          ? "bg-blue-50 border border-blue-200"
          : "border border-transparent hover:bg-gray-50"
      }`}
    >
      <CandidateAvatar name={name} src={avatar} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[16px] font-semibold text-gray-900 truncate">{name}</p>
          <ApplicationStatusBadge status={app.status} />
        </div>

        <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>

        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
          <Clock size={10} />
          {new Date(app.appliedAt).toLocaleDateString("vi-VN")}

          {score != null && (
            <span className={`flex items-center gap-0.5 font-semibold ml-auto ${
              score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-400"
            }`}>
              <Zap size={10} /> {score}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}