"use client";

import { useState } from "react";
import { StepBar } from "@/presentation/components/common/auth-ui";
import { RegisterInfoStep }    from "./RegisterInfoStep";
import { OtpVerifyStep }       from "./OtpVerifyStep";
import { RegisterSuccessStep } from "./RegisterSuccessStep";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Thông tin", "Xác thực", "Hoàn tất"];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPageProps {
  onGoogleLogin?: () => void;
  oauthLoading?:  boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterPage({ onGoogleLogin, oauthLoading = false }: RegisterPageProps) {
  const [step,  setStep]  = useState(0);
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <StepBar steps={STEPS} current={step} />

      {step === 0 && (
        <RegisterInfoStep
          onNext={registeredEmail => { setEmail(registeredEmail); setStep(1); }}
          onGoogleLogin={onGoogleLogin}
          oauthLoading={oauthLoading}
        />
      )}

      {step === 1 && (
        <OtpVerifyStep
          email={email}
          onVerified={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && <RegisterSuccessStep />}
    </div>
  );
}