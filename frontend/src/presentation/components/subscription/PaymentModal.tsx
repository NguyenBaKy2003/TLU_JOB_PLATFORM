"use client";
import { useState }        from "react";
import { Shield, ChevronRight, X, CheckCircle2 } from "lucide-react";
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";

// ── Gateway types ─────────────────────────────────────────────────────────────

export type PaymentGateway = "VNPAY" | "MOMO" | "ZALOPAY";

// ── Gateway logos ─────────────────────────────────────────────────────────────

function VNPayLogo() {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 rounded-lg">
      <span className="text-white font-black text-[15px] tracking-tight">VN</span>
      <span className="text-yellow-400 font-black text-[15px] tracking-tight">PAY</span>
    </div>
  );
}

function MoMoLogo() {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#ae2070]">
      <span className="text-white font-black text-[13px] tracking-tight">M</span>
    </div>
  );
}

function ZaloPayLogo() {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0068ff]">
      <span className="text-white font-black text-[11px] tracking-tight">Zalo</span>
    </div>
  );
}

// ── Gateway options config ────────────────────────────────────────────────────

interface GatewayOption {
  id:          PaymentGateway;
  label:       string;
  description: string;
  logo:        React.ReactNode;
  color:       string;        // border + bg accent color (Tailwind class fragment)
  textColor:   string;
}

const GATEWAYS: GatewayOption[] = [
  {
    id:          "VNPAY",
    label:       "VNPay",
    description: "Thẻ ATM, Visa, MasterCard, QR Code",
    logo:        <VNPayLogo />,
    color:       "border-blue-500 bg-blue-50/40",
    textColor:   "text-blue-600",
  },
  {
    id:          "MOMO",
    label:       "Ví MoMo",
    description: "Thanh toán qua ứng dụng MoMo",
    logo:        <MoMoLogo />,
    color:       "border-[#ae2070] bg-pink-50/40",
    textColor:   "text-[#ae2070]",
  },
  {
    id:          "ZALOPAY",
    label:       "ZaloPay",
    description: "Thanh toán qua ứng dụng ZaloPay",
    logo:        <ZaloPayLogo />,
    color:       "border-[#0068ff] bg-blue-50/30",
    textColor:   "text-[#0068ff]",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  plan:        SubscriptionPlan;
  yearly:      boolean;
  formatPrice: (n: number) => string;
  discount:    number;
  onConfirm:   (gateway: PaymentGateway) => Promise<void>;
  onCancel:    () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentModal({
  plan, yearly, formatPrice, discount, onConfirm, onCancel,
}: Props) {
  const [loading,         setLoading]         = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("VNPAY");

  const price = yearly ? plan.priceYearly : plan.priceMonthly;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(selectedGateway); }
    catch {}
    finally { setLoading(false); }
  };

  const active = GATEWAYS.find(g => g.id === selectedGateway)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[16px] font-semibold text-gray-800">Xác nhận thanh toán</h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
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
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-600">Gói dịch vụ</span>
                <span className="font-semibold text-gray-900">{plan.name}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-600">Chu kỳ</span>
                <span className="font-semibold text-gray-900">
                  {yearly ? "1 năm" : "1 tháng"}
                </span>
              </div>
              {yearly && discount > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold text-green-600">-{discount}%</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                <span className="text-[14px] font-semibold text-gray-800">Tổng thanh toán</span>
                <span className="text-base font-bold text-blue-600">{formatPrice(price)}</span>
              </div>
            </div>
          </div>

          {/* Gateway selector */}
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
              Phương thức thanh toán
            </p>
            <div className="flex flex-col gap-2">
              {GATEWAYS.map(gw => {
                const isSelected = selectedGateway === gw.id;
                return (
                  <button
                    key={gw.id}
                    onClick={() => setSelectedGateway(gw.id)}
                    className={`flex items-center gap-3 w-full text-left border-2 rounded-xl p-3.5
                      transition-all duration-150
                      ${isSelected ? gw.color : "border-gray-100 bg-white hover:border-gray-200"}`}
                  >
                    {/* Radio dot */}
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                      transition-colors
                      ${isSelected
                        ? "border-current bg-current " + gw.textColor
                        : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Logo */}
                    <div className="shrink-0">{gw.logo}</div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-semibold
                        ${isSelected ? gw.textColor : "text-gray-800"}`}>
                        {gw.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{gw.description}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 size={16} className={`shrink-0 ${gw.textColor}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-100 rounded-xl">
            <Shield size={14} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 leading-relaxed">
              Thanh toán được bảo mật bằng SSL 256-bit. Bạn sẽ được chuyển đến trang
              thanh toán <strong>{active.label}</strong> an toàn.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 text-[14px] font-medium text-gray-600 bg-gray-100
                rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px]
                font-semibold text-white rounded-xl disabled:opacity-50 transition-colors
                shadow-sm bg-blue-600 hover:bg-blue-700"
            >
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