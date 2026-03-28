// src/presentation/components/settings/AccountSection.tsx
"use client";
import { useState }          from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { SectionCard }       from "./SectionCard";
import { SettingsModal }     from "./SettingsModal";
import { useToast }          from "@/presentation/components/ui/toast";

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

interface Props { email: string; }

export function AccountSection({ email }: Props) {
  const toast = useToast();

  const [showEmail,    setShowEmail]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPw,       setShowPw]       = useState(false);

  const [newEmail,     setNewEmail]     = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");

  const handleChangeEmail = async () => {
    if (newEmail !== confirmEmail) { toast.error("Lỗi", "Email xác nhận không khớp."); return; }
    // TODO: call service.changeEmail(newEmail)
    setShowEmail(false); setNewEmail(""); setConfirmEmail("");
    toast.success("Đã gửi xác nhận", "Kiểm tra hộp thư để xác nhận email mới.");
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error("Lỗi", "Mật khẩu xác nhận không khớp."); return; }
    if (newPw.length < 8) { toast.error("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự."); return; }
    // TODO: call service.changePassword(currentPw, newPw)
    setShowPassword(false); setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Đã đổi mật khẩu", "Mật khẩu mới đã được lưu thành công.");
  };

  return (
    <>
      <SectionCard icon={<Shield size={16} />} title="Tài khoản">
        <div className="flex flex-col divide-y divide-gray-50 -my-1">
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Địa chỉ Email</p>
              <p className="text-sm font-medium text-gray-800 truncate">{email}</p>
            </div>
            <button onClick={() => setShowEmail(true)}
              className="shrink-0 px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Đổi Email
            </button>
          </div>
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Mật khẩu</p>
              <p className="text-sm font-medium text-gray-800 tracking-widest">{"•".repeat(15)}</p>
            </div>
            <button onClick={() => setShowPassword(true)}
              className="shrink-0 px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </SectionCard>

      {showEmail && (
        <SettingsModal title="Đổi địa chỉ Email" onClose={() => setShowEmail(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email hiện tại</label>
              <input value={email} disabled className={inputCls + " opacity-60"} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email mới</label>
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Xác nhận email mới</label>
              <input value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowEmail(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
              <button onClick={handleChangeEmail} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">Xác nhận</button>
            </div>
          </div>
        </SettingsModal>
      )}

      {showPassword && (
        <SettingsModal title="Đổi mật khẩu" onClose={() => setShowPassword(false)}>
          <div className="flex flex-col gap-4">
            {[
              { label: "Mật khẩu hiện tại", val: currentPw, set: setCurrentPw, ph: "••••••••" },
              { label: "Mật khẩu mới",      val: newPw,     set: setNewPw,     ph: "Ít nhất 8 ký tự" },
              { label: "Xác nhận mật khẩu", val: confirmPw, set: setConfirmPw, ph: "Nhập lại mật khẩu mới" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={val}
                    onChange={e => set(e.target.value)} placeholder={ph}
                    className={inputCls + " pr-10"} />
                  <button onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowPassword(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
              <button onClick={handleChangePassword} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">Đổi mật khẩu</button>
            </div>
          </div>
        </SettingsModal>
      )}
    </>
  );
}