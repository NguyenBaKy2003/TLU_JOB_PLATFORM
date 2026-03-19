"use client";

import { useState, useCallback } from "react";
import { useRouter }              from "next/navigation";
import { AuthLayout }             from "@/presentation/components/auth/AuthLayout";
import { LoginForm }              from "@/presentation/components/auth/LoginForm";
import { AuthService }            from "@/application/services/AuthService";
import { AuthRepository }         from "@/infrastructure/repositories/AuthRepository";
import { useAuth }                from "@/application/contexts/AuthContext";
import { useToast }               from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

export default function LoginPage() {
  const router               = useRouter();
  const { setUserFromToken } = useAuth();
  const toast                = useToast();

  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // ── Email / Password ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      setUserFromToken(token.user);
      toast.success("Đăng nhập thành công!", "Chào mừng bạn quay trở lại JobPlatform!");
      router.push("/home");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error("Đăng nhập thất bại", message);
    } finally {
      setLoading(false);
    }
  }, [router, setUserFromToken,toast]); // ← toast không cần trong deps

  // ── Google OAuth ────────────────────────────────────────────────────────────

  const handleGoogleLogin = useCallback(async () => {
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Không thể kết nối Google. Vui lòng thử lại.";
      toast.error("Lỗi kết nối", message);
      setOauthLoading(false);
    }
  }, [toast]); // ← toast không cần trong deps

  return (
    <AuthLayout imageSrc="/Frame1.png">
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={loading}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}