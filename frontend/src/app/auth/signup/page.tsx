"use client";
import { useState, useCallback } from "react";
import { AuthLayout }    from "@/presentation/components/auth/AuthLayout";
import { RegisterPage }  from "@/presentation/components/auth/register/RegisterPage";
import { AuthService }   from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast } from "@/presentation/components/ui/toast";
const authService = new AuthService(new AuthRepository());
export default function SignupPage() {
  const toast = useToast();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const handleGoogleLogin = useCallback(async () => {
    setServerError(null);
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : "Không thể kết nối Google. Vui lòng thử lại.";
      toast.error("Đăng nhập thất bại", msg);
      setServerError(msg);
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
  );}