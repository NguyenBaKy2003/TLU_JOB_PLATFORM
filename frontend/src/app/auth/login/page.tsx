"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter }              from "next/navigation";
import { AuthLayout }             from "@/presentation/components/auth/AuthLayout";
import { LoginForm }              from "@/presentation/components/auth/LoginForm";
import { AuthService }            from "@/application/services/AuthService";
import { AuthRepository }         from "@/infrastructure/repositories/AuthRepository";
import { useAuth }                from "@/application/contexts/AuthContext";
import { useToast }               from "@/presentation/components/ui/toast";
import { setAccessToken, setRefreshToken } from "@/lib/auth-helpers";

const authService = new AuthService(new AuthRepository());

export default function LoginPage() {
  const router                                           = useRouter();
  const { user, loading: authLoading, setUserFromToken } = useAuth();
  const toast                                            = useToast();
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Nếu đã đăng nhập → redirect về đúng dashboard theo role
  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(user.role === "EMPLOYER" ? "/employer/dashboard" : "/home");
  }, [user, authLoading, router]);

  const handleSubmit = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const token = await authService.login({ email, password, portalType: "CANDIDATE" });

      setAccessToken(token.accessToken);
      setRefreshToken(token.refreshToken);
      setUserFromToken(token.user);

      router.push("/home");
    } catch (err: any) {
      toast.error(
        "Đăng nhập thất bại",
        err?.response?.data?.message ?? "Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, [router, setUserFromToken, toast]);

  const handleGoogleLogin = useCallback(async () => {
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      toast.error("Lỗi kết nối", err?.response?.data?.message ?? "Không thể kết nối Google.");
      setOauthLoading(false);
    }
  }, [toast]);

  return (
    <AuthLayout imageSrc="/candidate.png">
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={loading}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}