// D:\TLU_JOB_PLATFORM\frontend\src\infrastructure\repositories\CandidateSubscriptionRepository.ts

import api from "@/lib/axios";
import type { ICandidateSubscriptionRepository } from "@/domain/repositories/ICandidateSubscriptionRepository";
import type {
  CandidateSubscriptionPlan,
  CandidateSubscription,
  CandidateQuotaResult,
  PurchaseRequest,
  PurchaseResult,
} from "@/domain/models/CandidateSubscription";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}


export class CandidateSubscriptionRepository implements ICandidateSubscriptionRepository {
  private readonly BASE = "/subscriptions/candidate";

  /** GET /api/v1/subscriptions/candidate/plans */
  async getPlans(): Promise<CandidateSubscriptionPlan[]> {
    const res = await api.get<ApiResponse<CandidateSubscriptionPlan[]>>(
      `${this.BASE}/plans`
    );
    return res.data.data;
  }

  /** GET /api/v1/subscriptions/candidate/my */
  async getMySubscription(): Promise<CandidateSubscription | null> {
    const res = await api.get<ApiResponse<CandidateSubscription | string>>(
      `${this.BASE}/my`,
    );

    // Backend trả về string message nếu chưa có subscription
    if (typeof res.data.data === "string") return null;
    return res.data.data;
  }

  /** GET /api/v1/subscriptions/candidate/my/quota */
  async getMyQuota(): Promise<CandidateQuotaResult> {
    const res = await api.get<ApiResponse<CandidateQuotaResult>>(
      `${this.BASE}/my/quota`,
    );
    return res.data.data;
  }

  /** POST /api/v1/subscriptions/candidate/purchase */
  async purchase(data: PurchaseRequest): Promise<PurchaseResult> {
    const res = await api.post<ApiResponse<PurchaseResult>>(
      `${this.BASE}/purchase`,
      data,
    );
    return res.data.data;
  }
}