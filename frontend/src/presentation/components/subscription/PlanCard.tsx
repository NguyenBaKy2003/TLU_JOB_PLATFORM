// src/presentation/components/subscription/PlanCard.tsx
"use client";
import { Check, Zap } from "lucide-react";
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";
import { PLAN_HIGHLIGHTS, PLAN_BADGE } from "@/domain/models/CompanySubscription";

interface Props {
  plan:        SubscriptionPlan;
  yearly:      boolean;
  selected:    boolean;
  current:     boolean;
  onSelect:    () => void;
  formatPrice: (n: number) => string;
  discount:    number;
}

export function PlanCard({
  plan, yearly, selected, current, onSelect, formatPrice, discount,
}: Props) {
  const badge     = PLAN_BADGE[plan.code];
  const price     = yearly ? plan.priceYearly : plan.priceMonthly;
  const highlights= PLAN_HIGHLIGHTS[plan.code] ?? [];
  const isFree    = plan.priceMonthly === 0;

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col rounded-2xl border-2 p-6 cursor-pointer transition-all
        ${selected
          ? "border-blue-600 bg-blue-50/30 shadow-md"
          : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
        }`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1
          text-[11px] font-bold rounded-full ${badge.cls}`}>
          {badge.label}
        </div>
      )}

      {/* Current plan indicator */}
      {current && (
        <div className="absolute -top-3 right-4 px-3 py-1 text-[11px] font-bold
          bg-green-600 text-white rounded-full">
          Đang dùng
        </div>
      )}

      {/* Plan name */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          {plan.code === "PRO" && <Zap size={16} className="text-blue-600 fill-blue-100" />}
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
              <p className="text-3xl font-bold text-gray-900">{formatPrice(price)}</p>
              <span className="text-xs text-gray-400">/{yearly ? "năm" : "tháng"}</span>
            </div>
            {yearly && discount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                Tiết kiệm {discount}% so với tháng
              </p>
            )}
            {yearly && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                ~ {formatPrice(Math.round(price / 12))}/tháng
              </p>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2 flex-1 mb-6">
        {highlights.map(feat => (
          <div key={feat} className="flex items-start gap-2">
            <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-700">{feat}</span>
          </div>
        ))}
      </div>

      {/* Select indicator */}
      <div className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center
        transition-colors ${
          selected
            ? "bg-blue-600 text-white"
            : current
              ? "bg-gray-100 text-gray-500 cursor-default"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}>
        {current ? "Gói hiện tại" : selected ? "✓ Đã chọn" : "Chọn gói này"}
      </div>
    </div>
  );
}