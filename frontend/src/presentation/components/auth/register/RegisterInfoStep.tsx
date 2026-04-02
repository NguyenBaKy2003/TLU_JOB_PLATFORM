"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FormInput,
  PasswordInput,
  Divider,
  GoogleButton,
  SubmitButton,
} from "@/presentation/components/common/auth-ui";
import {
  validateRegisterForm,
  filterErrors,
  hasErrors,
} from "@/lib/validation";
import { AuthService } from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast } from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

const INIT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export interface RegisterInfoStepProps {
  onNext: (email: string) => void;
  onGoogleLogin?: () => void;
  oauthLoading?: boolean;
}

export function RegisterInfoStep({
  onNext,
  onGoogleLogin,
  oauthLoading = false,
}: RegisterInfoStepProps) {
  const toast = useToast();

  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState<Partial<typeof INIT_FORM>>({});
  const [loading, setLoading] = useState(false);

  const set =
    (field: keyof typeof INIT_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = filterErrors(validateRegisterForm(form));
    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const fullName =
        `${form.firstName} ${form.lastName}`.trim() || form.email.split("@")[0];

      await authService.signup({
        email: form.email,
        password: form.password,
        fullName,
      });

      toast.success(
        "Đăng ký thành công!",
        "Vui lòng kiểm tra email và nhập mã OTP để xác thực tài khoản.",
      );
      onNext(form.email);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error("Đăng ký thất bại", message);
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || oauthLoading;

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <Link href="/">
          <img src="/Logo.svg" alt="Job" className="h-16 !w-[144] mx-auto" />
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
        Cung cấp thông tin
      </h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Vui lòng nhập thông tin cá nhân để thiết lập tài khoản
        <br />
        và cá nhân hóa trải nghiệm của bạn
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Tên"
          type="text"
          placeholder="Nhập tên"
          value={form.firstName}
          onChange={set("firstName")}
          error={errors.firstName}
        />
        <FormInput
          label="Họ"
          placeholder="Nhập họ"
          value={form.lastName}
          onChange={set("lastName")}
          error={errors.lastName}
        />
        <FormInput
          label="Địa chỉ Email"
          type="email"
          placeholder="Nhập địa chỉ Email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <PasswordInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />
        <PasswordInput
          label="Xác nhận mật khẩu"
          placeholder="Xác nhận mật khẩu của bạn"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />
        <SubmitButton loading={loading} disabled={busy}>
          Đăng Ký
        </SubmitButton>
      </form>

      <Divider />
      <GoogleButton
        onClick={onGoogleLogin}
        loading={oauthLoading}
        disabled={busy}
      />

      <p className="text-center text-xs text-gray-500 mt-4">
        Bạn đã có tài khoản?{" "}
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
