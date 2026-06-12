"use client";
import { useState } from "react";
import { X, Send, Sparkles, Mail, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import { LoadingSpinner } from "@/presentation/components/common";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { InviteCandidateResponse } from "@/domain/models/Ai";

const aiService = new AiService(new AiRepository());

const MAX_MESSAGE_LENGTH = 1000;

// ── Result view (sau khi gửi thành công) ─────────────────────────────────────

function InviteSuccessView({
  result,
  onClose,
}: {
  result: InviteCandidateResponse;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-emerald-500" />
      </div>

      <div>
        <p className="text-base font-semibold text-gray-900">
          Đã gửi lời mời đến {result.candidateName}
        </p>
        <p className="text-sm text-gray-400 mt-1">cho vị trí "{result.jobTitle}"</p>
      </div>

      {/* Delivery status */}
      <div className="w-full flex flex-col gap-2 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2.5">
          {result.notificationSaved
            ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            : <AlertCircle  size={16} className="text-amber-500 shrink-0" />
          }
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-gray-400" />
            <span className="text-base text-gray-700">
              Thông báo trong ứng dụng:
              <span className={`ml-1 font-medium ${result.notificationSaved ? "text-emerald-600" : "text-amber-600"}`}>
                {result.notificationSaved ? "Đã gửi" : "Thất bại"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {result.emailDispatched
            ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            : <AlertCircle  size={16} className="text-amber-500 shrink-0" />
          }
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span className="text-base text-gray-700">
              Email:
              <span className={`ml-1 font-medium ${result.emailDispatched ? "text-emerald-600" : "text-amber-600"}`}>
                {result.emailDispatched ? "Đã gửi" : "Ứng viên chưa có email"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl text-base font-semibold text-white
          bg-violet-600 hover:bg-violet-700 transition-colors"
      >
        Đóng
      </button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  jobPostId:          string;
  jobTitle:           string;
  candidateProfileId: string;
  candidateName:      string;
  onClose:            () => void;
  /** Gọi sau khi invite thành công — để caller update UI (vd: disable nút mời) */
  onSuccess?:         (result: InviteCandidateResponse) => void;
}

export function InviteCandidateModal({
  jobPostId,
  jobTitle,
  candidateProfileId,
  candidateName,
  onClose,
  onSuccess,
}: Props) {
  const toast = useToast();

  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<InviteCandidateResponse | null>(null);

  const remaining = MAX_MESSAGE_LENGTH - message.length;
  const isOverLimit = remaining < 0;

  const handleSend = async () => {
    if (isOverLimit) return;
    setLoading(true);
    try {
      const res = await aiService.inviteCandidate(
        jobPostId,
        candidateProfileId,
        message.trim() || undefined
      );
      setResult(res);
      onSuccess?.(res);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Không thể gửi lời mời"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Sparkles size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Mời ứng tuyển</p>
              <p className="text-sm text-gray-400 truncate max-w-[260px]">{candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
              text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {result ? (
            <InviteSuccessView result={result} onClose={onClose} />
          ) : (
            <div className="flex flex-col gap-4">

              {/* Job context */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                <p className="text-sm text-violet-500 font-medium mb-0.5">Vị trí mời ứng tuyển</p>
                <p className="text-base font-semibold text-violet-800 truncate">{jobTitle}</p>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Bell size={14} className="text-gray-400" /> Thông báo trong app
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} className="text-gray-400" /> Email (nếu có)
                </div>
              </div>

              {/* Personal message */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Lời nhắn cá nhân
                  <span className="ml-1 font-normal text-gray-400">(không bắt buộc)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Ví dụ: "Chúng tôi ấn tượng với kinh nghiệm của bạn về Java và K8s. Rất mong được trao đổi thêm!"`}
                  rows={4}
                  className={`w-full px-3 py-2.5 text-base bg-gray-50 border rounded-xl resize-none
                    focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300
                    ${isOverLimit
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                      : "border-gray-200 focus:ring-violet-500/20 focus:border-violet-400"
                    }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400">
                    Lời nhắn sẽ được gửi kèm trong email và thông báo
                  </p>
                  <span className={`text-sm font-medium ${isOverLimit ? "text-red-500" : "text-gray-400"}`}>
                    {remaining}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-base font-semibold text-gray-600
                    bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || isOverLimit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    text-base font-semibold text-white bg-violet-600 hover:bg-violet-700
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[.98]"
                >
                  {loading
                    ? <><LoadingSpinner size="sm" variant="white" /> Đang gửi...</>
                    : <><Send size={15} /> Gửi lời mời</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}