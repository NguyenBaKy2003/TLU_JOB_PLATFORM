"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/presentation/components/auth/AuthLayout";
import { LoginForm }  from "@/presentation/components/auth/LoginForm";
import { AuthService }    from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useAuth } from "@/application/contexts/AuthContext";
import { useToast } from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setUserFromToken } = useAuth();
  const toast = useToast();

  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const justRegistered = searchParams.get("registered") === "true";

  // ── Email / Password ────────────────────────────────────────────────────────

 const handleSubmit = useCallback(async (email: string, password: string) => {
  setLoading(true);

  try {
    const token = await authService.login({ email, password });

    setUserFromToken(token.user);
    router.push("/home");

    toast.success(
      "Đăng nhập thành công!",
      "Chào mừng bạn quay trở lại School Relief System!"
    );

  } catch (err: any) {

    const message =
      err?.response?.data?.message || "Đăng nhập thất bại";

    toast.error("Đăng nhập thất bại", message);

  } finally {
    setLoading(false);
  }
}, [router, setUserFromToken]);
  // ── Google OAuth ────────────────────────────────────────────────────────────

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
      toast.error("Lỗi kết nối", msg);
      setServerError(msg);
      setOauthLoading(false);
    }
  }, [toast]);

  return (
    <AuthLayout imageSrc="/Frame1.png">
      {justRegistered && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
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