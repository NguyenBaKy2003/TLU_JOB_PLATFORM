"use client";
import { createPortal } from "react-dom";
import { useState } from "react";
import {
  MapPin, CheckCircle2, AlertCircle, Send,
  Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import { InviteCandidateModal } from "@/presentation/components/ai/InviteCandidateModal";
import type { MatchedCandidate, InviteCandidateResponse } from "@/domain/models/Ai";

// ── Score ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;

  const color =
    pct >= 80 ? { stroke: "#10b981", text: "text-emerald-600", bg: "bg-emerald-50" } :
    pct >= 50 ? { stroke: "#6366f1", text: "text-indigo-600",  bg: "bg-indigo-50"  } :
                { stroke: "#d1d5db", text: "text-gray-400",    bg: "bg-gray-50"    };

  return (
    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0 ${color.bg}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke={color.stroke} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-[11px] font-bold leading-none -mt-[30px] ${color.text}`}>{pct}</span>
    </div>
  );
}

// ── Skill chips ─────────────────────────────────────────────────────────────

function SkillChips({ matched, missing }: { matched: string[]; missing: string[] }) {
  if (!matched.length && !missing.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {matched.map(s => (
        <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
          text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={10} className="shrink-0" /> {s}
        </span>
      ))}
      {missing.map(s => (
        <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
          text-[11px] font-medium bg-red-50 text-red-500 border border-red-100">
          <AlertCircle size={10} className="shrink-0" /> {s}
        </span>
      ))}
    </div>
  );
}

// ── Availability badge ───────────────────────────────────────────────────────

function AvailabilityBadge({ status }: { status: string }) {
  const active = status === "ACTIVELY_LOOKING";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
      text-[11px] font-medium shrink-0
      ${active ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0
        ${active ? "bg-emerald-500" : "bg-blue-500"}`} />
      {active ? "Đang tìm việc" : "Sẵn sàng nhận offer"}
    </span>
  );
}

// ── Avatar initials ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0].toUpperCase())
    .join("");

  const colors = [
    "bg-violet-100 text-violet-600",
    "bg-indigo-100 text-indigo-600",
    "bg-sky-100 text-sky-600",
    "bg-teal-100 text-teal-600",
    "bg-emerald-100 text-emerald-600",
  ];
  const idx = name.charCodeAt(0) % colors.length;

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center
      text-sm font-bold shrink-0 ${colors[idx]}`}>
      {initials || "?"}
    </div>
  );
}

// ── Main card ────────────────────────────────────────────────────────────────

interface Props {
  c:         MatchedCandidate;
  jobPostId: string;
  jobTitle:  string;
}

export function MatchedCandidateCard({ c, jobPostId, jobTitle }: Props) {
  const [showInvite, setShowInvite] = useState(false);
  const [invited,    setInvited]    = useState(false);
  const [expOpen,    setExpOpen]    = useState(false);

  const hasExperience = !!c.experienceSummary && c.experienceSummary !== "0 năm kinh nghiệm làm việc";
  const hasSkills = (c.matchedSkills?.length ?? 0) + (c.missingSkills?.length ?? 0) > 0;

  const handleInviteSuccess = (_res: InviteCandidateResponse) => {
    setInvited(true);
    setShowInvite(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden
        transition-shadow hover:shadow-md">

        {/* ── Top row: avatar · name · score ── */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <Avatar name={c.candidateName ?? ""} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug break-words">
              {c.candidateName}
            </p>

            {/* Location */}
            {c.location && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{c.location}</span>
              </p>
            )}

            {/* Availability */}
            <div className="mt-1.5">
              <AvailabilityBadge status={c.availabilityStatus} />
            </div>
          </div>

          {/* Score */}
          <ScoreRing score={c.matchScore} />
        </div>

        {/* ── Match reason ── */}
        {c.matchReason && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50
              rounded-xl px-3 py-2.5 border border-gray-100">
              {c.matchReason}
            </p>
          </div>
        )}

        {/* ── Skills ── */}
        {hasSkills && (
          <div className="px-4 pb-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Kỹ năng
            </p>
            <SkillChips
              matched={c.matchedSkills ?? []}
              missing={c.missingSkills ?? []}
            />
          </div>
        )}

        {/* ── Experience (collapsible) ── */}
        {c.experienceSummary && (
          <div className="border-t border-gray-50">
            <button
              onClick={() => setExpOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5
                text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase size={12} className="shrink-0 text-gray-400" />
                Kinh nghiệm
              </span>
              {expOpen
                ? <ChevronUp size={13} className="text-gray-300" />
                : <ChevronDown size={13} className="text-gray-300" />}
            </button>

            {expOpen && (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  {c.experienceSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Footer: invite button ── */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-50 bg-gray-50/50">
          <button
            onClick={() => setShowInvite(true)}
            disabled={invited}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold
              transition-all border
              ${invited
                ? "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-violet-700 border-violet-200 hover:bg-violet-50 active:scale-95 shadow-sm"
              }`}
          >
            <Send size={11} className="shrink-0" />
            {invited ? "Đã gửi lời mời" : "Mời ứng tuyển"}
          </button>
        </div>
      </div>

      {showInvite && createPortal(
        <InviteCandidateModal
          jobPostId={jobPostId}
          jobTitle={jobTitle}
          candidateProfileId={c.candidateProfileId}
          candidateName={c.candidateName}
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />,
        document.body,
      )}
    </>
  );
}