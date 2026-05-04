// src/app/settings/confirm-email/page.tsx
// Server Component — KHÔNG dùng hooks ở đây

import { Suspense }               from "react";
import { AuthLayout }             from "@/presentation/components/auth/AuthLayout";
import { ConfirmEmailPageClient } from "./ConfirmEmailPageClient";

export default function ConfirmEmailPage() {
  return (
    <AuthLayout imageSrc="/candidate.png">
      {/* Suspense bắt buộc khi dùng useSearchParams trong child */}
      <Suspense fallback={null}>
        <ConfirmEmailPageClient />
      </Suspense>
    </AuthLayout>
  );
}