// src/domain/repositories/ICompanySubscriptionRepository.ts

import type {
  SubscriptionPlan,
  CompanySubscription,
  QuotaResult,
  PurchaseResult,
  PurchasePayload,
} from "@/domain/models/CompanySubscription";

export interface ICompanySubscriptionRepository {

  /** GET /api/v1/subscriptions/plans — public, trang pricing */
  getPlans(): Promise<SubscriptionPlan[]>;

  /** GET /api/v1/subscriptions/my — EMPLOYER: subscription hiện tại */
  getMySubscription(): Promise<CompanySubscription | null>;

  /** GET /api/v1/subscriptions/my/quota — EMPLOYER: quota còn lại */
  getMyQuota(): Promise<QuotaResult>;

  /**
   * POST /api/v1/subscriptions/purchase
   * Mua gói → nhận { payment, paymentUrl } → redirect user đến VNPay
   */
  purchase(payload: PurchasePayload): Promise<PurchaseResult>;
}