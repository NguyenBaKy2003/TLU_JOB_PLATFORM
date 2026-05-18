"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { SettingRepository } from "@/infrastructure/repositories/SettingRepository";
import { SettingService } from "@/application/services/SettingService";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

// ── Types ────────────────────────────────────────────────────────────────────

type Status = "loading" | "success" | "error";
type Role   = "candidate" | "employer" | "admin";

interface Props {
  userId: string;
  token: string;
  role: Role;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SETTINGS_PATH: Record<Role, string> = {
  candidate : "/candidate/settings",
  employer  : "/employer/settings",
  admin     : "/admin/settings",
};

const LOGIN_PATH: Record<Role, string> = {
  candidate : "/auth/login",
  employer  : "/auth/login",
  admin     : "/auth/login",
};

// ── Constants ─────────────────────────────────────────────────────────────────

const REDIRECT_DELAY_MS = 5_000;

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfirmEmailForm({ userId, token, role }: Props) {
  const router = useRouter();
  const calledRef = useRef(false); // StrictMode guard — chỉ gọi API 1 lần

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1_000);

  // ── Confirm email on mount ────────────────────────────────────────────────

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const service = new SettingService(new SettingRepository());

    service
      .confirmEmailChange({ userId, token })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        const msg =
         extractErrorMessage(err);
        setErrorMessage(msg);
        setStatus("error");
      });
  }, [userId, token]);

  // ── Countdown & redirect after success ───────────────────────────────────

  useEffect(() => {
    if (status !== "success") return;

    // Sau khi confirm email, tất cả session bị revoke → phải đăng nhập lại
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(LOGIN_PATH[role]);
        }
        return prev - 1;
      });
    }, 1_000);

    return () => clearInterval(interval);
  }, [status, router, role]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full mx-auto py-8">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        {status === "loading" && (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        )}
        {status === "success" && (
          <CheckCircle className="w-8 h-8 text-green-500" />
        )}
        {status === "error" && (
          <XCircle className="w-8 h-8 text-destructive" />
        )}
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {status === "loading" && "Đang xác nhận email…"}
          {status === "success" && "Email đã được xác nhận!"}
          {status === "error" && "Xác nhận thất bại"}
        </h1>

        <p className="text-[16px] text-muted-foreground">
          {status === "loading" &&
            "Vui lòng đợi trong giây lát, chúng tôi đang xử lý yêu cầu của bạn."}
          {status === "success" && (
            <>
              Địa chỉ email của bạn đã được cập nhật thành công.
              <br />
              Tất cả phiên đăng nhập đã bị huỷ — bạn sẽ được chuyển đến trang
              đăng nhập sau{" "}
              <span className="font-medium text-foreground">{countdown}s</span>.
            </>
          )}
          {status === "error" && (
            errorMessage ||
            "Liên kết xác nhận không hợp lệ hoặc đã hết hạn (15 phút)."
          )}
        </p>
      </div>

      {/* Actions */}
      {status === "success" && (
        <button
          type="button"
          onClick={() => router.push(LOGIN_PATH[role])}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[16px] font-medium hover:bg-primary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Đăng nhập ngay
        </button>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={() => router.push(SETTINGS_PATH[role])}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-[16px] font-medium hover:bg-primary/90 transition-colors"
          >
            Gửi lại yêu cầu đổi email
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 rounded-md border text-[16px] font-medium hover:bg-muted transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      )}
    </div>
  );
}