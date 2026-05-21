// D:\TLU_JOB_PLATFORM\frontend\src\application\services\CandidateSubscriptionService.ts

import type { ICandidateSubscriptionRepository } from "@/domain/repositories/ICandidateSubscriptionRepository";
import type {
  CandidateSubscriptionPlan,
  CandidateSubscription,
  CandidateQuotaResult,
  PurchaseRequest,
  PurchaseResult,
} from "@/domain/models/CandidateSubscription";

export class CandidateSubscriptionService {

  constructor(private readonly repo: ICandidateSubscriptionRepository) {}

  // ─── Plans (Public) ───

  /** Danh sách gói dịch vụ — dùng trên pricing page */
  getPlans(): Promise<CandidateSubscriptionPlan[]> {
    return this.repo.getPlans();
  }

  // ─── My Subscription ───

  /** Subscription hiện tại của candidate */
  getMySubscription(): Promise<CandidateSubscription | null> {
    return this.repo.getMySubscription();
  }

  /** Quota còn lại */
  getMyQuota(): Promise<CandidateQuotaResult> {
    return this.repo.getMyQuota();
  }

  // ─── Purchase ───

  /** Mua gói → nhận payment URL */
  purchase(data: PurchaseRequest): Promise<PurchaseResult> {
    if (!data.planId) {
      throw new Error("Vui lòng chọn gói dịch vụ");
    }
    return this.repo.purchase(data);
  }
}