// src/presentation/components/admin/subscription/PlanTable.tsx
"use client";
import { Pencil, Power, Infinity, CheckCircle2, XCircle } from "lucide-react";
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";

// ── Cells ──

function LimitCell({ value }: { value: number }) {
  return value === -1
    ? <span className="flex items-center gap-1 text-blue-600 font-semibold text-[16px]">
        <Infinity size={14} /> Unlimited
      </span>
    : <span className="text-[16px] font-semibold text-gray-800">{value.toLocaleString()}</span>;
}

function FeatureIcon({ enabled }: { enabled: boolean }) {
  return enabled
    ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
    : <XCircle      size={16} className="text-gray-300 mx-auto" />;
}

// ── Row ────

function PlanRow({ plan, onEdit, onToggle, formatPrice, toggling }: {
  plan:        SubscriptionPlan;
  onEdit:      () => void;
  onToggle:    () => void;
  formatPrice: (n: number) => string;
  toggling:    boolean;
}) {
  return (
    <tr className={`border-b border-gray-50 transition-colors ${
      plan.active
        ? "hover:bg-gray-50/60"
        : "opacity-50 bg-gray-50/40 hover:bg-gray-100/60"
    }`}>
      {/* Plan name */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
              {plan.code}
            </span>
            {!plan.active && (
              <span className="text-[10px] text-red-500 bg-red-50 border border-red-200
                px-1.5 py-0.5 rounded-full font-semibold">Tắt</span>
            )}
          </div>
          <p className="text-[16px] font-semibold text-gray-900">{plan.name}</p>
          {plan.description && (
            <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{plan.description}</p>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="px-5 py-4">
        <p className="text-[16px] font-semibold text-gray-900">
          {formatPrice(plan.priceMonthly)}
          <span className="text-gray-400 font-normal text-[11px]">/tháng</span>
        </p>
        <p className="text-xs text-gray-500">
          {formatPrice(plan.priceYearly)}
          <span className="text-gray-400">/năm</span>
        </p>
      </td>

      {/* Duration */}
      <td className="px-5 py-4 text-[16px] text-gray-700">{plan.durationDays} ngày</td>

      {/* Quotas */}
      <td className="px-5 py-4"><LimitCell value={plan.jobPostLimit}     /></td>
      <td className="px-5 py-4"><LimitCell value={plan.featuredJobLimit} /></td>
      <td className="px-5 py-4"><LimitCell value={plan.cvViewLimit}      /></td>

      {/* Features */}
      <td className="px-5 py-4 text-center"><FeatureIcon enabled={plan.aiFeatures}      /></td>
      <td className="px-5 py-4 text-center"><FeatureIcon enabled={plan.analyticsAccess} /></td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50
              rounded-lg transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={onToggle} disabled={toggling}
            title={plan.active ? "Tắt gói" : "Bật gói"}
            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
              plan.active
                ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
            }`}>
            {toggling
              ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600
                  rounded-full animate-spin block" />
              : <Power size={14} />
            }
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Table ──

interface Props {
  plans:       SubscriptionPlan[];
  togglingId:  string | null;
  onEdit:      (plan: SubscriptionPlan) => void;
  onToggle:    (plan: SubscriptionPlan) => void;
  formatPrice: (n: number) => string;
}

export function PlanTable({ plans, togglingId, onEdit, onToggle, formatPrice }: Props) {
  const HEADERS = [
    "Gói", "Giá", "Thời hạn",
    "Tin đăng", "Tin nổi bật", "Xem CV",
    "AI", "Analytics", "",
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-50">
              {HEADERS.map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold
                  text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-[16px] text-gray-400">
                  Chưa có gói nào
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  onEdit={() => onEdit(plan)}
                  onToggle={() => onToggle(plan)}
                  formatPrice={formatPrice}
                  toggling={togglingId === plan.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}