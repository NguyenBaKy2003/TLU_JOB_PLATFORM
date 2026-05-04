// src/application/services/AdminSubscriptionService.ts
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";
import type {
  IAdminSubscriptionRepository,
  PlanPayload,
  AdminSubscriptionRow,
  PageResult,
} from "@/domain/repositories/IAdminSubscriptionRepository";

export class AdminSubscriptionService {
  constructor(private readonly repo: IAdminSubscriptionRepository) {}

  // ── Plans ────────────

  getAllPlans(): Promise<SubscriptionPlan[]> {
    return this.repo.adminGetAllPlans();
  }

  createPlan(payload: PlanPayload): Promise<SubscriptionPlan> {
    return this.repo.adminCreatePlan(payload);
  }

  updatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan> {
    return this.repo.adminUpdatePlan(id, payload);
  }

  // Nhận full plan để có thể truyền id (string) và active (boolean) đúng type —
  // không cần ép kiểu `as unknown as string` vì SubscriptionPlan.id là string.
  toggleActive(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    return this.repo.adminTogglePlan(plan.id, plan.active);
  }

  // ── Subscriptions ────

  listSubscriptions(
    page = 0,
    size = 20,
    status?: string,
  ): Promise<PageResult<AdminSubscriptionRow>> {
    return this.repo.adminListSubscriptions(page, size, status);
  }

  // ── Formatting ───────

  formatPrice(amount: number): string {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style:                 "currency",
      currency:              "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}