// src/presentation/components/messages/EmptyChat.tsx
import { MessageSquare } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50/50">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <MessageSquare size={28} className="text-gray-300" />
      </div>
      <p className="text-[16px] text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</p>
    </div>
  );
}