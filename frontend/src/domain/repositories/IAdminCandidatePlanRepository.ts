// D:\TLU_JOB_PLATFORM\frontend\src\domain\repositories\IAdminCandidatePlanRepository.ts

import type {
  CandidateSubscriptionPlan,
  CandidatePlanPayload,
  CandidatePlanUpdatePayload,
} from '../models/CandidateSubscription';

export interface IAdminCandidatePlanRepository {
  /** GET /api/v1/admin/candidate-plans — Tất cả plan (kể cả inactive) */
  adminGetAllPlans(): Promise<CandidateSubscriptionPlan[]>;

  /** POST /api/v1/admin/candidate-plans — Tạo plan mới */
  adminCreatePlan(payload: CandidatePlanPayload): Promise<CandidateSubscriptionPlan>;

  /**
   * PATCH /api/v1/admin/candidate-plans/{id}
   * Partial update — chỉ gửi fields thay đổi
   */
  adminUpdatePlan(
    id: string,
    payload: CandidatePlanUpdatePayload,
  ): Promise<CandidateSubscriptionPlan>;

  /**
   * PATCH /api/v1/admin/candidate-plans/{id}  { active: !currentlyActive }
   * Toggle active flag
   */
  adminTogglePlan(id: string, currentlyActive: boolean): Promise<CandidateSubscriptionPlan>;
}