"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/presentation/components/common/auth-ui";
import { AuthService } from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";

// ─── Singleton ────────────────────────────────────────────────────────────────

const authService = new AuthService(new AuthRepository());

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LEN = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OtpVerifyStepProps {
  email:      string;
  onVerified: () => void;
  onBack:     () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OtpVerifyStep({ email, onVerified, onBack }: OtpVerifyStepProps) {
  const [otp,      setOtp]      = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [resendCd, setResendCd] = useState(0);
  const [resending, setResending] = useState(false);

  // ── Countdown helper ────────────────────────────────────────────────────────

  const startCountdown = () => {
    setResendCd(60);
    const t = setInterval(() =>
      setResendCd(v => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      }), 1000);
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────

const handleResend = async () => {
  setResending(true);
  setError("");
  try {
    // ✅ Đúng endpoint
    await authService.resendVerificationEmail(email);
    startCountdown();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Không thể gửi lại mã. Vui lòng thử lại.");
  } finally {
    setResending(false);
  }
};

  // ── Input handlers ──────────────────────────────────────────────────────────

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && i < OTP_LEN - 1)
      document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (pasted.length === OTP_LEN) {
      setOtp(pasted.split(""));
      document.getElementById(`otp-${OTP_LEN - 1}`)?.focus();
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  if (otp.join("").length < OTP_LEN) { setError("Vui lòng nhập đủ mã OTP"); return; }

  setLoading(true);
  setError("");
  try {
    await authService.verifyEmail(email, otp.join(""));
    onVerified();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Mã OTP không chính xác. Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
};

  const filled = otp.filter(Boolean).length;

  return (
    <div className="w-full max-w-[300px] mx-auto">
      {/* Logo */}
      <div className="text-center mb-3">
        <Link href="/">
          <img src="/Logo.svg" alt="Job" className="h-10 w-auto mx-auto" />
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Xác Thực Địa Chỉ Email
      </h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Đã gửi mã xác thực tới{" "}
        <span className="font-medium text-gray-700">{email}</span>.<br />
        Vui lòng nhập mã để xác thực tài khoản.
      </p>

      <form onSubmit={handleVerify}>
        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-1" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={[
                "w-11 h-11 text-center text-lg font-bold border rounded-lg outline-none transition-all",
                digit   ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300",
                error   ? "border-red-400 bg-red-50"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              ].join(" ")}
            />
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 mb-1">
          {filled}/{OTP_LEN} ký tự
        </p>

        {error && (
          <p className="text-red-500 text-xs text-center mb-2">{error}</p>
        )}

        {/* Resend */}
        <p className="text-center text-xs text-gray-500 mb-4">
          Mã hết hạn sau 10 phút.{" "}
          {resendCd > 0 ? (
            <span className="text-gray-400">Gửi lại sau {resendCd}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 hover:underline font-medium disabled:opacity-50"
            >
              {resending ? "Đang gửi..." : "Gửi lại"}
            </button>
          )}
        </p>

        <SubmitButton loading={loading} disabled={filled < OTP_LEN}>
          Xác Thực
        </SubmitButton>
      </form>

      <p className="text-center text-xs text-gray-500 mt-4">
        Nhập sai email?{" "}
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline font-medium"
        >
          Quay lại
        </button>
      </p>
    </div>
  );
}