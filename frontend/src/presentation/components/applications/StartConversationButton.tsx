"use client";
import { useState }            from "react";
import { useRouter }           from "next/navigation";
import { MessageCircle }       from "lucide-react";
import { MessageService }      from "@/application/services/MessageService";
import { MessageRepository }   from "@/infrastructure/repositories/MessageRepository";
import { useToast }            from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const messageService = new MessageService(new MessageRepository());

interface Props {
  candidateId: string;
  jobPostId?:  string;
  /** Label hiện trên button — default: "Nhắn tin ứng viên" */
  label?:      string;
  variant?:    "primary" | "ghost";
  size?:       "sm" | "md";
}

/**
 * Dùng trong context employer / admin nhấn từ chi tiết đơn ứng tuyển.
 * Tự động tạo conversation nếu chưa có, rồi redirect sang /employer/messages/{id}.
 */
export function StartConversationButton({
  candidateId, jobPostId, label = "Nhắn tin ứng viên", variant = "primary", size = "md",
}: Props) {
  const router  = useRouter();
  const toast   = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const conversation = await messageService.startConversation(candidateId, jobPostId);
      router.push(`/employer/messages?conversationId=${conversation.id}`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const base = "flex items-center gap-1.5 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClass  = size === "sm"
    ? "px-3 py-1.5 text-xs"
    : "px-4 py-2 text-sm";
  const variantClass = variant === "primary"
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${base} ${sizeClass} ${variantClass}`}
    >
      <MessageCircle size={size === "sm" ? 13 : 15} />
      {loading ? "Đang mở..." : label}
    </button>
  );
}