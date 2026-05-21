// D:\TLU_JOB_PLATFORM\frontend\src\application\services\AdminCandidatePlanService.ts

import type { IAdminCandidatePlanRepository } from "@/domain/repositories/IAdminCandidatePlanRepository";
import type {
  CandidateSubscriptionPlan,
  CandidatePlanPayload,
  CandidatePlanUpdatePayload,
} from "@/domain/models/CandidateSubscription";

export class AdminCandidatePlanService {
  constructor(private readonly repo: IAdminCandidatePlanRepository) {}

  // ── Plans ────────────

  /** Lấy tất cả plan (kể cả inactive) */
  getAllPlans(): Promise<CandidateSubscriptionPlan[]> {
    return this.repo.adminGetAllPlans();
  }

  /** Tạo plan mới */
  createPlan(payload: CandidatePlanPayload): Promise<CandidateSubscriptionPlan> {
    if (!payload.code?.trim()) throw new Error("Mã gói không được để trống");
    if (!payload.name?.trim()) throw new Error("Tên gói không được để trống");
    if (payload.priceMonthly < 0 || payload.priceYearly < 0) {
      throw new Error("Giá không được âm");
    }
    return this.repo.adminCreatePlan(payload);
  }

  /** Cập nhật plan (partial update) */
  updatePlan(
    id: string,
    payload: CandidatePlanUpdatePayload,
  ): Promise<CandidateSubscriptionPlan> {
    return this.repo.adminUpdatePlan(id, payload);
  }

  /** Toggle active */
  toggleActive(plan: CandidateSubscriptionPlan): Promise<CandidateSubscriptionPlan> {
    return this.repo.adminTogglePlan(plan.id, plan.active);
  }

  // ── Formatting ───────

  formatPrice(amount: number): string {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /** Format quota value: -1 → "Không giới hạn", otherwise number */
  formatQuota(value: number): string {
    return value === -1 ? "Không giới hạn" : value.toLocaleString();
  }
}