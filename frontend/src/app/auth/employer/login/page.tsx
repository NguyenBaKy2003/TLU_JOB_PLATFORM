"use client";

import { useState, useCallback, useEffect }   from "react";
import { useRouter }                          from "next/navigation";
import { AuthLayout }                         from "@/presentation/components/auth/AuthLayout";
import { EmployerLoginForm }                  from "@/presentation/components/auth/employer/EmployerLoginForm";
import { AuthService }                        from "@/application/services/AuthService";
import { AuthRepository }                     from "@/infrastructure/repositories/AuthRepository";
import { useAuth }                            from "@/application/contexts/AuthContext";
import { useToast }                           from "@/presentation/components/ui/toast";
import { setAccessToken, setRefreshToken }    from "@/lib/auth-helpers";

const authService = new AuthService(new AuthRepository());

export default function EmployerLoginPage() {
  const router                                           = useRouter();
  const { user, loading: authLoading, setUserFromToken } = useAuth();
  const toast                                            = useToast();
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Nếu đã đăng nhập → redirect về đúng dashboard theo role
  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(user.role === "CANDIDATE" ? "/home" : "/employer/dashboard");
  }, [user, authLoading, router]);

  const handleSubmit = useCallback(async (
    email: string,
    password: string,
    _remember: boolean,
  ) => {
    setLoading(true);
    try {
      const token = await authService.login({ email, password, portalType: "EMPLOYER" });
      setAccessToken(token.accessToken);
      setRefreshToken(token.refreshToken);
      setUserFromToken(token.user);

      toast.success("Đăng nhập thành công!", "Chào mừng bạn trở lại Joblin!");
      router.push("/employer/dashboard");
    } catch (err: any) {
      toast.error(
        "Đăng nhập thất bại",
        err?.response?.data?.message ?? "Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, [router, setUserFromToken, toast]);

  /**
   * Đăng nhập Google với portalType = "EMPLOYER".
   * AuthService truyền portal vào query param → backend nhúng vào OAuth2 state.
   */
  const handleGoogleLogin = useCallback(async () => {
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl("EMPLOYER");
      window.location.href = url;
    } catch (err: any) {
      toast.error(
        "Lỗi kết nối",
        err?.response?.data?.message ?? "Không thể kết nối Google.",
      );
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