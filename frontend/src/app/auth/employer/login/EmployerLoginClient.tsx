"use client";

import { useState, useCallback, useEffect }   from "react";
import { useRouter, useSearchParams }          from "next/navigation";
import { AuthLayout }                          from "@/presentation/components/auth/AuthLayout";
import { EmployerLoginForm }                   from "@/presentation/components/auth/employer/EmployerLoginForm";
import { AuthService }                         from "@/application/services/AuthService";
import { AuthRepository }                      from "@/infrastructure/repositories/AuthRepository";
import { useAuth }                             from "@/application/contexts/AuthContext";
import { useToast }                            from "@/presentation/components/ui/toast";
import { setAccessToken, setRefreshToken }     from "@/lib/auth-helpers";

const authService = new AuthService(new AuthRepository());

const OAUTH_ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  PORTAL_ACCESS_DENIED: {
    title:   "Sai trang đăng nhập",
    message: "Tài khoản này là ứng viên. Vui lòng đăng nhập tại trang ứng viên.",
  },
  ACCOUNT_LOCKED: {
    title:   "Tài khoản bị khóa",
    message: "Tài khoản đã bị khóa. Vui lòng liên hệ support.",
  },
};

// Named export — được import vào page.tsx (Server Component)
export function EmployerLoginClient() {
  const router                                            = useRouter();
  const searchParams                                      = useSearchParams();
  const { user, loading: authLoading, setUserFromToken }  = useAuth();
  const toast                                             = useToast();
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Hiển thị lỗi OAuth2 từ query param (?error=...)
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const { title, message } = OAUTH_ERROR_MESSAGES[error] ?? {
      title:   "Đăng nhập thất bại",
      message: "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.",
    };

    toast.error(title, message);

    // Xóa ?error khỏi URL để tránh hiển thị lại khi refresh
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Nếu đã đăng nhập → redirect về đúng dashboard theo role
  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(user.role === "CANDIDATE" ? "/" : "/employer/dashboard");
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