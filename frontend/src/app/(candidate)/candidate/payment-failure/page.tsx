// app/candidate/payment-failure/page.tsx  — Server Component
import { Suspense } from "react";
import { PaymentFailureClient } from "./PaymentFailureClient";

export default function CandidatePaymentFailurePage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailureClient redirectBase="/candidate/subscription" homeHref="/candidate/dashboard" />
    </Suspense>
  );
}