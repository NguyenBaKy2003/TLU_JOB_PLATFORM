// src/app/admin/setup/page.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter }                                from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAdminAuth }                             from '@/application/contexts/AdminAuthContext';
import { useToast }                                 from '@/presentation/components/ui/toast';
import { AdminSetupService }                        from '@/application/services/AdminSetupService';
import { AdminSetupRepository }                     from '@/infrastructure/repositories/AdminSetupRepository';
import { extractErrorMessage }                      from '@/lib/extractErrorMessage';

// ── FormInput ──────────────────────────────────────────────────────────────

function FormInput({
  label, error, rightElement, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string; rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <div className={`relative border rounded-xl px-3 pt-3 pb-2 transition-all
        ${error
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 focus-within:border-red-500'}`}>
        <label className={`absolute -top-2.5 left-3 bg-white px-1 text-[12px] leading-none
          ${error ? 'text-red-500' : 'text-gray-800'}`}>
          {label}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...props}
            className="w-full bg-transparent text-[14px] text-gray-700 placeholder-gray-400
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

// ── PasswordStrengthBar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const widths = ['0%', '25%', '50%', '75%', '100%'];
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-green-600'];
  const labels = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[score]}`}
          style={{ width: widths[score] }}
        />
      </div>
      <p className={`text-[11px] ml-1 ${
        score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-green-600'
      }`}>
        {labels[score]}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

// Module-scoped — không re-create mỗi render, giống pattern của AdminUsersPage
const setupService = new AdminSetupService(new AdminSetupRepository());

export default function AdminSetupPage() {
  const router                      = useRouter();
  const { adminUser, adminLoading } = useAdminAuth();
  const toast                       = useToast();
  const toastRef                    = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const [secret,   setSecret]   = useState('');
  const [email,    setEmail]    = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showSec,  setShowSec]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (!adminLoading && adminUser?.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [adminUser, adminLoading, router]);

  const clearFieldError = (key: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!secret.trim())   e.secret   = 'Vui lòng nhập Setup Secret Key';
    if (!email.trim())    e.email    = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                          e.email    = 'Email không hợp lệ';
    if (!fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!password)        e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 8)
                          e.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setBusy(true);
    try {
      const result = await setupService.setupAdmin({ secret, email, fullName, password });
      toastRef.current.success(
        'Tạo tài khoản thành công!',
        `Tài khoản "${result.fullName}" đã được tạo. Hãy thu hồi Setup Secret ngay.`,
      );
      router.replace('/admin/login');
    } catch (error) {
      const msg = extractErrorMessage(error, 'Vui lòng thử lại.');
      // Phân biệt lỗi secret sai vs lỗi khác để hiện field error đúng chỗ
      const isSecretError = (error as any)?.code === 'INVALID_SECRET';
      if (isSecretError) {
        setErrors(prev => ({ ...prev, secret: 'Setup Secret Key không hợp lệ' }));
        toastRef.current.error('Xác thực thất bại', msg);
      } else {
        toastRef.current.error('Tạo tài khoản thất bại', msg);
      }
    } finally {
      setBusy(false);
    }
  }, [secret, email, fullName, password, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center
            mx-auto mb-4 shadow-lg shadow-red-200">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Thiết lập tài khoản Admin</h1>
          <p className="text-[13px] text-gray-500 mt-1">Tạo tài khoản quản trị viên đầu tiên</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100
            rounded-xl text-[12px] text-amber-800">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <span>
              Endpoint này chỉ dùng <strong>một lần</strong>. Sau khi tạo xong,
              hãy thu hồi{' '}
              <code className="bg-amber-100 px-1 rounded">Setup Secret</code>{' '}
              hoặc vô hiệu hoá route.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Xác thực
            </p>

            <FormInput
              label="Setup Secret Key"
              type={showSec ? 'text' : 'password'}
              placeholder="sk-setup-••••••••"
              value={secret}
              autoComplete="off"
              onChange={e => { setSecret(e.target.value); clearFieldError('secret'); }}
              error={errors.secret}
              rightElement={
                <button type="button" onClick={() => setShowSec(v => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showSec ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            <hr className="border-gray-100" />

            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Thông tin tài khoản
            </p>

            <FormInput
              label="Email"
              type="email"
              placeholder="admin@careerUp.vn"
              value={email}
              autoComplete="email"
              onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
              error={errors.email}
            />

            <FormInput
              label="Họ tên"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              autoComplete="name"
              onChange={e => { setFullName(e.target.value); clearFieldError('fullName'); }}
              error={errors.fullName}
            />

            <div>
              <FormInput
                label="Mật khẩu"
                type={showPw ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                autoComplete="new-password"
                onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                error={errors.password}
                rightElement={
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <PasswordStrengthBar password={password} />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600
                text-white text-[14px] font-semibold rounded-xl hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                shadow-sm shadow-red-200"
            >
              {busy && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white
                  rounded-full animate-spin" />
              )}
              {busy ? 'Đang tạo...' : 'Tạo tài khoản Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4
          flex items-center justify-center gap-1.5">
          <Shield size={11} className="text-gray-400" />
          Khu vực chỉ dành cho quản trị viên được uỷ quyền
        </p>

      </div>
    </div>
  );
}