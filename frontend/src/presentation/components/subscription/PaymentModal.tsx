// src/presentation/components/subscription/PaymentModal.tsx
"use client";
import { useState }             from "react";
import { Shield, 
         ChevronRight, X }      from "lucide-react";
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";

// VNPay logo inline SVG (simplified)
function VNPayLogo() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg">
      <span className="text-white font-black text-sm tracking-tight">VN</span>
      <span className="text-yellow-400 font-black text-sm tracking-tight">PAY</span>
    </div>
  );
}

interface Props {
  plan:        SubscriptionPlan;
  yearly:      boolean;
  formatPrice: (n: number) => string;
  discount:    number;
  onConfirm:   () => Promise<void>;
  onCancel:    () => void;
}

export function PaymentModal({ plan, yearly, formatPrice, discount, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const price = yearly ? plan.priceYearly : plan.priceMonthly;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); }
    catch {}
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Xác nhận thanh toán</h3>
          <button onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Order summary */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
              Chi tiết đơn hàng
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gói dịch vụ</span>
                <span className="font-semibold text-gray-900">{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chu kỳ</span>
                <span className="font-semibold text-gray-900">{yearly ? "1 năm" : "1 tháng"}</span>
              </div>
              {yearly && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold text-green-600">-{discount}%</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                <span className="text-sm font-semibold text-gray-800">Tổng thanh toán</span>
                <span className="text-base font-bold text-blue-600">{formatPrice(price)}</span>
              </div>
            </div>
          </div>

          {/* Payment method — VNPay only */}
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
              Phương thức thanh toán
            </p>
            <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50/40">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-600
                  flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <VNPayLogo />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">VNPay</p>
                  <p className="text-[11px] text-gray-500">
                    Thẻ ATM, Visa, MasterCard, QR Code
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-100 rounded-xl">
            <Shield size={14} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 leading-relaxed">
              Thanh toán được bảo mật bằng SSL 256-bit. Bạn sẽ được chuyển đến trang
              thanh toán VNPay an toàn.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100
                rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm
                font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700
                disabled:opacity-50 transition-colors shadow-sm">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ChevronRight size={16} />
              }
              {loading ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            Bằng cách thanh toán, bạn đồng ý với{" "}
            <a href="/terms" className="text-blue-500 hover:underline">Điều khoản dịch vụ</a>{" "}
            và{" "}
            <a href="/privacy" className="text-blue-500 hover:underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>
    </div>
  );
}