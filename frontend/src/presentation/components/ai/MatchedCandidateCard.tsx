"use client";
import { useState } from "react";
import { MapPin, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { InviteCandidateModal } from "@/presentation/components/ai/InviteCandidateModal";
import type { MatchedCandidate, InviteCandidateResponse } from "@/domain/models/Ai";

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-500" :
    score >= 60 ? "text-blue-500"    :
                  "text-gray-400";
  return (
    <div className={`text-center shrink-0 ${color}`}>
      <p className="text-xl font-bold leading-none">{score}</p>
      <p className="text-sm text-gray-400 mt-0.5">/ 100</p>
    </div>
  );
}

// ── Skill chips ───────────────────────────────────────────────────────────────

function SkillChips({ matched, missing }: { matched: string[]; missing: string[] }) {
  if (!matched.length && !missing.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {matched.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
            font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={12} /> {s}
        </span>
      ))}
      {missing.map(s => (
        <span key={s}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
            font-medium bg-red-50 text-red-500 border border-red-100">
          <AlertCircle size={12} /> {s}
        </span>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  c:         MatchedCandidate;
  jobPostId: string;
  jobTitle:  string;
}

export function MatchedCandidateCard({ c, jobPostId, jobTitle }: Props) {
  const [open,       setOpen]       = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [invited,    setInvited]    = useState(false);

  const handleInviteSuccess = (_result: InviteCandidateResponse) => {
    setInvited(true);
    setShowInvite(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        {/* ── Top row — always visible ── */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center
            text-base font-bold text-violet-600 shrink-0">
            {c.candidateName?.[0]?.toUpperCase() ?? "?"}
          </div>

          {/* Name / headline / location — click to expand */}
          <button
            onClick={() => setOpen(v => !v)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-base font-semibold text-gray-900 truncate">{c.candidateName}</p>
            {c.headline && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{c.headline}</p>
            )}
            {c.location && (
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                <MapPin size={12} className="shrink-0" /> {c.location}
              </p>
            )}
          </button>

          {/* Score + chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <ScoreRing score={c.matchScore} />
            <button
              onClick={() => setOpen(v => !v)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              aria-label={open ? "Thu gọn" : "Xem chi tiết"}
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* ── Match reason — always visible (nổi bật nhất) ── */}
        {c.matchReason && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50
              rounded-xl px-3 py-2.5">{c.matchReason}</p>
          </div>
        )}

        {/* ── Skills — always visible ── */}
        {(c.matchedSkills?.length || c.missingSkills?.length) ? (
          <div className="px-4 pb-3">
            <SkillChips
              matched={c.matchedSkills ?? []}
              missing={c.missingSkills ?? []}
            />
          </div>
        ) : null}

        {/* ── Footer row — availability + invite ── */}
        <div className="flex items-center justify-between gap-3 px-4 pb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            text-sm font-medium ${
            c.availabilityStatus === "ACTIVELY_LOOKING"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-blue-50 text-blue-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              c.availabilityStatus === "ACTIVELY_LOOKING" ? "bg-emerald-500" : "bg-blue-500"
            }`} />
            {c.availabilityStatus === "ACTIVELY_LOOKING"
              ? "Đang tìm việc"
              : "Sẵn sàng nhận offer"}
          </span>

          <button
            onClick={() => setShowInvite(true)}
            disabled={invited}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
              transition-all border ${
              invited
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 active:scale-95"
            }`}
          >
            <Send size={13} className="shrink-0" />
            {invited ? "Đã mời" : "Mời ứng tuyển"}
          </button>
        </div>

        {/* ── Expandable: experience detail ── */}
        {open && c.experienceSummary && (
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500 leading-relaxed italic">
              {c.experienceSummary}
            </p>
          </div>
        )}
      </div>

      {/* Invite modal — z-[60] để nổi lên trên panel/drawer (z-50) */}
      {showInvite && (
        <InviteCandidateModal
          jobPostId={jobPostId}
          jobTitle={jobTitle}
          candidateProfileId={c.candidateProfileId}
          candidateName={c.candidateName}
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </>
  );
}