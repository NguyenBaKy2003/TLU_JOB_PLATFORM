// src/presentation/components/messages/ConversationList.tsx
"use client";
import { useState }             from "react";
import { Search }               from "lucide-react";
import { ConversationItem }     from "./ConversationItem";
import type { Conversation }    from "./types";

interface Props {
  conversations:  Conversation[];
  activeId:       string | null;
  onSelect:       (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? conversations.filter(c =>
        c.company.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(query.toLowerCase())
      )
    : conversations;

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex flex-col h-full border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Tất cả tin nhắn</h3>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-full">
              {totalUnread} chưa đọc
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300
              placeholder:text-gray-300 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            Không tìm thấy kết quả
          </div>
        ) : (
          filtered.map(conv => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}