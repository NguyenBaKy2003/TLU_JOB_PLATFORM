// src/app/auth/signup/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter }      from "next/navigation";
import { AuthLayout }     from "@/presentation/components/auth/AuthLayout";
import { RegisterPage }   from "@/presentation/components/auth/register/RegisterPage";
import { AuthService }    from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useAuth }        from "@/application/contexts/AuthContext";
import { useToast }       from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

export default function SignupPage() {
  const router               = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast                = useToast();
  const [oauthLoading, setOauthLoading] = useState(false);

  // Đã đăng nhập rồi → redirect
  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(user.role === "EMPLOYER" ? "/employer/dashboard" : "/home");
  }, [user, authLoading, router]);

  const handleGoogleLogin = useCallback(async () => {
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      toast.error("Đăng nhập thất bại", err?.response?.data?.message ?? "Không thể kết nối Google.");
      setOauthLoading(false);
    }
  }, [toast]);

  return (
    <AuthLayout imageSrc="/candidate.png">
      <RegisterPage
        onGoogleLogin={handleGoogleLogin}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}