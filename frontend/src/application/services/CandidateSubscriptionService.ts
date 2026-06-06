// src/application/services/CandidateSubscriptionService.ts

import type { ICandidateSubscriptionRepository } from "@/domain/repositories/ICandidateSubscriptionRepository";
import type {
  CandidateSubscriptionPlan,
  CandidateSubscription,
  CandidateQuotaResult,
  PurchaseRequest,
  PurchaseResult,
} from "@/domain/models/CandidateSubscription";
import type { PaymentGateway } from "@/domain/models/CompanySubscription";

export class CandidateSubscriptionService {

  constructor(private readonly repo: ICandidateSubscriptionRepository) {}

  getPlans(): Promise<CandidateSubscriptionPlan[]> {
    return this.repo.getPlans();
  }

  getMySubscription(): Promise<CandidateSubscription | null> {
    return this.repo.getMySubscription();
  }

  getMyQuota(): Promise<CandidateQuotaResult> {
    return this.repo.getMyQuota();
  }

  /** Mua gói — truyền thêm gateway */
  purchase(data: PurchaseRequest & { gateway?: PaymentGateway }): Promise<PurchaseResult> {
    if (!data.planId) throw new Error("Vui lòng chọn gói dịch vụ");
    return this.repo.purchase({ ...data, gateway: data.gateway ?? "VNPAY" });
  }
}