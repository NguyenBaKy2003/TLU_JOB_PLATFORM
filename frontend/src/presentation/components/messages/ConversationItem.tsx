// src/presentation/components/messages/ConversationItem.tsx
import type { Conversation } from "./types";

interface Props {
  conv:     Conversation;
  active:   boolean;
  onClick:  () => void;
}

function CompanyAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors   = [
    "from-red-400 to-red-600",   "from-blue-400 to-blue-600",
    "from-green-400 to-green-600","from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600","from-teal-400 to-teal-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0 text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export function ConversationItem({ conv, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors rounded-xl
        ${active ? "bg-blue-50" : "hover:bg-gray-50"}`}
    >
      {/* Avatar + online dot */}
      <div className="relative shrink-0 mt-0.5">
        <CompanyAvatar name={conv.company} size={40} />
        {conv.online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full
            border-2 border-white" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p className={`text-sm truncate ${active ? "font-semibold text-blue-600" : "font-medium text-gray-800"}`}>
            {conv.company}
          </p>
          <span className="text-[11px] text-gray-400 shrink-0">{conv.time}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
      </div>

      {/* Unread badge */}
      {conv.unread > 0 && (
        <span className="shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1
          text-[10px] font-bold bg-red-500 text-white rounded-full mt-1">
          {conv.unread}
        </span>
      )}
    </button>
  );
}