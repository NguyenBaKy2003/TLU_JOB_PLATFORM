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
  const name    = app.candidate?.fullName  ?? app.candidateName;
  const avatar  = app.candidate?.avatarUrl ?? app.candidateAvatar;
  const email   = app.candidate?.email     ?? app.candidateEmail;
  const score   = app.aiScore?.score       ?? app.aiScore;
  const boosted = app.candidate?.boosted;

  return (
    <button
      onClick={onClick}
      className={`
        group w-full flex items-center gap-3 px-3 py-2.5 text-left
        rounded-xl transition-all duration-150 relative overflow-hidden
        ${active
          ? boosted
            ? "bg-amber-50 shadow-[inset_0_0_0_1.5px_#f59e0b]"
            : "bg-blue-50  shadow-[inset_0_0_0_1.5px_#93c5fd]"
          : boosted
            ? "hover:bg-amber-50/60 shadow-[inset_0_0_0_1px_#fde68a] hover:shadow-[inset_0_0_0_1.5px_#f59e0b]"
            : "hover:bg-gray-50 shadow-[inset_0_0_0_1px_transparent] hover:shadow-[inset_0_0_0_1px_#e5e7eb]"
        }
      `}
    >
      {/* Left accent strip for boosted */}
      {boosted && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-amber-400" />
      )}

      {/* Avatar */}
      <div className="relative shrink-0 pl-1">
        <CandidateAvatar name={name} src={avatar} size="sm" />
        {boosted && (
          <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center
            w-[14px] h-[14px] rounded-full bg-amber-400 border-[1.5px] border-white">
            <Zap size={7} strokeWidth={2.5} className="text-white" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + status badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[13px] font-semibold truncate leading-tight
            ${active ? "text-gray-900" : "text-gray-800 group-hover:text-gray-900"}`}>
            {name}
          </span>
          <ApplicationStatusBadge status={app.status} />
        </div>

        {/* Row 2: email */}
        <p className="text-[11px] text-gray-400 truncate mt-0.5 leading-none">{email}</p>

        {/* Row 3: date + boosted tag + score */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock size={9} className="text-gray-300 shrink-0" />
          <span className="text-[10px] text-gray-400">
            {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
          </span>

          {boosted && (
            <span className="ml-auto flex items-center gap-0.5 px-1.5 py-px
              rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold border border-amber-200">
              <Zap size={8} strokeWidth={2.5} className="text-amber-500" />
              Nổi bật
            </span>
          )}

          {score != null && (
            <span className={`flex items-center gap-0.5 text-[11px] font-bold
              ${boosted ? "ml-1" : "ml-auto"}
              ${score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-400"}`}>
              {score}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}