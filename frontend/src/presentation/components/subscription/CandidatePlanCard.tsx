"use client";
import { Check, Sparkles, Lock } from "lucide-react";
import type { CandidateSubscriptionPlan } from "@/domain/models/CandidateSubscription";

// ── Plan metadata ─────────────────────────────────────────────────────────────

export const CANDIDATE_PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  PREMIUM: {
    label: "Phổ biến nhất",
    cls: "bg-violet-600 text-white shadow-sm shadow-violet-200",
  },
  PRO: {
    label: "Tốt nhất",
    cls: "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm",
  },
};

export const CANDIDATE_PLAN_HIGHLIGHTS: Record<string, string[]> = {
  FREE_CANDIDATE: [
    "Ứng tuyển tối đa 5 vị trí/tháng",
    "Xem tin tuyển dụng không giới hạn",
    "Tạo 1 CV cơ bản (template thường)",
    "Không có tính năng AI",
  ],
  PRO: [
    "Ứng tuyển không giới hạn",
    "CV Boost — đẩy hồ sơ lên đầu (3 lần/tháng)",
    "Tạo tối đa 5 CV online",
    "Dùng template premium",
  ],
  PREMIUM: [
    "Tất cả tính năng PRO",
    "Ứng tuyển & CV Boost không giới hạn",
    "AI viết & tối ưu CV theo JD",
    "Tạo CV không giới hạn",
    "Toàn bộ template premium",
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  plan:        CandidateSubscriptionPlan;
  yearly:      boolean;
  selected:    boolean;
  current:     boolean;
  onSelect:    () => void;
  formatPrice: (n: number) => string;
  discount:    number;
}

export function CandidatePlanCard({
  plan, yearly, selected, current, onSelect, formatPrice, discount,
}: Props) {
  const badge      = CANDIDATE_PLAN_BADGE[plan.code];
  const price      = yearly ? plan.priceYearly : plan.priceMonthly;
  const highlights = CANDIDATE_PLAN_HIGHLIGHTS[plan.code] ?? [];
  const isFree     = plan.free;
  const isPremium  = plan.code === "PREMIUM";

  // Gói free không cho phép chọn (đây là gói mặc định, không cần thanh toán)
  const handleClick = () => {
    if (isFree) return;
    onSelect();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all
        ${isFree
          ? "cursor-default border-gray-100 bg-gray-50/60 opacity-80"
          : selected
            ? "cursor-pointer border-violet-600 bg-violet-50/30 shadow-md"
            : isPremium
              ? "cursor-pointer border-violet-200 bg-white hover:border-violet-400 hover:shadow-sm"
              : "cursor-pointer border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm"
        }`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1
          text-[11px] font-bold rounded-full whitespace-nowrap ${badge.cls}`}>
          {badge.label}
        </div>
      )}

      {/* Current plan indicator */}
      {current && (
        <div className="absolute -top-3 right-4 px-3 py-1 text-[11px] font-bold
          bg-emerald-600 text-white rounded-full">
          Đang dùng
        </div>
      )}

      {/* Plan name */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          {isPremium && <Sparkles size={15} className="text-violet-600 fill-violet-100" />}
          <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
        </div>
        {plan.description && (
          <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-5">
        {isFree ? (
          <p className="text-3xl font-bold text-gray-900">Miễn phí</p>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-gray-900">
                {price != null ? formatPrice(price) : "—"}
              </p>
              <span className="text-xs text-gray-400">/{yearly ? "năm" : "tháng"}</span>
            </div>
            {yearly && discount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                Tiết kiệm {discount}% so với tháng
              </p>
            )}
            {yearly && price != null && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                ~ {formatPrice(Math.round(price / 12))}/tháng
              </p>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2 flex-1 mb-6">
        {highlights.map((feat) => (
          <div key={feat} className="flex items-start gap-2">
            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-700">{feat}</span>
          </div>
        ))}
        {plan.aiCvWriter && !highlights.some((h) => h.includes("AI")) && (
          <div className="flex items-start gap-2">
            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-700">AI viết CV</span>
          </div>
        )}
        {plan.premiumTemplateAccess && !highlights.some((h) => h.includes("template")) && (
          <div className="flex items-start gap-2">
            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-700">Template premium</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        className={`w-full py-2.5 rounded-xl text-[16px] font-semibold text-center transition-colors
          flex items-center justify-center gap-1.5
          ${isFree
            ? "bg-gray-100 text-gray-400 cursor-default"
            : selected
              ? "bg-violet-600 text-white"
              : current
                ? "bg-gray-100 text-gray-500 cursor-default"
                : isPremium
                  ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
      >
        {isFree ? (
          <>
            <Lock size={13} />
            Gói mặc định
          </>
        ) : current ? (
          "Gói hiện tại"
        ) : selected ? (
          "✓ Đã chọn"
        ) : (
          "Chọn gói này"
        )}
      </div>
    </div>
  );
}