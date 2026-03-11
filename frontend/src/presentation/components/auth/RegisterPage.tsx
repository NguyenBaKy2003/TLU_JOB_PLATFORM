"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FormInput,
  PasswordInput,
  StepBar,
  Divider,
  GoogleButton,
  SubmitButton,
} from "@/presentation/components/common/auth-ui";
import {
  validateRegisterForm,
  filterErrors,
  hasErrors,
} from "@/lib/validation";

const STEPS = ["Thông tin", "Xác thực", "Hồ sơ", "Hoàn tất"];
const OTP_LEN = 6;
const MAX_MB = 10;
const INIT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// ── Step 1: Info ───────────────────────────────────────────────
function RegisterInfoForm({
  onNext,
  onGoogleLogin,
}: {
  onNext: (data: typeof INIT_FORM) => void;
  onGoogleLogin?: () => void;
}) {
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
    if (hasErrors(errs)) { setErrors(errs); return; }
    setLoading(true);
    try {
      // TODO: await authService.register(form)
      await new Promise((r) => setTimeout(r, 800));
      onNext(form);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="Job" className="h-16 w-auto mx-auto" /></Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Cung cấp thông tin</h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Vui lòng nhập thông tin cá nhân để thiết lập tài khoản<br />
        và cá nhân hóa trải nghiệm của bạn
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput label="Tên" placeholder="Nhập tên"
          value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
        <FormInput label="Họ" placeholder="Nhập họ"
          value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        <FormInput label="Địa chỉ Email" type="email" placeholder="Nhập địa chỉ Email"
          value={form.email} onChange={set("email")} error={errors.email} />
        <PasswordInput label="Mật khẩu" placeholder="Nhập mật khẩu"
          value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordInput label="Xác nhận mật khẩu" placeholder="Xác nhận mật khẩu của bạn"
          value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
        <SubmitButton loading={loading}>Đăng Ký</SubmitButton>
      </form>
      <Divider />
      <GoogleButton onClick={onGoogleLogin} />
      <p className="text-center text-xs text-gray-500 mt-4">
        Bạn đã có tài khoản?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
      </p>
    </div>
  );
}

