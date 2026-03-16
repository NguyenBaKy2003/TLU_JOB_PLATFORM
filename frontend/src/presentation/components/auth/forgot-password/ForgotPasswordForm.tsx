"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthService }    from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast }       from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

interface Props {
  onSent: (email: string) => void;
}

export function ForgotPasswordForm({ onSent }: Props) {
  const toast = useToast();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập địa chỉ email."); return; }

    setError("");
    setLoading(true);
    try {
      await authService.requestPasswordReset({ email });
      toast.success("Đã gửi email!", `Chúng tôi đã gửi link đặt lại mật khẩu tới ${email}.`);
      onSent(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error("Gửi thất bại", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div className="text-center mb-6">
        <Link href="/">
          <img src="/Logo.svg" alt="JobPlatform" className="h-14 w-auto mx-auto" />
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Quên Mật Khẩu?
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
        Nhập email tài khoản Jobi của bạn bên dưới, chúng
        tôi sẽ gửi liên kết để đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            className={`
              w-full px-4 py-2.5 border rounded-lg text-sm text-gray-900
              outline-none transition-all bg-white
              ${error
                ? "border-red-400 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }
            `}
          />
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Đang gửi...
            </span>
          ) : "Gửi Yêu Cầu"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Bạn đã nhớ mật khẩu?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
}