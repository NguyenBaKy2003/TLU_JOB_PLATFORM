"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordField }     from "./PasswordField";
import { ResetSuccessState } from "./ResetSuccessState";
import { AuthService }       from "@/application/services/AuthService";
import { AuthRepository }    from "@/infrastructure/repositories/AuthRepository";
import { useToast }          from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

interface Props {
  token:  string;
  userId: string;
}

type FormErrors = { password?: string; confirm?: string };

export function ResetPasswordForm({ token, userId }: Props) {
  const router = useRouter();
  const toast  = useToast();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
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
      await authService.verifyPasswordReset({ token, userId, newPassword: password });
      toast.success("Đặt lại thành công!", "Mật khẩu mới của bạn đã được lưu.");
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error("Đặt lại thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) return <ResetSuccessState />;

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div className="text-center mb-6">
        <Link href="/">
          <img src="/Logo.svg" alt="JobPlatform" className="h-14 w-auto mx-auto" />
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Thiết Lập Mật Khẩu Mới
      </h1>
      <p className="text-[16px] text-gray-500 text-center mb-8 leading-relaxed">
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
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[16px] font-semibold rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Đang lưu...
            </span>
          ) : "Lưu Mật Khẩu Mới"}
        </button>
      </form>

      <p className="text-center text-[16px] text-gray-500 mt-6">
        Bạn không muốn đổi mật khẩu?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
}