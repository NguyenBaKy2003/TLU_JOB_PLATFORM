"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/presentation/components/auth/AuthLayout";
import { LoginForm } from "@/presentation/components/auth/LoginForm";
import { AuthService } from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useAuth } from "@/application/contexts/AuthContext";

const authService = new AuthService(new AuthRepository());

export default function LoginPage() {
  const router = useRouter();
  const { setUserFromToken } = useAuth();  // ✅ Không dùng refreshUser nữa

  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const handleSubmit = useCallback(async (email: string, password: string) => {
    setServerError(null);
    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      // ✅ User có sẵn trong token — set vào context ngay, không gọi thêm API
      setUserFromToken(token.user);
      router.push("/home");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [router, setUserFromToken]);

  const handleGoogleLogin = useCallback(async () => {
    setServerError(null);
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Không thể kết nối Google. Vui lòng thử lại."
      );
      setOauthLoading(false);
    }
  }, []);

  return (
    <AuthLayout imageSrc="/Frame1.png">
      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={loading}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}