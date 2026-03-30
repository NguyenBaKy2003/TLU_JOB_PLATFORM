"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FormInput,
  PasswordInput,
  GoogleButton,
  SubmitButton,
  Divider,
} from "@/presentation/components/common/auth-ui";
import { validateLoginForm, filterErrors, hasErrors } from "@/lib/validation";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
  onGoogleLogin?: () => void;
  loading?: boolean;
  oauthLoading?: boolean;
}

export function LoginForm({
  onSubmit,
  onGoogleLogin,
  loading = false,
  oauthLoading = false,
}: LoginFormProps) {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});
  const [remember, setRemember] = useState(false);

  const set = (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(err => ({ ...err, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = filterErrors(validateLoginForm(form));
    if (hasErrors(errs)) { setErrors(errs); return; }
    await onSubmit?.(form.email, form.password);
  };

  const busy = loading || oauthLoading;

  return (
    <div className="w-full max-w-[400px] mx-auto">

      {/* Logo */}
      <div className="text-center mb-1">
        <Link href="/">
          <img src="/Logo.svg" alt="JobPlatform" className="h-16 w-[142px] mx-auto" />
        </Link>
      </div>

      {/* Employer link */}
      <p className="text-center text-xs text-gray-500 mb-6">
        Bạn là nhà tuyển dụng?{" "}
        <Link href="/auth/employer/login" className="text-blue-600 hover:underline font-medium">
          Nhấn vào đây
        </Link>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Địa chỉ Email"
          id="email"
          type="email"
          placeholder="Nhập địa chỉ Email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />

        <PasswordInput
          label="Mật khẩu"
          id="password"
          placeholder="Nhập mật khẩu"
          minLength={6}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <SubmitButton loading={loading} disabled={busy}>
          Đăng Nhập
        </SubmitButton>
      </form>

      <Divider label="Hoặc" />

      <GoogleButton onClick={onGoogleLogin} loading={oauthLoading} disabled={busy} />

      <p className="text-center text-xs text-gray-500 mt-5">
        Bạn chưa có tài khoản?{" "}
        <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}