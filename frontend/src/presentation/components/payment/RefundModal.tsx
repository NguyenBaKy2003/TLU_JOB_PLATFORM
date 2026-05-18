import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface Props {
  paymentId: string;
  onClose:   () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function RefundModal({ paymentId, onClose, onConfirm }: Props) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6
        flex flex-col gap-5">

        <div className="flex items-center gap-2 text-purple-600">
          <RotateCcw size={20} />
          <h2 className="font-semibold text-base">Hoàn tiền giao dịch</h2>
        </div>

        <p className="text-[16px] text-gray-500">
          Giao dịch{" "}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            {paymentId}
          </code>{" "}
          sẽ được đánh dấu hoàn tiền. Hành động này không thể hoàn tác.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Lý do <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do hoàn tiền (bắt buộc)..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[16px]
              outline-none focus:border-purple-400 focus:ring-2
              focus:ring-purple-100 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[16px] rounded-xl border border-gray-200
              text-gray-600 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="px-4 py-2 text-[16px] rounded-xl bg-purple-600 text-white
              font-medium hover:bg-purple-700 disabled:opacity-40
              disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
          </button>
        </div>
      </div>
    </div>
  );
}