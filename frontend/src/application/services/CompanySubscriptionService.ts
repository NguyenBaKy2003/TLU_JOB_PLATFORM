// src/application/services/CompanySubscriptionService.ts

import type { ICompanySubscriptionRepository } from "@/domain/repositories/ICompanySubscriptionRepository";
import type {
  SubscriptionPlan,
  CompanySubscription,
  QuotaResult,
  PurchaseResult,
  PaymentGateway,
} from "@/domain/models/CompanySubscription";

export class CompanySubscriptionService {

  constructor(private readonly repo: ICompanySubscriptionRepository) {}

  getPlans(): Promise<SubscriptionPlan[]> {
    return this.repo.getPlans();
  }

  getMySubscription(): Promise<CompanySubscription | null> {
    return this.repo.getMySubscription();
  }

  getMyQuota(): Promise<QuotaResult> {
    return this.repo.getMyQuota();
  }

  purchaseMonthly(planId: string, gateway: PaymentGateway = "VNPAY"): Promise<PurchaseResult> {
    return this.repo.purchase({ planId, yearly: false, gateway });
  }

  purchaseYearly(planId: string, gateway: PaymentGateway = "VNPAY"): Promise<PurchaseResult> {
    return this.repo.purchase({ planId, yearly: true, gateway });
  }

  /**
   * Mua gói với gateway được chọn → redirect đến cổng thanh toán.
   */
  async purchaseAndRedirect(
    planId:  string,
    yearly:  boolean,
    gateway: PaymentGateway = "VNPAY",   // ← thêm param
  ): Promise<void> {
    const result = await this.repo.purchase({ planId, yearly, gateway });
    window.location.href = result.paymentUrl;
  }

  yearlyDiscount(plan: SubscriptionPlan): number {
    if (plan.priceMonthly === 0) return 0;
    const monthly12 = plan.priceMonthly * 12;
    return Math.round(((monthly12 - plan.priceYearly) / monthly12) * 100);
  }

  formatPrice(amount: number, currency = "VND"): string {
    if (amount === 0) return "Miễn phí";
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency", currency: "VND", maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  }
}