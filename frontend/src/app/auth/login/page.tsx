// src/app/auth/login/page.tsx
// Server Component — KHÔNG dùng hooks ở đây

import { Suspense }    from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    // Suspense bắt buộc vì LoginClient dùng useSearchParams()
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}