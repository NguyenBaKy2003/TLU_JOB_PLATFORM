"use client";

import { useState }            from "react";
import { StepBar }             from "@/presentation/components/common/auth-ui";
import { RegisterInfoStep }    from "./RegisterInfoStep";
import { OtpVerifyStep }       from "./OtpVerifyStep";
import { LocationStep }        from "./LocationStep";
import { MinimumSalaryStep }   from "./MinimumSalaryStep";
import { UploadCvStep }        from "./UploadCvStep";
import { RegisterSuccessStep } from "./RegisterSuccessStep";
import { AuthTokenResponse }   from "@/domain/models/User";

const STEPS = ["Thông tin", "Xác thực", "Vị trí", "Mức lương", "Hồ sơ"];

const STEP = {
  INFO:     0,
  OTP:      1,
  LOCATION: 2,
  SALARY:   3,
  CV:       4,
  SUCCESS:  5,
} as const;

// ── Onboarding data shape ─

interface OnboardingData {
  location:   string;
  postalCode: string;
  remote:     boolean;
  salary:     number;
  cycle:      string;
  cvFile:     File | null;
}

const INIT_ONBOARDING: OnboardingData = {
  location:   "",
  postalCode: "",
  remote:     false,
  salary:     0,
  cycle:      "",
  cvFile:     null,
};

export interface RegisterPageProps {
  onGoogleLogin?: () => void;
  oauthLoading?:  boolean;
}

export function RegisterPage({ onGoogleLogin, oauthLoading = false }: RegisterPageProps) {
  const [step,       setStep]       = useState<number>(STEP.INFO);
  const [email,      setEmail]      = useState("");
  const [token,      setToken]      = useState<AuthTokenResponse | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData>(INIT_ONBOARDING);

  const stepBarIndex = Math.min(step, STEPS.length - 1);

  const mergeOnboarding = (patch: Partial<OnboardingData>) =>
    setOnboarding(prev => ({ ...prev, ...patch }));

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {step < STEP.SUCCESS && (
        <StepBar steps={STEPS} current={stepBarIndex} />
      )}

      {step === STEP.INFO && (
        <RegisterInfoStep
          onNext={registeredEmail => {
            setEmail(registeredEmail);
            setStep(STEP.OTP);
          }}
          onGoogleLogin={onGoogleLogin}
          oauthLoading={oauthLoading}
        />
      )}

      {step === STEP.OTP && (
        <OtpVerifyStep
          email={email}
          onVerified={receivedToken => {
            setToken(receivedToken);
            setStep(STEP.LOCATION);
          }}
          onBack={() => setStep(STEP.INFO)}
        />
      )}

      {step === STEP.LOCATION && (
        <LocationStep
          onNext={data => {
            mergeOnboarding(data);
            setStep(STEP.SALARY);
          }}
          onSkip={() => setStep(STEP.SALARY)}
        />
      )}

      {step === STEP.SALARY && (
        <MinimumSalaryStep
          onNext={data => {
            mergeOnboarding(data);
            setStep(STEP.CV);
          }}
          onSkip={() => setStep(STEP.CV)}
        />
      )}

      {step === STEP.CV && (
        <UploadCvStep
          onComplete={file => {
            mergeOnboarding({ cvFile: file });
            setStep(STEP.SUCCESS);
          }}
          onSkip={() => setStep(STEP.SUCCESS)}
        />
      )}

      {step === STEP.SUCCESS && token && (
        <RegisterSuccessStep
          token={token}
          onboarding={onboarding}
        />
      )}
    </div>
  );
}