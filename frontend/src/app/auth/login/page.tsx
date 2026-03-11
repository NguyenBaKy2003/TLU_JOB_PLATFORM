"use client";

import { AuthLayout } from "@/presentation/components/auth/AuthLayout";
import { LoginForm }  from "@/presentation/components/auth/LoginForm";
// import { AuthService }    from "@/usecase/services/AuthService";
// import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
// import { useRouter }      from "next/navigation";
// import { useAuth }        from "@/usecase/contexts/AuthContext";

// const authRepository = new AuthRepository();
// const authService    = new AuthService(authRepository);

export default function LoginPage() {
  // const router      = useRouter();
  // const { refreshUser } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    // TODO: await authService.login({ email, password })
    // await refreshUser()
    // router.push("/dashboard")
    console.log("login", { email, password });
  };

  const handleGoogleLogin = () => {
    // TODO: window.location.href = authRepository.getGoogleOAuthUrl(...)
    console.log("google login");
  };

  return (
    <AuthLayout imageSrc="/Frame1.png">
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
      />
    </AuthLayout>
  );
}