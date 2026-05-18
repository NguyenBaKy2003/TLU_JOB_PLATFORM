"use client";

import { useSearchParams }    from "next/navigation";
import { ResetPasswordForm }  from "@/presentation/components/auth/reset-password/ResetPasswordForm";
import { InvalidTokenState }  from "@/presentation/components/auth/reset-password/InvalidTokenState";

// Named export — được import vào page.tsx (Server Component)
export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token  = searchParams.get("token");
  const userId = searchParams.get("userId");

  // Thiếu token hoặc userId → hiển thị trạng thái lỗi
  if (!token || !userId) {
    return <InvalidTokenState />;
  }

  return <ResetPasswordForm token={token} userId={userId} />;
}