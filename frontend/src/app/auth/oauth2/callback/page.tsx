"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessToken, setRefreshToken } from "@/lib/auth-helpers";
import { useAuth } from "@/application/contexts/AuthContext";
import { useToast } from "@/presentation/components/ui/toast";

/** Map error code → trang login phù hợp để redirect sau khi báo lỗi */
const LOGIN_REDIRECT: Record<string, string> = {
  PORTAL_ACCESS_DENIED: "/auth/login", // frontend tự suy ra từ context; đây là fallback candidate
  ACCOUNT_LOCKED:       "/auth/login",
};

export default function OAuth2CallbackPage() {
  const router       = useRouter();
  const { refreshUser } = useAuth();
  const toast        = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken  = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error        = params.get("error");
    const message      = params.get("message");
    const portal       = params.get("portal"); // "CANDIDATE" | "EMPLOYER"

    // ── Lỗi từ backend ──────────────────────────────────────────────────────
    if (error) {
      const msg = message ?? buildDefaultMessage(error);
      toast.error("Đăng nhập thất bại", msg);
      setErrorMsg(msg);

      // Với PORTAL_ACCESS_DENIED: backend trả message đã có hướng dẫn.
      // Sau 2 giây tự redirect về trang login tương ứng.
      const redirectTo = error === "PORTAL_ACCESS_DENIED"
        ? resolveLoginPage(portal, message)
        : LOGIN_REDIRECT[error] ?? "/auth/login";

      setTimeout(() => router.replace(redirectTo), 2500);
      return;
    }

    // ── Không có token ───────────────────────────────────────────────────────
    if (!accessToken || !refreshToken) {
      const msg = "Không nhận được token. Vui lòng thử lại.";
      toast.error("Lỗi xác thực", msg);
      setErrorMsg(msg);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    // ── Thành công ───────────────────────────────────────────────────────────
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    // Xóa tokens khỏi URL (tránh leak trong history / referer header)
    window.history.replaceState({}, "", window.location.pathname);

    refreshUser()
      .then(() => {
        toast.success("Đăng nhập thành công!", "Chào mừng bạn đến với JobPlatform.");
        // Redirect theo portal mà backend xác nhận — không tự suy từ JWT phía client
        const dest = portal === "EMPLOYER" ? "/employer/dashboard" : "/home";
        setTimeout(() => router.replace(dest), 800);
      })
      .catch(() => {
        const msg = "Không thể tải thông tin tài khoản. Vui lòng thử lại.";
        toast.error("Lỗi tải dữ liệu", msg);
        setErrorMsg(msg);
        setTimeout(() => router.replace("/auth/login"), 2500);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <p className="text-gray-400 text-xs">Đang chuyển hướng về trang đăng nhập...</p>
      </div>
    </main>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultMessage(error: string): string {
  switch (error) {
    case "ACCOUNT_LOCKED":
      return "Tài khoản đã bị khóa. Vui lòng liên hệ support.";
    case "PORTAL_ACCESS_DENIED":
      return "Tài khoản không có quyền truy cập trang này.";
    default:
      return "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.";
  }
}

/**
 * Với PORTAL_ACCESS_DENIED, backend đã trả message chứa gợi ý ("trang ứng viên" / "trang nhà tuyển dụng").
 * Dùng nội dung đó để redirect về đúng trang login.
 */
function resolveLoginPage(portal: string | null, message: string | null): string {
  if (message?.includes("nhà tuyển dụng")) return "/employer/auth/login";
  if (message?.includes("ứng viên"))      return "/auth/login";
  // Fallback theo portal param (nếu có)
  if (portal === "EMPLOYER")              return "/employer/auth/login";
  return "/auth/login";
}