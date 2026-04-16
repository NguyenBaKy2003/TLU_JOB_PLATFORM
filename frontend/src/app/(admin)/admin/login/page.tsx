"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter }                        from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AuthService }                      from "@/application/services/AuthService";
import { AuthRepository }                   from "@/infrastructure/repositories/AuthRepository";
import { useAdminAuth }                     from "@/application/contexts/AdminAuthContext";
import { extractErrorMessage }              from "@/lib/extractErrorMessage";
import { useToast }                           from "@/presentation/components/ui/toast";

const authService = new AuthService(new AuthRepository());

// ── FormInput ──────────────────────────────────────────────────────────────────

function FormInput({
  label, error, rightElement, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string; rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <div className={`relative border rounded-xl px-3 pt-3 pb-2 transition-all
        ${error
          ? "border-red-400 bg-red-50"
          : "border-gray-300 focus-within:border-red-500"}`}>
        <label className={`absolute -top-2.5 left-3 bg-white px-1 text-sm leading-none
          ${error ? "text-red-500" : "text-gray-800"}`}>
          {label}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...props}
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400
              outline-none pr-8"
          />
          {rightElement && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-[11px] mt-1 ml-1 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────

function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router                                         = useRouter();
  const { adminUser, adminLoading, setAdminFromToken } = useAdminAuth();
    const toast                                            = useToast();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);
  useEffect(() => {
    if (adminLoading || adminUser === undefined) return;
    if (adminUser?.role === "ADMIN") router.replace("/admin/dashboard");
  }, [adminUser, adminLoading, router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())    e.email    = "Vui lòng nhập email";
    if (!password.trim()) e.password = "Vui lòng nhập mật khẩu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const token = await authService.login({ email, password, portalType: "ADMIN" });

      setAdminFromToken(token.user, token.accessToken, token.refreshToken);
      toast.success("Đăng nhập thành công!", "Chào mừng bạn trở lại Joblin!");
      router.replace("/admin/dashboard");
    } catch (e:any) {
      toast.error(
        "Đăng nhập thất bại",
        e?.response?.data?.message ?? "Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
    }
  }, [email, password, router, setAdminFromToken]);

  // Spinner khi AdminAuthContext đang verify token
  if (adminLoading || adminUser === undefined) return <FullPageSpinner />;

  // adminUser === null → chưa login → hiện form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center
            mx-auto mb-4 shadow-lg shadow-red-200">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Joblin Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập vào trang quản trị</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {apiError && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100
              rounded-xl mb-5 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormInput
              label="Địa chỉ Email"
              type="email"
              placeholder="admin@joblin.vn"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setErrors(p => ({ ...p, email: undefined }));
                setApiError(null);
              }}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <FormInput
              label="Mật khẩu"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setErrors(p => ({ ...p, password: undefined }));
                setApiError(null);
              }}
              error={errors.password}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600
                text-white text-sm font-semibold rounded-xl hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                shadow-sm shadow-red-200"
            >
              {busy && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white
                  rounded-full animate-spin" />
              )}
              {busy ? "Đang xác thực..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        {/* Security note */}
        <p className="text-center text-[11px] text-gray-400 mt-4
          flex items-center justify-center gap-1.5">
          <Shield size={11} className="text-gray-400" />
          Khu vực chỉ dành cho quản trị viên được ủy quyền
        </p>

      </div>
    </div>
  );
}