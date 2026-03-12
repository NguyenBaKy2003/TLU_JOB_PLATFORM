"use client";

import { useEffect, useState } from "react";
import { TokenStorage } from "../../../../lib/auth.utils";

export default function OAuth2CallbackPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken  = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error        = params.get("error");
    const message      = params.get("message");

    if (error) {
      setErrorMsg(
        message ??
        (error === "ACCOUNT_LOCKED"
          ? "Tài khoản đã bị khóa. Vui lòng liên hệ support."
          : "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.")
      );
      setStatus("error");
      return;
    }

    if (accessToken) {
      TokenStorage.setTokens(accessToken, refreshToken ?? "");
      // Clean URL before redirect
      window.history.replaceState({}, "", window.location.pathname);
      window.location.href = "/home";
      return;
    }

    // No token and no error → something went wrong
    setErrorMsg("Không nhận được token. Vui lòng thử lại.");
    setStatus("error");
  }, []);

  return (
    <main className="min-h-screen bg-[#060a14] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        {status === "loading" ? (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Đang xử lý đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 text-xl">
              ✕
            </div>
            <p className="text-red-300 text-sm max-w-xs">{errorMsg}</p>
            <a
              href="/auth/login"
              className="inline-block mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Quay lại đăng nhập
            </a>
          </>
        )}
      </div>
    </main>
  );
}