// ── Step 2: OTP ────────────────────────────────────────────────
function OtpVerifyForm({
  email, onVerified, onBack,
}: { email: string; onVerified: () => void; onBack: () => void }) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCd, setResendCd] = useState(0);

  const startCountdown = () => {
    setResendCd(60);
    const t = setInterval(() =>
      setResendCd((v) => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next); setError("");
    if (val && i < OTP_LEN - 1) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (pasted.length === OTP_LEN) {
      setOtp(pasted.split(""));
      document.getElementById(`otp-${OTP_LEN - 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < OTP_LEN) { setError("Vui lòng nhập đủ mã OTP"); return; }
    setLoading(true);
    try {
      // TODO: await authService.verifyOtp(email, otp.join(""))
      await new Promise((r) => setTimeout(r, 800));
      onVerified();
    } catch {
      setError("Mã OTP không chính xác. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="Job" className="h-10 w-auto mx-auto" /></Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Xác Thực Địa Chỉ Email</h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Đã gửi mã xác thực tới{" "}
        <span className="font-medium text-gray-700">{email}</span>.<br />
        Vui lòng nhập mã để xác thực tài khoản.
      </p>
      <form onSubmit={handleVerify}>
        <div className="flex gap-2 justify-center mb-1" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input key={i} id={`otp-${i}`}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-11 text-center text-lg font-bold border rounded-lg outline-none transition-all
                ${digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300"}
                ${error ? "border-red-400 bg-red-50" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
              `}
            />
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-400 mb-1">{filled}/{OTP_LEN} ký tự</p>
        {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
        <p className="text-center text-xs text-gray-500 mb-4">
          Mã hết hạn sau 10 phút.{" "}
          {resendCd > 0
            ? <span className="text-gray-400">Gửi lại sau {resendCd}s</span>
            : <button type="button" onClick={startCountdown}
                className="text-blue-600 hover:underline font-medium">Gửi lại</button>
          }
        </p>
        <SubmitButton loading={loading} disabled={filled < OTP_LEN}>Xác Thực</SubmitButton>
      </form>
      <p className="text-center text-xs text-gray-500 mt-4">
        Nhập sai email?{" "}
        <button onClick={onBack} className="text-blue-600 hover:underline font-medium">Quay lại</button>
      </p>
    </div>
  );
}

// ── Step 3: Upload CV ──────────────────────────────────────────
function UploadCvStep({
  onComplete,
  onSkip,
}: {
  onComplete: (file: File | null) => void;
  onSkip: () => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): boolean => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File quá lớn. Tối đa ${MAX_MB}MB.`); return false;
    }
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setError("Chỉ chấp nhận PDF, DOC, DOCX."); return false;
    }
    setError(""); return true;
  };

  const pick = (f: File) => { if (validateFile(f)) setFile(f); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) pick(f);
  }, []);

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      // TODO: await authService.uploadCv(file)
      await new Promise((r) => setTimeout(r, 800));
      onComplete(file);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="Job" className="h-12 w-auto mx-auto" /></Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Tải lên hồ sơ của bạn</h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Tải lên CV của bạn để tìm kiếm các cơ hội việc làm<br />
        phù hợp nhất với kinh nghiệm của bạn.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800">Tải lên CV</span>
          <a href="#" className="text-[11px] text-blue-600 hover:underline">
            Bạn có thể điền mẫu hồ sơ rảng tại đây.
          </a>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={[
            "relative border-2 border-dashed rounded-xl",
            "flex flex-col items-center justify-center gap-2",
            "cursor-pointer transition-all select-none min-h-[120px] p-5",
            error    ? "border-red-400 bg-red-50"       :
            dragging  ? "border-blue-500 bg-blue-50"     :
            file      ? "border-blue-400 bg-blue-50/60"  :
                        "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          ].join(" ")}
        >
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }}
            className="hidden"
          />

          {file ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800 max-w-[200px] truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
              </div>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setError(""); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Kéo & Thả hoặc chọn tập<br />
                <span className="text-gray-400">(Định dạng PDF, tối đa {MAX_MB} MB)</span>
              </p>
            </>
          )}
        </div>

        {error && <p className="text-red-500 text-[11px] mt-1.5 text-center">{error}</p>}

        {/* Outline pick button */}
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full mt-3 py-2.5 border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
          Tải lên CV
        </button>

        {/* Primary submit */}
        <div className="mt-3">
          <SubmitButton loading={loading} disabled={!file}>Hoàn Tất</SubmitButton>
        </div>
      </form>

      <button type="button" onClick={onSkip}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors">
        Bỏ qua
      </button>
    </div>
  );
}

// ── Step 4: Success ────────────────────────────────────────────
function SuccessStep() {
  return (
    <div className="w-full max-w-[300px] mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tài khoản của bạn đã được xác thực.<br />Hãy đăng nhập để bắt đầu.
      </p>
      <Link href="/auth/login"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded text-sm font-semibold transition-colors text-center">
        Đăng nhập ngay
      </Link>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export function RegisterPage({ onGoogleLogin }: { onGoogleLogin?: () => void }) {
  const [step, setStep]   = useState(0);
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <StepBar steps={STEPS} current={step} />

      {step === 0 && (
        <RegisterInfoForm
          onGoogleLogin={onGoogleLogin}
          onNext={(data) => { setEmail(data.email); setStep(1); }}
        />
      )}
      {step === 1 && (
        <OtpVerifyForm
          email={email}
          onVerified={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <UploadCvStep
          onComplete={() => setStep(3)}
          onSkip={() => setStep(3)}
        />
      )}
      {step === 3 && <SuccessStep />}
    </div>
  );
}