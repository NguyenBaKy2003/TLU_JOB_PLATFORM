// src/app/auth/employer/login/page.tsx
"use client";
import { useState, useCallback } from "react";
import { useRouter }             from "next/navigation";
import { AuthLayout }            from "@/presentation/components/auth/AuthLayout";
import { EmployerLoginForm }     from "@/presentation/components/auth/employer/EmployerLoginForm";
import { AuthService }           from "@/application/services/AuthService";
import { AuthRepository }        from "@/infrastructure/repositories/AuthRepository";
import { useAuth }               from "@/application/contexts/AuthContext";
import { useToast }              from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

export default function EmployerLoginPage() {
  const router               = useRouter();
  const { setUserFromToken } = useAuth();
  const toast                = useToast();
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      setUserFromToken(token.user);
      toast.success("Đăng nhập thành công!", "Chào mừng bạn trở lại Joblin!");
      router.push("/employer/dashboard");
    } catch (err: any) {
      toast.error("Đăng nhập thất bại", err?.response?.data?.message ?? "Vui lòng thử lại.");
    } finally { setLoading(false); }
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
    <AuthLayout imageSrc="/company.svg">
      <EmployerLoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={loading}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}