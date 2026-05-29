// src/presentation/components/company/PlanBadge.tsx
"use client";

import type { CompanyPlanCode } from "@/domain/models/Company";
import { PLAN_BADGE_CONFIG, isPaidPlan } from "@/domain/models/Company";

interface Props {
  planCode: CompanyPlanCode | null | undefined;
  size?: "sm" | "md";
}

/**
 * Badge hiển thị plan tier của công ty.
 * Không render gì nếu plan là FREE hoặc null.
 *
 * Dùng trong CompanyCard, CompanyHeroCard, CompanyListItem, v.v.
 */
export function PlanBadge({ planCode, size = "sm" }: Props) {
  if (!isPaidPlan(planCode)) return null;

  const code = planCode as Exclude<CompanyPlanCode, "FREE_COMPANY">;
  const cfg  = PLAN_BADGE_CONFIG[code];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold
        ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}
        ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
}