// src/app/employer/payment-failure/page.tsx
// Server Component — KHÔNG dùng hooks ở đây

import { Suspense }               from "react";
import { PaymentFailureClient }   from "./PaymentFailureClient";

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailureClient />
    </Suspense>
  );
}