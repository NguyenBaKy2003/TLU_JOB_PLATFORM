import { ChatSession } from "@/domain/models/Ai";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}

export function ChatSessionList({
  sessions, activeSessionId, onSelect, onNew, onDelete
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <button
        onClick={onNew}
        className="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2.5
          bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
          rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        Cuộc trò chuyện mới
      </button>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Chưa có cuộc trò chuyện nào
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
              transition-colors text-sm
              ${activeSessionId === s.id
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-100 text-gray-700"}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
            <span className="flex-1 truncate">
              {s.title ?? "Cuộc trò chuyện mới"}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100
                hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}