// src/presentation/components/auth/employer/EmployerInfoStep.tsx
// Tái sử dụng hoàn toàn RegisterInfoStep — chỉ đổi link redirect
"use client";
import { useState }        from "react";
import Link                from "next/link";
import {
  FormInput, PasswordInput, Divider,
  GoogleButton, SubmitButton,
} from "@/presentation/components/common/auth-ui";
import { AuthService }    from "@/application/services/AuthService";
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { useToast }       from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

const INIT = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

interface Props {
  onNext:         (email: string) => void;
  onGoogleLogin?: () => void;
  oauthLoading?:  boolean;
}

export function EmployerInfoStep({ onNext, onGoogleLogin, oauthLoading = false }: Props) {
  const toast = useToast();
  const [form,    setForm]    = useState(INIT);
  const [errors,  setErrors]  = useState<Partial<typeof INIT>>({});
  const [loading, setLoading] = useState(false);

  const set = (f: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof INIT> = {};
    if (!form.firstName.trim())  e.firstName = "Vui lòng nhập tên";
    if (!form.lastName.trim())   e.lastName  = "Vui lòng nhập họ";
    if (!form.email.trim())      e.email     = "Vui lòng nhập email";
    if (form.password.length < 8) e.password = "Mật khẩu ít nhất 8 ký tự";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await authService.signup({ email: form.email, password: form.password, fullName, role: "EMPLOYER" });
      toast.success("Đăng ký thành công!", "Vui lòng xác thực email để tiếp tục.");
      onNext(form.email);
    } catch (err: any) {
      toast.error("Đăng ký thất bại", err?.response?.data?.message ?? "Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  const busy = loading || oauthLoading;

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="CareerUp" className="h-16 w-36 mx-auto" /></Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Cung cấp thông tin</h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Vui lòng nhập thông tin cá nhân để thiết lập tài khoản<br />và cá nhân hóa trải nghiệm của bạn
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput label="Tên"              placeholder="Nhập tên"                  value={form.firstName}       onChange={set("firstName")}       error={errors.firstName} />
        <FormInput label="Họ"               placeholder="Nhập họ"                   value={form.lastName}        onChange={set("lastName")}        error={errors.lastName} />
        <FormInput label="Địa chỉ Email" type="email" placeholder="Nhập địa chỉ Email" value={form.email}       onChange={set("email")}           error={errors.email} />
        <PasswordInput label="Mật khẩu"     placeholder="Nhập mật khẩu"             value={form.password}        onChange={set("password")}        error={errors.password} />
        <PasswordInput label="Xác nhận mật khẩu" placeholder="Xác nhận mật khẩu của bạn" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
        <SubmitButton loading={loading} disabled={busy}>Đăng Ký</SubmitButton>
      </form>

      <Divider />
      <GoogleButton onClick={onGoogleLogin} loading={oauthLoading} disabled={busy} />

      <p className="text-center text-xs text-gray-500 mt-4">
        Bạn đã có tài khoản?{" "}
        <Link href="/auth/employer/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
      </p>
    </div>
  );
}