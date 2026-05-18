// src/app/auth/reset-password/page.tsx
// Server Component — KHÔNG dùng hooks ở đây

import { Suspense }                  from "react";
import { AuthLayout }                from "@/presentation/components/auth/AuthLayout";
import { ResetPasswordPageClient }   from "./ResetPasswordPageClient";

export default function ResetPasswordPage() {
  return (
    <AuthLayout imageSrc="/candidate.png">
      <Suspense fallback={null}>
        <ResetPasswordPageClient />
      </Suspense>
    </AuthLayout>
  );
}