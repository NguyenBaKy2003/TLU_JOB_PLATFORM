import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface Props {
  title:       string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm:   (reason: string) => Promise<void>;
  onClose:     () => void;
}

export function ReasonModal({
  title, description, placeholder, confirmLabel, confirmClass, onConfirm, onClose,
}: Props) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md
        flex flex-col gap-5 p-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-[16px] text-gray-500 mt-0.5">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Lý do *</label>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); setError(""); }}
            placeholder={placeholder}
            rows={4}
            className={`w-full rounded-xl border px-3.5 py-3 text-[16px] resize-none
              outline-none transition-colors
              ${error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              }`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-[16px] font-medium text-gray-600
              hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className={`px-4 py-2 rounded-xl text-[16px] font-medium text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${confirmClass}`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}