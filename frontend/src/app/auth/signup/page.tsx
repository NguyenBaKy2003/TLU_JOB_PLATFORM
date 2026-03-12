"use client";

import { useState, useCallback } from "react";
import { AuthLayout }   from "@/presentation/components/auth/AuthLayout";
import { RegisterPage } from "@/presentation/components/auth/register/RegisterPage";
import { AuthService }  from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";

const authService = new AuthService(new AuthRepository());

export default function SignupPage() {
  const [oauthLoading, setOauthLoading] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const handleGoogleLogin = useCallback(async () => {
    setServerError(null);
    setOauthLoading(true);
    try {
      const url = await authService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Không thể kết nối Google. Vui lòng thử lại."
      );
      setOauthLoading(false);
    }
  }, []);

  return (
    <AuthLayout imageSrc="/Frame1.png">
      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}
      <RegisterPage
        onGoogleLogin={handleGoogleLogin}
        oauthLoading={oauthLoading}
      />
    </AuthLayout>
  );
}