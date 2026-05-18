import { MessageRole } from "@/domain/models/Ai";
import { Bot, User } from "lucide-react";

interface Props {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export function ChatMessageItem({ role, content, createdAt }: Props) {
  const isUser = role === "USER";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
        ${isUser ? "bg-blue-600" : "bg-emerald-600"}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot  className="w-4 h-4 text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-[16px] leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"}`}>
          {content}
        </div>
        <span className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit", minute: "2-digit"
          })}
        </span>
      </div>
    </div>
  );
}