"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout }    from "@/presentation/components/auth/AuthLayout";
import { AuthService }   from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast } from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ─── Password input với toggle ────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900
            outline-none transition-all bg-white
            ${error
              ? "border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }
          `}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

// ─── Reset form ───────────────────────────────────────────────────────────────

function ResetForm({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  const router = useRouter();
  const toast  = useToast();

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [errors,      setErrors]      = useState<{ password?: string; confirm?: string }>({});
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!PASSWORD_REGEX.test(password)) {
      errs.password = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.";
    }
    if (password !== confirm) {
      errs.confirm = "Mật khẩu xác nhận không khớp.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.verifyPasswordReset({
        token:       token,   
        userId:        userId,
        newPassword: password,
      });

      toast.success("Đặt lại thành công!", "Mật khẩu mới của bạn đã được lưu.");
      setDone(true);

      // Redirect sang login sau 2 giây
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error("Đặt lại thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Thành công ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-[340px] mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt lại thành công!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Mật khẩu mới của bạn đã được lưu.<br />
          Đang chuyển hướng về trang đăng nhập...
        </p>
        <Link href="/auth/login"
          className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] mx-auto">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link href="/">
          <img src="/Logo.svg" alt="JobPlatform" className="h-14 w-auto mx-auto" />
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Thiết Lập Mật Khẩu Mới
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          label="Mật khẩu"
          value={password}
          onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
          error={errors.password}
        />
        <PasswordField
          label="Xác nhận mật khẩu"
          value={confirm}
          onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: undefined })); }}
          error={errors.confirm}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Đang lưu...
            </span>
          ) : "Lưu Mật Khẩu Mới"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Bạn không muốn đổi mật khẩu?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
}

// ─── Invalid token state ──────────────────────────────────────────────────────

function InvalidToken() {
  return (
    <div className="w-full max-w-[340px] mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="#ef4444" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6"  y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Link không hợp lệ</h2>
      <p className="text-sm text-gray-500 mb-6">
        Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.<br />
        Vui lòng yêu cầu gửi lại.
      </p>
      <Link href="/auth/forgot-password"
        className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center">
        Gửi lại yêu cầu
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token  = searchParams.get("token");
  const userId = searchParams.get("userId");

  return (
    <AuthLayout imageSrc="/Frame1.png">
      {token && userId
        ? <ResetForm token={token} userId={userId} />
        : <InvalidToken />
      }
    </AuthLayout>
  );
}