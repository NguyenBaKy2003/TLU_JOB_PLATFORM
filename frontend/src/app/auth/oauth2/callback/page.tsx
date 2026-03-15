"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessToken, setRefreshToken } from "@/lib/auth-helpers";
import { useAuth } from "@/application/contexts/AuthContext";
import { useToast } from "@/presentation/components/ui/toast";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken  = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error        = params.get("error");
    const message      = params.get("message");

    // ── Lỗi từ backend ──────────────────────────────────────────────────────
    if (error) {
      const msg =
        message ??
        (error === "ACCOUNT_LOCKED"
          ? "Tài khoản đã bị khóa. Vui lòng liên hệ support."
          : "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.");

      toast.error("Đăng nhập thất bại", msg);
      setErrorMsg(msg);
      return;
    }

    // ── Không có token ───────────────────────────────────────────────────────
    if (!accessToken || !refreshToken) {
      const msg = "Không nhận được token. Vui lòng thử lại.";
      toast.error("Lỗi xác thực", msg);
      setErrorMsg(msg);
      return;
    }

    // ── Thành công ───────────────────────────────────────────────────────────
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    window.history.replaceState({}, "", window.location.pathname);

    refreshUser()
      .then(() => {
        toast.success("Đăng nhập thành công!", "Chào mừng bạn đến với JobPlatform.");
        setTimeout(() => router.replace("/home"), 800);
      })
      .catch(() => {
        const msg = "Không thể tải thông tin tài khoản. Vui lòng thử lại.";
        toast.error("Lỗi tải dữ liệu", msg);
        setErrorMsg(msg);
      });
  }, []);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!errorMsg) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Đang xử lý đăng nhập...</p>
        </div>
      </main>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#ef4444" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6"  y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <p className="text-red-500 text-sm max-w-xs">{errorMsg}</p>
        <a
          href="/auth/login"
          className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Quay lại đăng nhập
        </a>
      </div>
    </main>
  );
}