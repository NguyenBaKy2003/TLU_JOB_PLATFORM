// D:\TLU_JOB_PLATFORM\frontend\src\domain\repositories\ICandidateSubscriptionRepository.ts

import type {
  CandidateSubscriptionPlan,
  CandidateSubscription,
  CandidateQuotaResult,
  PurchaseRequest,
  PurchaseResult,
} from '../models/CandidateSubscription';

export interface ICandidateSubscriptionRepository {
  /** GET /api/v1/subscriptions/candidate/plans — Danh sách gói (public) */
  getPlans(): Promise<CandidateSubscriptionPlan[]>;

  /** GET /api/v1/subscriptions/candidate/my — Subscription hiện tại */
  getMySubscription(): Promise<CandidateSubscription | null>;

  /** GET /api/v1/subscriptions/candidate/my/quota — Quota còn lại */
  getMyQuota(): Promise<CandidateQuotaResult>;

  /** POST /api/v1/subscriptions/candidate/purchase — Mua gói */
  purchase(data: PurchaseRequest): Promise<PurchaseResult>;
}