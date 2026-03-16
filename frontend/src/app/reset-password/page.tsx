"use client";

import { useSearchParams }    from "next/navigation";
import { AuthLayout }         from "@/presentation/components/auth/AuthLayout";
import { ResetPasswordForm }  from "@/presentation/components/auth/reset-password/ResetPasswordForm";
import { InvalidTokenState }  from "@/presentation/components/auth/reset-password/InvalidTokenState";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token  = searchParams.get("token");
  const userId = searchParams.get("userId");

  return (
    <AuthLayout imageSrc="/Frame1.png">
      {token && userId
        ? <ResetPasswordForm token={token} userId={userId} />
        : <InvalidTokenState />
      }
    </AuthLayout>
  );
}