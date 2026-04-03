"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  /** Phần form bên trái — thay bằng Login/Register/OTP/... */
  children: ReactNode;
  /** Ảnh bên phải, default candidate.png */
  imageSrc?: string;
}

/**
 * Layout 2 cột dùng chung cho mọi bước auth:
 *   <AuthLayout> <LoginForm /> </AuthLayout>
 *   <AuthLayout> <RegisterForm /> </AuthLayout>
 *   <AuthLayout> <OtpForm /> </AuthLayout>
 */
export function AuthLayout({ children, imageSrc = "/candidate.png" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex w-full max-w-6xl min-h-[520px]">

        {/* ── Left panel — swappable content ─────────── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10">
          {children}
        </div>

        {/* ── Right panel — image ─────────────────────── */}
        <div className="hidden md:block w-[530px] flex-shrink-0">
          <img
            src={imageSrc}
            alt="auth visual"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}