"use client";

import { AuthLayout }    from "@/presentation/components/auth/AuthLayout";
import { RegisterPage }  from "@/presentation/components/auth/RegisterPage";

export default function SignupPage() {
  const handleGoogleLogin = () => {
    // TODO: window.location.href = authRepository.getGoogleOAuthUrl(...)
    console.log("google oauth");
  };

  return (
    <AuthLayout imageSrc="/Frame1.png">
      <RegisterPage onGoogleLogin={handleGoogleLogin} />
    </AuthLayout>
  );
}