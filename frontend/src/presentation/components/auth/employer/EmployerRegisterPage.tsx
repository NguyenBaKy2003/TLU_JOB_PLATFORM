// src/presentation/components/auth/employer/EmployerRegisterPage.tsx
// 2-step flow: Thông tin cá nhân → Thông tin công ty
"use client";
import { useState }             from "react";
import { StepBar }              from "@/presentation/components/common/auth-ui";
import { EmployerInfoStep }     from "./EmployerInfoStep";
import { OtpVerifyStep }        from "@/presentation/components/auth/register/OtpVerifyStep";
import { CompanyDetailsStep }   from "./CompanyDetailsStep";

// Chỉ 2 step hiển thị trên StepBar (theo PDF)
const STEPS = ["Thông tin", "Công ty"];

const STEP = { INFO: 0, OTP: 1, COMPANY: 2, DONE: 3 } as const;

interface Props {
  onGoogleLogin?: () => void;
  oauthLoading?:  boolean;
}

export function EmployerRegisterPage({ onGoogleLogin, oauthLoading = false }: Props) {
  const [step,  setStep]  = useState<number>(STEP.INFO);
  const [email, setEmail] = useState("");

  // StepBar index: INFO=0, OTP còn ở step 0, COMPANY=1
  const barIndex = step >= STEP.COMPANY ? 1 : 0;

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {step < STEP.DONE && (
        <StepBar steps={STEPS} current={barIndex} />
      )}

      {step === STEP.INFO && (
        <EmployerInfoStep
          onNext={registeredEmail => { setEmail(registeredEmail); setStep(STEP.OTP); }}
          onGoogleLogin={onGoogleLogin}
          oauthLoading={oauthLoading}
        />
      )}

      {step === STEP.OTP && (
        <OtpVerifyStep
          email={email}
          onVerified={_token => setStep(STEP.COMPANY)}
          onBack={() => setStep(STEP.INFO)}
        />
      )}

      {step === STEP.COMPANY && (
        <CompanyDetailsStep
          onComplete={_data => setStep(STEP.DONE)}
          onSkip={() => setStep(STEP.DONE)}
        />
      )}

      {step === STEP.DONE && (
        // Redirect handled inside — dùng router.replace trong CompanyDetailsStep
        // hoặc show success inline
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Đăng ký thành công!</h2>
          <p className="text-sm text-gray-500 mb-6">Tài khoản nhà tuyển dụng của bạn đã được tạo.</p>
          <a href="/dashboard"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors">
            Vào trang quản lý
          </a>
        </div>
      )}
    </div>
  );
}