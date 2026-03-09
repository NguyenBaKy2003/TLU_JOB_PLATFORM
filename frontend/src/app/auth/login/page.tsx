"use client";

import { useState, useEffect, type FormEvent } from "react";
import { getOAuth2Url, loginWithEmail, registerWithEmail, TokenStorage } from "../../../lib/auth.utils"
import type { UserRole } from "../../../types/auth.types";

// ─── SVG Icons ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────
type Tab = "login" | "register";
type LoadingState = null | "google" | "facebook" | "submit";

// ─── Page Component ───────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab]               = useState<Tab>("login");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState<LoadingState>(null);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [mounted, setMounted]       = useState(false);

  // Form fields
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [fullName, setFullName]     = useState("");
  const [role, setRole]             = useState<UserRole>("CANDIDATE");

  // Handle OAuth2 callback params on mount
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get("error");
    if (errParam) {
      setError(
        errParam === "ACCOUNT_LOCKED"
          ? "Tài khoản đã bị khóa. Vui lòng liên hệ support."
          : "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại."
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const resetMessages = () => { setError(""); setSuccess(""); };

  // ── OAuth2 ────────────────────────────────────────────────
  const handleOAuth = async (provider: "google" | "facebook") => {
    resetMessages();
    setLoading(provider);
    const url = await getOAuth2Url(provider);
    if (url) {
      window.location.href = url;
    } else {
      setError(`Không thể kết nối với ${provider}. Vui lòng thử lại.`);
      setLoading(null);
    }
  };

  // ── Email/Password ────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading("submit");

    try {
      if (tab === "login") {
        const res = await loginWithEmail({ email, password });
        if (!res.success || !res.data) {
          setError(res.message ?? "Email hoặc mật khẩu không đúng.");
        } else {
          TokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
          setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
          setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
        }
      } else {
        const res = await registerWithEmail({ email, password, fullName, role });
        if (!res.success) {
          setError(res.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
        } else {
          setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
          setTab("login");
          setPassword("");
          setFullName("");
        }
      }
    } catch {
      setError("Lỗi kết nối tới server. Vui lòng thử lại.");
    } finally {
      setLoading(null);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#060a14] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-rose-600/8 blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl p-8 z-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/30">
              J
            </div>
            <span className="text-white font-semibold tracking-tight text-[15px]">JobPlatform</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {tab === "login"
              ? "Chào mừng trở lại. Vui lòng đăng nhập."
              : "Bắt đầu hành trình sự nghiệp của bạn."}
          </p>
        </header>

        {/* OAuth2 Buttons */}
        <div className="space-y-2.5 mb-6">
          <OAuthButton
            provider="google"
            label="Tiếp tục với Google"
            icon={<GoogleIcon />}
            loading={loading}
            onClick={() => handleOAuth("google")}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
          />
          <OAuthButton
            provider="facebook"
            label="Tiếp tục với Facebook"
            icon={<FacebookIcon />}
            loading={loading}
            onClick={() => handleOAuth("facebook")}
            className="bg-[#1877F2] hover:bg-[#166fe5] text-white border border-blue-600/20"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-white/25 text-xs tracking-widest uppercase">hoặc</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 mb-6">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); resetMessages(); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {tab === "register" && (
            <Field label="Họ và tên">
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Email">
            <input
              type="email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Mật khẩu">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder={tab === "register" ? "Tối thiểu 8 ký tự" : "••••••••"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </Field>

          {tab === "register" && (
            <Field label="Bạn là">
              <div className="grid grid-cols-2 gap-2">
                {(["CANDIDATE", "EMPLOYER"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      role === r
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10"
                        : "bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/15"
                    }`}
                  >
                    {r === "CANDIDATE" ? "🎯 Ứng viên" : "🏢 Nhà tuyển dụng"}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Messages */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-300 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300 text-sm">
              <span className="mt-0.5 shrink-0">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!!loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 mt-1"
          >
            {loading === "submit" && <Spinner />}
            {tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

        {/* Forgot password */}
        {tab === "login" && (
          <p className="text-center mt-4">
            <a href="/auth/forgot-password" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Quên mật khẩu?
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/50 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function OAuthButton({
  provider, label, icon, loading, onClick, className,
}: {
  provider: "google" | "facebook";
  label: string;
  icon: React.ReactNode;
  loading: LoadingState;
  onClick: () => void;
  className: string;
}) {
  const isLoading = loading === provider;
  const isDisabled = !!loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${className}`}
    >
      {isLoading ? <Spinner /> : icon}
      {isLoading ? "Đang chuyển hướng..." : label}
    </button>
  );
}

// ─── Shared styles ─────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200";