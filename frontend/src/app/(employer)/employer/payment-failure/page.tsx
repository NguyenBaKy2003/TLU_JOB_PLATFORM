// app/employer/payment-failure/page.tsx  — Server Component
import { Suspense } from "react";
import { PaymentFailureClient } from "./PaymentFailureClient";

export default function EmployerPaymentFailurePage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailureClient redirectBase="/employer/subscription" homeHref="/employer/dashboard" />
    </Suspense>
  );
}