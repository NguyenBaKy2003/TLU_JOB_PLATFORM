"use client";
import { useEffect, useRef } from "react";
import type { ConversationSummary } from "@/domain/models/Message";

// ── Avatar ─
function Avatar({ name, src }: { name: string; src?: string | null }) {
  const COLORS = [
    "from-red-400 to-red-600",
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-500",
    "from-teal-400 to-teal-600",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  if (src) {
    return <img src={src} alt={name} className="w-full h-full object-cover" />;
  }

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${color}
      flex items-center justify-center text-white font-bold text-sm`}
    >
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Time format ──────────
function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ`;

  return `${Math.floor(hrs / 24)} ngày`;
}

// ── Props ─
interface Props {
  conv: ConversationSummary;
  role: "EMPLOYER" | "CANDIDATE";
  active: boolean;
  onClick: () => void;
  flash?: boolean;
}

// ── Component ────────────
export function ConversationItem({
  conv,
  role,
  active,
  onClick,
  flash,
}: Props) {
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (flash && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [flash]);

  const hasUnread = conv.unreadCount > 0;

  // ✅ Xác định người đối diện
  const other =
    role === "EMPLOYER" ? conv.candidate : conv.employer;

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all rounded-xl
        ${active ? "bg-blue-50 ring-1 ring-blue-100" : "hover:bg-gray-50"}
        ${flash ? "animate-pulse-once bg-blue-50/60" : ""}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
          <Avatar name={other.fullName} src={other.avatarUrl} />
        </div>

        {conv.online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400
            rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p
            className={`text-sm truncate ${
              active
                ? "font-semibold text-blue-600"
                : hasUnread
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-700"
            }`}
          >
            {other.fullName}
          </p>

          <span
            className={`text-[11px] shrink-0 ${
              hasUnread ? "text-blue-500 font-medium" : "text-gray-400"
            }`}
          >
            {timeAgo(conv.lastMessageAt)}
          </span>
        </div>

        {conv.jobTitle && (
          <p className="text-[11px] text-blue-500 font-medium truncate mb-0.5">
            {conv.jobTitle}
          </p>
        )}

        <p
          className={`text-xs truncate ${
            hasUnread ? "text-gray-700 font-medium" : "text-gray-400"
          }`}
        >
          {conv.lastMessagePreview ?? "Bắt đầu cuộc trò chuyện"}
        </p>
      </div>

      {/* Unread */}
      {hasUnread && (
        <span
          className="shrink-0 flex items-center justify-center min-w-[18px] h-[18px]
          px-1 text-[10px] font-bold bg-blue-500 text-white rounded-full mt-1
          animate-bounce-once"
        >
          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
        </span>
      )}
    </button>
  );
}