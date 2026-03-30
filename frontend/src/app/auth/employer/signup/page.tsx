// src/app/auth/employer/signup/page.tsx
"use client";
import { useState, useCallback } from "react";
import { AuthLayout }            from "@/presentation/components/auth/AuthLayout";
import { EmployerRegisterPage }  from "@/presentation/components/auth/employer/EmployerRegisterPage";
import { AuthService }           from "@/application/services/AuthService";
import { AuthRepository }        from "@/infrastructure/repositories/AuthRepository";
import { useToast }              from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

export default function EmployerSignupPage() {
  const toast = useToast();
  const [oauthLoading, setOauthLoading] = useState(false);

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
      <EmployerRegisterPage
        onGoogleLogin={handleGoogleLogin}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}