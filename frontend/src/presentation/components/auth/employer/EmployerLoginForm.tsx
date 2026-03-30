// src/presentation/components/auth/employer/EmployerLoginForm.tsx
"use client";
import { useState }        from "react";
import Link                from "next/link";
import {
  FormInput, PasswordInput, Divider,
  GoogleButton, 
} from "@/presentation/components/common/auth-ui";

interface Props {
  onSubmit:       (email: string, password: string, remember: boolean) => Promise<void>;
  onGoogleLogin?: () => void;
  loading?:       boolean;
  oauthLoading?:  boolean;
}

export function EmployerLoginForm({ onSubmit, onGoogleLogin, loading = false, oauthLoading = false }: Props) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())    e.email    = "Vui lòng nhập email";
    if (!password.trim()) e.password = "Vui lòng nhập mật khẩu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(email, password, remember);
  };

  const busy = loading || oauthLoading;

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="Joblin" className="h-16 w-36 mx-auto" /></Link>
      </div>

      {/* Switch to candidate */}
      <p className="text-center text-xs text-gray-500 mb-6">
        Bạn là ứng viên?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Nhấn vào đây
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Địa chỉ Email" type="email" placeholder="Nhập địa chỉ Email"
          value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
          error={errors.email}
        />
        <PasswordInput
          label="Mật khẩu" placeholder="Nhập mật khẩu"
          value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
          error={errors.password}
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600" />
            Ghi nhớ mật khẩu
          </label>
          <Link href="/auth/employer/forgot-password" className="text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit — dark button like PDF */}
        <button type="submit" disabled={busy}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded text-sm
            font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? "Đang xử lý..." : "Đăng Nhập"}
        </button>
      </form>

      <Divider />
      <GoogleButton onClick={onGoogleLogin} loading={oauthLoading} disabled={busy} />

      <p className="text-center text-xs text-gray-500 mt-4">
        Bạn chưa có tài khoản?{" "}
        <Link href="/auth/employer/signup" className="text-blue-600 hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}