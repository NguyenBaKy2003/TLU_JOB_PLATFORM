// src/application/services/CompanySubscriptionService.ts

import type { ICompanySubscriptionRepository } from "@/domain/repositories/ICompanySubscriptionRepository";
import type {
  SubscriptionPlan,
  CompanySubscription,
  QuotaResult,
  PurchaseResult,
} from "@/domain/models/CompanySubscription";

export class CompanySubscriptionService {

  constructor(private readonly repo: ICompanySubscriptionRepository) {}

  // ── Plans (public) ────────────────────────────────────────────────────────

  /** Tất cả gói đang active — dùng trên trang pricing */
  getPlans(): Promise<SubscriptionPlan[]> {
    return this.repo.getPlans();
  }

  // ── My subscription (employer) ────────────────────────────────────────────

  /** Subscription hiện tại — null nếu chưa mua */
  getMySubscription(): Promise<CompanySubscription | null> {
    return this.repo.getMySubscription();
  }

  /** Quota còn lại (job posts, featured, cv views) */
  getMyQuota(): Promise<QuotaResult> {
    return this.repo.getMyQuota();
  }

  // ── Purchase ──────────────────────────────────────────────────────────────

  /**
   * Mua gói theo tháng.
   * Trả về { paymentUrl } → caller redirect window.location.href = paymentUrl
   */
  purchaseMonthly(planId: string): Promise<PurchaseResult> {
    return this.repo.purchase({ planId, yearly: false });
  }

  /**
   * Mua gói theo năm (thường được giảm giá).
   */
  purchaseYearly(planId: string): Promise<PurchaseResult> {
    return this.repo.purchase({ planId, yearly: true });
  }

  /**
   * Mua gói với lựa chọn billing cycle.
   * Sau khi nhận paymentUrl → redirect ngay đến VNPay.
   */
  async purchaseAndRedirect(
    planId: string,
    yearly: boolean,
  ): Promise<void> {
    const result = await this.repo.purchase({ planId, yearly });
    window.location.href = result.paymentUrl;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Tính giá sau giảm giá yearly (thường -20%) */
  yearlyDiscount(plan: SubscriptionPlan): number {
    if (plan.priceMonthly === 0) return 0;
    const monthly12 = plan.priceMonthly * 12;
    return Math.round(((monthly12 - plan.priceYearly) / monthly12) * 100);
  }

  /** Format giá tiền VND */
  formatPrice(amount: number, currency = "VND"): string {
    if (amount === 0) return "Miễn phí";
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style:    "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style:    "currency",
      currency,
    }).format(amount);
  }
}