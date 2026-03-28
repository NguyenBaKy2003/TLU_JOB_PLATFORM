// src/presentation/components/settings/DeleteAccountSection.tsx
"use client";
import { useState }        from "react";
import { Trash2 }          from "lucide-react";
import { SectionCard }     from "./SectionCard";
import { SettingsModal }   from "./SettingsModal";
import { useToast }        from "@/presentation/components/ui/toast";

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

const CONFIRM_PHRASE = "XÓA TÀI KHOẢN";

export function DeleteAccountSection() {
  const toast = useToast();
  const [showModal,  setShowModal]  = useState(false);
  const [confirmTxt, setConfirmTxt] = useState("");

  const handleDelete = async () => {
    if (confirmTxt !== CONFIRM_PHRASE) { toast.error("Lỗi", "Vui lòng nhập đúng cụm từ xác nhận."); return; }
    // TODO: call service.deleteAccount()
    toast.error("Đã xóa tài khoản", "Tài khoản của bạn đã bị xóa.");
  };

  return (
    <>
      <SectionCard icon={<Trash2 size={16} />} title="Xóa tài khoản">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Chúng tôi rất tiếc khi bạn rời đi. Lưu ý rằng hành động này{" "}
            <span className="font-medium text-gray-700">không thể hoàn tác</span>.
          </p>
          <button onClick={() => setShowModal(true)}
            className="shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
            Xóa tài khoản
          </button>
        </div>
      </SectionCard>

      {showModal && (
        <SettingsModal title="Xóa tài khoản" onClose={() => { setShowModal(false); setConfirmTxt(""); }}>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Hành động không thể hoàn tác</p>
              <p className="text-xs text-red-500 leading-relaxed">
                Tất cả dữ liệu, hồ sơ và lịch sử ứng tuyển sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">
                Nhập <span className="font-bold text-gray-800">{CONFIRM_PHRASE}</span> để xác nhận
              </label>
              <input value={confirmTxt} onChange={e => setConfirmTxt(e.target.value)}
                placeholder={CONFIRM_PHRASE} className={inputCls} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowModal(false); setConfirmTxt(""); }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
              <button onClick={handleDelete} disabled={confirmTxt !== CONFIRM_PHRASE}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Xóa tài khoản
              </button>
            </div>
          </div>
        </SettingsModal>
      )}
    </>
  );
}