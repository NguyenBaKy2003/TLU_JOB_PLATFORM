"use client";

import { useState } from "react";
import Link         from "next/link";
import { AuthService }    from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast }       from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

interface Props {
  email: string;
}

export function SentConfirmation({ email }: Props) {
  const toast = useToast();

  const [resending, setResending] = useState(false);
  const [cooldown,  setCooldown]  = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() =>
      setCooldown(v => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      }), 1000);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.requestPasswordReset({ email });
      toast.success("Đã gửi lại!", `Link đặt lại mật khẩu mới đã được gửi tới ${email}.`);
      startCooldown();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Không thể gửi lại. Vui lòng thử lại.";
      toast.error("Gửi thất bại", message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div className="text-center mb-6">
        <Link href="/">
          <img src="/Logo.svg" alt="JobPlatform" className="h-14 w-auto mx-auto" />
        </Link>
      </div>


      <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
        Kiểm tra email của bạn
      </h1>
      <p className="text-sm text-gray-500 text-center leading-relaxed">
        Chúng tôi đã gửi link đặt lại mật khẩu tới{" "}
        <span className="font-semibold text-gray-700">{email}</span>.
        <br />
        Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
      </p>

      <p className="text-center text-sm text-gray-500 mt-6">
        Bạn chưa nhận được email?{" "}
        {cooldown > 0 ? (
          <span className="text-gray-400">Gửi lại sau {cooldown}s</span>
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

      <p className="text-center text-sm text-gray-500 mt-3">
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}