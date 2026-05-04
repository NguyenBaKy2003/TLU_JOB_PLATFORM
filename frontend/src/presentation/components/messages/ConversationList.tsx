"use client";
import { useState, useEffect, useRef } from "react";
import { Search, RefreshCw } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import type { ConversationSummary } from "@/domain/models/Message";

// ── Skeleton ─────────────
function ConvSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-3.5 bg-gray-100 rounded w-28" />
          <div className="h-3 bg-gray-100 rounded w-14" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-40" />
      </div>
    </div>
  );
}

// ── Props ─
interface Props {
  conversations: ConversationSummary[];
  loading: boolean;
  error?: string | null;
  activeId: string | null;
  onSelect: (id: string) => void;
  onRetry?: () => void;
  flashId?: string | null;

  role: "EMPLOYER" | "CANDIDATE"; // ✅ NEW
}

// ── Component ────────────
export function ConversationList({
  conversations,
  loading,
  error,
  activeId,
  onSelect,
  onRetry,
  flashId,
  role,
}: Props) {
  const [query, setQuery] = useState("");

  const [localFlashId, setLocalFlashId] = useState<string | null>(null);
  const flashTimer = useRef<NodeJS.Timeout | null>(null);

  // Flash effect
  useEffect(() => {
    if (!flashId) return;

    setLocalFlashId(flashId);

    if (flashTimer.current) clearTimeout(flashTimer.current);

    flashTimer.current = setTimeout(() => {
      setLocalFlashId(null);
    }, 1500);

    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [flashId]);

  // Filter
  const filtered = query.trim()
    ? conversations.filter((c) => {
        const other =
          role === "EMPLOYER" ? c.candidate : c.employer;

        return (
          other.fullName.toLowerCase().includes(query.toLowerCase()) ||
          (c.lastMessagePreview ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (c.jobTitle ?? "").toLowerCase().includes(query.toLowerCase())
        );
      })
    : conversations;

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );

  return (
    <div className="flex flex-col h-full border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Tất cả tin nhắn
          </h3>

          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <span
                className="px-2 py-0.5 text-[11px] font-bold text-blue-600
                bg-blue-50 rounded-full border border-blue-100"
              >
                {totalUnread} chưa đọc
              </span>
            )}

            {onRetry && (
              <button
                onClick={onRetry}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  rounded-lg transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-300 placeholder:text-gray-300 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ConvSkeleton key={i} />
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-xs text-red-500 text-center px-4">
              {error}
            </p>

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200
                  rounded-xl hover:bg-blue-50 transition-colors"
              >
                Thử lại
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            {query ? "Không tìm thấy kết quả" : "Chưa có tin nhắn nào"}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              role={role}
              active={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
              flash={conv.id === localFlashId}
            />
          ))
        )}
      </div>
    </div>
  );
}